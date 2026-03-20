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
} from "@chakra-ui/react";
import {
  connectWallet,
  getConnectedAccount,
  switchToSepolia,
  sendPaymentViaMetaMask,
  isMetaMaskInstalled,
  type TxParams,
} from "@/lib/web3";

interface PaymentButtonProps {
  // Recipient address (the student/freelancer being paid)
  recipientAddress: string;
  // Amount in ETH as a string e.g. "0.05"
  amountEth: string;
  // Display label e.g. "UI Design Gig"
  gigTitle: string;
  // Called with the tx hash after successful payment
  onSuccess?: (txHash: string) => void;
  // Optional extra label on button
  label?: string;
}

type Step = "idle" | "connecting" | "preparing" | "confirming" | "sending" | "done" | "error";

export default function PaymentButton({
  recipientAddress,
  amountEth,
  gigTitle,
  onSuccess,
  label = "Pay with MetaMask",
}: PaymentButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [step, setStep] = useState<Step>("idle");
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [txParams, setTxParams] = useState<TxParams | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
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

      // Connect wallet
      const account = await connectWallet();
      setConnectedAddress(account);

      // Switch to Sepolia
      await switchToSepolia();

      // Prepare the transaction via API
      setStep("preparing");
      const res = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: account,
          to: recipientAddress,
          amount_eth: amountEth,
          note: gigTitle,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        handleError(data.error ?? "Failed to prepare transaction.");
        return;
      }

      const data = await res.json();
      setTxParams(data.txParams);
      setEstimatedFee(data.summary.estimated_fee_eth);
      setStep("confirming");
    } catch (err: any) {
      handleError(err.message ?? "Something went wrong.");
    }
  }

  async function handleConfirm() {
    if (!txParams) return;
    setStep("sending");

    try {
      const hash = await sendPaymentViaMetaMask(txParams);
      setTxHash(hash);
      setStep("done");
      onSuccess?.(hash);
      toast({
        title: "Payment sent!",
        description: `Tx: ${hash.slice(0, 10)}...`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });
    } catch (err: any) {
      // User rejected = code 4001
      if (err.code === 4001) {
        handleError("Transaction rejected in MetaMask.");
      } else {
        handleError(err.message ?? "Transaction failed.");
      }
    }
  }

  function handleClose() {
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setStep("idle");
      setTxParams(null);
      setEstimatedFee(null);
      setTxHash(null);
      setErrorMsg(null);
    }, 300);
  }

  return (
    <>
      <Button
        colorScheme="purple"
        onClick={handleOpen}
        leftIcon={<span>🦊</span>}
        size="md"
        fontWeight="bold"
      >
        {label}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="gray.900" border="1px solid" borderColor="purple.500">
          <ModalHeader color="white">Pay for Gig</ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Gig info */}
              <Box bg="gray.800" p={3} rounded="md">
                <Text color="gray.400" fontSize="sm">
                  Gig
                </Text>
                <Text color="white" fontWeight="bold">
                  {gigTitle}
                </Text>
              </Box>

              {/* Amount */}
              <HStack justify="space-between">
                <Text color="gray.400">Amount</Text>
                <Text color="white" fontWeight="bold" fontSize="lg">
                  {amountEth} ETH
                </Text>
              </HStack>

              {/* Recipient */}
              <HStack justify="space-between">
                <Text color="gray.400">To</Text>
                <Code colorScheme="purple" fontSize="xs">
                  {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                </Code>
              </HStack>

              <Divider borderColor="gray.700" />

              {/* Step: Connecting */}
              {(step === "connecting" || step === "preparing") && (
                <HStack justify="center" py={4}>
                  <Spinner color="purple.400" />
                  <Text color="gray.300">
                    {step === "connecting"
                      ? "Connecting MetaMask..."
                      : "Preparing transaction..."}
                  </Text>
                </HStack>
              )}

              {/* Step: Confirming */}
              {step === "confirming" && (
                <VStack spacing={3} align="stretch">
                  {connectedAddress && (
                    <HStack justify="space-between">
                      <Text color="gray.400">From</Text>
                      <Code colorScheme="green" fontSize="xs">
                        {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                      </Code>
                    </HStack>
                  )}
                  {estimatedFee && (
                    <HStack justify="space-between">
                      <Text color="gray.400">Est. gas fee</Text>
                      <Text color="yellow.300" fontSize="sm">
                        ~{parseFloat(estimatedFee).toFixed(6)} ETH
                      </Text>
                    </HStack>
                  )}
                  <Badge colorScheme="purple" textAlign="center" py={1}>
                    MetaMask will ask you to confirm
                  </Badge>
                </VStack>
              )}

              {/* Step: Sending */}
              {step === "sending" && (
                <HStack justify="center" py={4}>
                  <Spinner color="purple.400" />
                  <Text color="gray.300">Waiting for confirmation...</Text>
                </HStack>
              )}

              {/* Step: Done */}
              {step === "done" && txHash && (
                <VStack spacing={2}>
                  <Text color="green.400" fontWeight="bold" fontSize="lg">
                    Payment sent!
                  </Text>
                  <Text color="gray.400" fontSize="xs">
                    Tx Hash:
                  </Text>
                  <Code colorScheme="green" fontSize="xs" wordBreak="break-all">
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
                  >
                    View on Etherscan
                  </Button>
                </VStack>
              )}

              {/* Step: Error */}
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
