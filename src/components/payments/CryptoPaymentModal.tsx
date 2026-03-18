"use client";

import {
  Box, Button, Flex, Heading, Input, Stack, Text, Badge,
} from "@chakra-ui/react";
import { useState } from "react";

export default function CryptoPaymentModal({
  opportunity, onClose,
}: {
  opportunity: any;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"select" | "pay" | "done">("select");
  const [currency, setCurrency] = useState("ETH");
  const [chain, setChain] = useState("ethereum");
  const [fromWallet, setFromWallet] = useState("");
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function initiate() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId: opportunity.id,
        amount: parseFloat(opportunity.compensationAmount) || 0.01,
        currency, chain,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed to initiate payment"); return; }
    setPayment(data);
    setStep("pay");
  }

  async function confirm() {
    if (!fromWallet.trim()) { setError("Enter your wallet address"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.paymentId, fromWalletAddress: fromWallet }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Confirmation failed"); return; }
    setPayment((prev: any) => ({ ...prev, ...data }));
    setStep("done");
  }

  return (
    <Box position="fixed" inset={0} zIndex={200} display="flex" alignItems="center" justifyContent="center">
      <Box position="absolute" inset={0} bg="blackAlpha.800" backdropFilter="blur(8px)" onClick={onClose} />
      <Box position="relative" bg="gray.900" border="1px solid rgba(255,255,255,0.1)"
        borderRadius="2xl" p={8} maxW="md" w="full" mx={4} shadow="2xl">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="white">⚡ Crypto Payment</Heading>
          <Button size="xs" variant="ghost" color="gray.400" onClick={onClose}>✕</Button>
        </Flex>

        {step === "select" && (
          <Stack gap={5}>
            <Box bg="rgba(139,92,246,0.1)" border="1px solid rgba(139,92,246,0.2)" borderRadius="xl" p={4}>
              <Text color="gray.300" fontSize="sm">Paying for:</Text>
              <Text color="white" fontWeight="semibold">{opportunity.title}</Text>
              {opportunity.compensationAmount && (
                <Text color="purple.300" fontWeight="bold" fontSize="lg" mt={1}>
                  {opportunity.compensationAmount} {opportunity.compensationCurrency}
                </Text>
              )}
            </Box>
            <Stack gap={2}>
              <Text color="gray.400" fontSize="sm">Select Currency</Text>
              <Flex gap={2}>
                {["ETH", "USDC", "MATIC"].map((c) => (
                  <Button key={c} size="sm" onClick={() => setCurrency(c)}
                    bg={currency === c ? "purple.600" : "rgba(255,255,255,0.05)"}
                    color={currency === c ? "white" : "gray.400"}
                    border="1px solid" borderColor={currency === c ? "purple.500" : "rgba(255,255,255,0.1)"}
                    borderRadius="full">{c}</Button>
                ))}
              </Flex>
            </Stack>
            <Stack gap={2}>
              <Text color="gray.400" fontSize="sm">Select Network</Text>
              <Flex gap={2}>
                {["ethereum", "polygon"].map((c) => (
                  <Button key={c} size="sm" onClick={() => setChain(c)}
                    bg={chain === c ? "blue.700" : "rgba(255,255,255,0.05)"}
                    color={chain === c ? "white" : "gray.400"}
                    border="1px solid" borderColor={chain === c ? "blue.500" : "rgba(255,255,255,0.1)"}
                    borderRadius="full">{c}</Button>
                ))}
              </Flex>
            </Stack>
            {error && <Text color="red.400" fontSize="sm">{error}</Text>}
            <Button onClick={initiate} loading={loading}
              bgGradient="linear(to-r, purple.500, blue.500)" color="white"
              _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }}
              borderRadius="xl" py={5}>Continue →</Button>
          </Stack>
        )}

        {step === "pay" && payment && (
          <Stack gap={5}>
            <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="xl" p={4}>
              <Text color="gray.400" fontSize="xs" mb={1}>Send exactly:</Text>
              <Text color="purple.300" fontWeight="bold" fontSize="xl">
                {payment.amount?.toString()} {payment.currency}
              </Text>
              <Text color="gray.400" fontSize="xs" mt={3} mb={1}>To wallet address:</Text>
              <Text color="white" fontSize="xs" fontFamily="mono" wordBreak="break-all">
                {payment.toWalletAddress}
              </Text>
              <Badge mt={2} colorScheme="yellow" borderRadius="full" fontSize="xs">Network: {payment.chain}</Badge>
            </Box>
            <Stack gap={1}>
              <Text color="gray.400" fontSize="sm">Your wallet address (to confirm)</Text>
              <Input value={fromWallet} onChange={(e) => setFromWallet(e.target.value)}
                placeholder="0x..." bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                color="white" _placeholder={{ color: "gray.600" }}
                _focus={{ borderColor: "purple.500" }} borderRadius="xl" fontFamily="mono" fontSize="sm" />
            </Stack>
            {error && <Text color="red.400" fontSize="sm">{error}</Text>}
            <Button onClick={confirm} loading={loading}
              bgGradient="linear(to-r, green.500, teal.500)" color="white"
              _hover={{ bgGradient: "linear(to-r, green.400, teal.400)" }}
              borderRadius="xl" py={5}>Confirm Payment ✓</Button>
          </Stack>
        )}

        {step === "done" && (
          <Stack gap={5} align="center" textAlign="center">
            <Text fontSize="4xl">✅</Text>
            <Heading size="md" color="white">Payment Confirmed!</Heading>
            <Text color="gray.400" fontSize="sm">Your payment has been recorded on-chain.</Text>
            {payment?.txHash && (
              <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)"
                borderRadius="xl" p={4} w="full">
                <Text color="gray.400" fontSize="xs" mb={1}>Transaction Hash:</Text>
                <Text color="green.300" fontSize="xs" fontFamily="mono" wordBreak="break-all">
                  {payment.txHash}
                </Text>
              </Box>
            )}
            <Button onClick={onClose} bgGradient="linear(to-r, purple.500, blue.500)" color="white"
              borderRadius="xl" px={8}>Close</Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
