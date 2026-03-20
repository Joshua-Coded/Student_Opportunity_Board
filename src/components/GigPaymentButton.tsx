"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  useDisclosure,
  useToast,
  Spinner,
  Box,
  Divider,
  Code,
  Avatar,
} from "@chakra-ui/react";
import {
  connectWallet,
  switchToSepolia,
  sendPaymentViaMetaMask,
  isMetaMaskInstalled,
  type TxParams,
} from "@/lib/web3";

interface GigPaymentButtonProps {
  opportunityId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  amountEth: string;
  currency: string;
  gigTitle: string;
  onSuccess?: (txHash: string) => void;
}

type Step =
  | "idle"
  | "connecting"
  | "preparing"
  | "confirming"
  | "sending"
  | "saving"
  | "done"
  | "error";

export default function GigPaymentButton({
  opportunityId,
  applicantId,
  applicantName,
  applicantAvatar,
  amountEth,
  currency,
  gigTitle,
  onSuccess,
}: GigPaymentButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [step, setStep] = useState<Step>("idle");
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [txParams, setTxParams] = useState<TxParams | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [toAddress, setToAddress] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleError(msg: string) {
    setErrorMsg(msg);
    setStep("error");
  }

  async function handleOpen() {
    onOpen();
    setStep("connecting");
    setErrorMsg(null);
    setTxHash(null);

    try {
      if (!isMetaMaskInstalled()) {
        handleError("MetaMask is not installed. Please install it from metamask.io");
        return;
      }

      // Step 1: Connect MetaMask wallet
      const account = await connectWallet();
      setConnectedAddress(account);
      await switchToSepolia();

      // Step 2: Initiate payment in DB — validates accepted applicant & gets their wallet
      setStep("preparing");
      const initiateRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          applicantId,
          amount: parseFloat(amountEth),
          currency: currency || "ETH",
          chain: "ethereum",
        }),
      });

      if (!initiateRes.ok) {
        const data = await initiateRes.json();
        handleError(data.error ?? "Failed to initiate payment.");
        return;
      }

      const initiated = await initiateRes.json();
      setPaymentId(initiated.paymentId);
      setToAddress(initiated.toWalletAddress);

      if (!initiated.toWalletAddress) {
        handleError(`${applicantName} hasn't added a wallet address yet.`);
        return;
      }

      // Step 3: Prepare unsigned tx via API
      const prepareRes = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: account,
          to: initiated.toWalletAddress,
          amount_eth: amountEth,
          note: gigTitle,
        }),
      });

      if (!prepareRes.ok) {
        const data = await prepareRes.json();
        handleError(data.error ?? "Failed to prepare transaction.");
        return;
      }

      const prepared = await prepareRes.json();
      setTxParams(prepared.txParams);
      setEstimatedFee(prepared.summary.estimated_fee_eth);
      setStep("confirming");
    } catch (err: any) {
      handleError(err.message ?? "Something went wrong.");
    }
  }

  async function handleConfirm() {
    if (!txParams || !paymentId || !connectedAddress) return;
    setStep("sending");

    try {
      // Step 4: MetaMask signs and broadcasts
      const hash = await sendPaymentViaMetaMask(txParams);
      setTxHash(hash);

      // Step 5: Confirm payment in DB with real txHash
      setStep("saving");
      await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          fromWalletAddress: connectedAddress,
          txHash: hash,
        }),
      });

      setStep("done");
      onSuccess?.(hash);
      toast({
        title: "Payment confirmed!",
        description: `Paid ${amountEth} ETH to ${applicantName}`,
        status: "success",
        duration: 8000,
        isClosable: true,
      });
    } catch (err: any) {
      if (err.code === 4001) {
        handleError("Transaction rejected in MetaMask.");
      } else {
        handleError(err.message ?? "Transaction failed.");
      }
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("idle");
      setTxParams(null);
      setEstimatedFee(null);
      setTxHash(null);
      setErrorMsg(null);
      setPaymentId(null);
      setToAddress(null);
    }, 300);
  }

  return (
    <>
      <Button
        size="sm"
        colorScheme="purple"
        onClick={handleOpen}
        leftIcon={<span>🦊</span>}
        borderRadius="lg"
        fontWeight="bold"
      >
        Pay {applicantName.split(" ")[0]}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="gray.900" border="1px solid" borderColor="purple.500">
          <ModalHeader color="white">Pay for Gig</ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Recipient */}
              <Box bg="gray.800" p={3} rounded="md">
                <HStack spacing={3}>
                  <Avatar size="sm" name={applicantName} src={applicantAvatar} bg="purple.600" />
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="semibold" fontSize="sm">
                      {applicantName}
                    </Text>
                    <Text color="gray.500" fontSize="xs">
                      {gigTitle}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Amount */}
              <HStack justify="space-between">
                <Text color="gray.400">Payment amount</Text>
                <Text color="white" fontWeight="bold" fontSize="lg">
                  {amountEth} {currency || "ETH"}
                </Text>
              </HStack>

              {toAddress && (
                <HStack justify="space-between">
                  <Text color="gray.400">To wallet</Text>
                  <Code colorScheme="purple" fontSize="xs">
                    {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
                  </Code>
                </HStack>
              )}

              <Divider borderColor="gray.700" />

              {/* Connecting / Preparing */}
              {(step === "connecting" || step === "preparing") && (
                <HStack justify="center" py={4}>
                  <Spinner color="purple.400" size="sm" />
                  <Text color="gray.300" fontSize="sm">
                    {step === "connecting"
                      ? "Connecting MetaMask..."
                      : "Preparing transaction..."}
                  </Text>
                </HStack>
              )}

              {/* Confirming */}
              {step === "confirming" && (
                <VStack spacing={3} align="stretch">
                  {connectedAddress && (
                    <HStack justify="space-between">
                      <Text color="gray.400" fontSize="sm">From</Text>
                      <Code colorScheme="green" fontSize="xs">
                        {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                      </Code>
                    </HStack>
                  )}
                  {estimatedFee && (
                    <HStack justify="space-between">
                      <Text color="gray.400" fontSize="sm">Est. gas fee</Text>
                      <Text color="yellow.300" fontSize="sm">
                        ~{parseFloat(estimatedFee).toFixed(6)} ETH
                      </Text>
                    </HStack>
                  )}
                  <Badge colorScheme="purple" textAlign="center" py={1} borderRadius="md">
                    MetaMask will ask you to confirm
                  </Badge>
                </VStack>
              )}

              {/* Sending / Saving */}
              {(step === "sending" || step === "saving") && (
                <HStack justify="center" py={4}>
                  <Spinner color="purple.400" size="sm" />
                  <Text color="gray.300" fontSize="sm">
                    {step === "sending"
                      ? "Broadcasting transaction..."
                      : "Saving confirmation..."}
                  </Text>
                </HStack>
              )}

              {/* Done */}
              {step === "done" && txHash && (
                <VStack spacing={3}>
                  <Text fontSize="2xl">✅</Text>
                  <Text color="green.400" fontWeight="bold">
                    Payment sent to {applicantName.split(" ")[0]}!
                  </Text>
                  <Code colorScheme="green" fontSize="xs" wordBreak="break-all" p={2} rounded="md">
                    {txHash}
                  </Code>
                  <Button
                    as="a"
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="lg"
                  >
                    View on Etherscan ↗
                  </Button>
                </VStack>
              )}

              {/* Error */}
              {step === "error" && (
                <VStack spacing={2}>
                  <Text color="red.400" fontWeight="bold">
                    Payment failed
                  </Text>
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    {errorMsg}
                  </Text>
                </VStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter gap={2}>
            {step === "confirming" && (
              <Button colorScheme="purple" onClick={handleConfirm} leftIcon={<span>🦊</span>}>
                Confirm in MetaMask
              </Button>
            )}
            {step === "error" && (
              <Button colorScheme="purple" variant="outline" onClick={handleOpen}>
                Retry
              </Button>
            )}
            <Button variant="ghost" color="gray.400" onClick={handleClose}>
              {step === "done" ? "Close" : "Cancel"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
