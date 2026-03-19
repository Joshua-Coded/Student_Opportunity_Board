"use client";

import { Badge, Box, Button, Flex, Heading, Input, Spinner, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function CryptoPaymentModal({ opportunity, applicantId, applicantName, onClose }: {
  opportunity: any;
  applicantId: string;
  applicantName: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"select" | "pay" | "done">("select");
  const [currency, setCurrency] = useState("ETH");
  const [chain, setChain] = useState("ethereum");
  const [fromWallet, setFromWallet] = useState("");
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Live price state
  const [price, setPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", _placeholder: { color: "gray.600" },
    _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }, borderRadius: "xl",
  };

  // Fetch live price whenever currency changes
  useEffect(() => {
    setPriceLoading(true);
    setPrice(null);
    fetch(`/api/crypto/price?symbol=${currency}`)
      .then((r) => r.json())
      .then((d) => { if (d.usd) setPrice(d.usd); })
      .catch(() => {})
      .finally(() => setPriceLoading(false));
  }, [currency]);

  const cryptoAmount = parseFloat(opportunity.compensationAmount) || 0.01;

  // USD equivalent of the crypto amount
  const usdEquivalent = price ? (cryptoAmount * price).toLocaleString("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2,
  }) : null;

  // Crypto equivalent if opportunity is in USDC (stable) — just show as-is
  const isFiat = opportunity.compensationCurrency === "USDC";

  async function initiate() {
    setLoading(true); setError("");
    const res = await fetch("/api/payments/initiate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: opportunity.id, applicantId, amount: cryptoAmount, currency, chain }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setPayment(data); setStep("pay");
  }

  async function confirm() {
    if (!fromWallet.trim()) { setError("Enter your wallet address"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/payments/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.paymentId, fromWalletAddress: fromWallet }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setPayment((p: any) => ({ ...p, ...data })); setStep("done");
  }

  return (
    <Box position="fixed" inset={0} zIndex={200} display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box position="absolute" inset={0} bg="blackAlpha.800" backdropFilter="blur(8px)" onClick={onClose} />
      <Box position="relative" bg="#0d0d1a" border="1px solid rgba(255,255,255,0.1)"
        borderRadius="2xl" p={8} maxW="md" w="full" boxShadow="2xl">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="white">⚡ Crypto Payment</Heading>
          <Button size="xs" variant="ghost" color="gray.400" onClick={onClose}>✕</Button>
        </Flex>

        {step === "select" && (
          <Stack spacing={5}>
            {/* Opportunity info */}
            <Box bg="rgba(139,92,246,0.1)" border="1px solid rgba(139,92,246,0.2)" borderRadius="xl" p={4}>
              <Text color="gray.400" fontSize="xs" mb={1}>Paying</Text>
              <Text color="white" fontWeight="semibold" fontSize="sm">{applicantName}</Text>
              <Text color="gray.500" fontSize="xs" mt={0.5}>for: {opportunity.title}</Text>

              {opportunity.compensationAmount && (
                <Flex align="baseline" gap={2} mt={2} flexWrap="wrap">
                  <Text color="purple.300" fontWeight="bold" fontSize="xl">
                    {opportunity.compensationAmount} {opportunity.compensationCurrency}
                  </Text>
                  {/* Live USD equivalent */}
                  {currency !== "USDC" && (
                    <Text color="gray.500" fontSize="sm">
                      {priceLoading ? (
                        <Spinner size="xs" color="gray.600" />
                      ) : usdEquivalent ? (
                        `≈ ${usdEquivalent} USD`
                      ) : null}
                    </Text>
                  )}
                </Flex>
              )}
            </Box>

            {/* Currency selector */}
            <Stack spacing={2}>
              <Text color="gray.400" fontSize="sm">Pay with</Text>
              <Flex gap={2}>
                {["ETH", "USDC", "MATIC"].map((c) => (
                  <Button key={c} size="sm" onClick={() => setCurrency(c)}
                    bg={currency === c ? "purple.600" : "rgba(255,255,255,0.05)"}
                    color={currency === c ? "white" : "gray.400"}
                    border="1px solid" borderColor={currency === c ? "purple.500" : "rgba(255,255,255,0.1)"}
                    borderRadius="full" flex={1}>
                    {c}
                  </Button>
                ))}
              </Flex>

              {/* Live price ticker */}
              <Flex align="center" gap={2} h="20px">
                {priceLoading ? (
                  <Flex align="center" gap={2}>
                    <Spinner size="xs" color="purple.400" />
                    <Text color="gray.600" fontSize="xs">Fetching live price…</Text>
                  </Flex>
                ) : price ? (
                  <Text color="gray.500" fontSize="xs">
                    1 {currency} = ${price.toLocaleString("en-US")} USD
                    <Text as="span" color="gray.700"> · via CoinGecko</Text>
                  </Text>
                ) : (
                  <Text color="gray.700" fontSize="xs">Price unavailable</Text>
                )}
              </Flex>
            </Stack>

            {/* Network selector */}
            <Stack spacing={2}>
              <Text color="gray.400" fontSize="sm">Network</Text>
              <Flex gap={2}>
                {["ethereum", "polygon"].map((c) => (
                  <Button key={c} size="sm" onClick={() => setChain(c)}
                    bg={chain === c ? "blue.700" : "rgba(255,255,255,0.05)"}
                    color={chain === c ? "white" : "gray.400"}
                    border="1px solid" borderColor={chain === c ? "blue.500" : "rgba(255,255,255,0.1)"}
                    borderRadius="full" flex={1}>{c}</Button>
                ))}
              </Flex>
            </Stack>

            {error && (
              <Box bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.2)" borderRadius="lg" px={3} py={2}>
                <Text color="red.400" fontSize="sm">⚠ {error}</Text>
              </Box>
            )}

            <Button onClick={initiate} isLoading={loading}
              bgGradient="linear(to-r, purple.500, blue.500)" color="white"
              _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }} borderRadius="xl" py={5}>
              Continue →
            </Button>
          </Stack>
        )}

        {step === "pay" && payment && (
          <Stack spacing={5}>
            <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="xl" p={5}>
              <Text color="gray.500" fontSize="xs" mb={1}>Send exactly</Text>
              <Flex align="baseline" gap={2} flexWrap="wrap">
                <Text color="purple.300" fontWeight="bold" fontSize="2xl">
                  {payment.amount?.toString()} {payment.currency}
                </Text>
                {price && payment.currency !== "USDC" && (
                  <Text color="gray.500" fontSize="sm">
                    ≈ ${(parseFloat(payment.amount) * price).toLocaleString("en-US", { maximumFractionDigits: 2 })} USD
                  </Text>
                )}
              </Flex>

              <Box mt={4} pt={4} borderTop="1px solid rgba(255,255,255,0.06)">
                <Text color="gray.500" fontSize="xs" mb={1}>To wallet address</Text>
                <Text color="white" fontSize="xs" fontFamily="mono" wordBreak="break-all" bg="rgba(255,255,255,0.04)" p={2} borderRadius="lg">
                  {payment.toWalletAddress}
                </Text>
              </Box>

              <Badge colorScheme="yellow" borderRadius="full" mt={3} fontSize="xs" px={3}>
                Network: {payment.chain}
              </Badge>
            </Box>

            <Stack spacing={1}>
              <Text color="gray.400" fontSize="sm">Your sending wallet address</Text>
              <Input {...inputStyle} value={fromWallet} onChange={(e) => setFromWallet(e.target.value)}
                placeholder="0x..." fontFamily="mono" fontSize="sm" />
              <Text color="gray.700" fontSize="xs">Enter the wallet you&apos;re sending from, then click confirm</Text>
            </Stack>

            {error && (
              <Box bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.2)" borderRadius="lg" px={3} py={2}>
                <Text color="red.400" fontSize="sm">⚠ {error}</Text>
              </Box>
            )}

            <Button onClick={confirm} isLoading={loading}
              bgGradient="linear(to-r, green.500, teal.500)" color="white"
              _hover={{ bgGradient: "linear(to-r, green.400, teal.400)" }} borderRadius="xl" py={5}>
              Confirm Payment ✓
            </Button>
          </Stack>
        )}

        {step === "done" && (
          <Stack spacing={5} align="center" textAlign="center">
            <Text fontSize="5xl">✅</Text>
            <Heading size="md" color="white">Payment Confirmed!</Heading>
            <Text color="gray.500" fontSize="sm">
              {payment?.amount} {payment?.currency}
              {price && payment?.currency !== "USDC" && ` ≈ $${(parseFloat(payment.amount) * price).toLocaleString("en-US", { maximumFractionDigits: 2 })} USD`}
            </Text>
            {payment?.txHash && (
              <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="xl" p={4} w="full">
                <Text color="gray.500" fontSize="xs" mb={1}>Transaction Hash</Text>
                <Text color="green.300" fontSize="xs" fontFamily="mono" wordBreak="break-all">{payment.txHash}</Text>
              </Box>
            )}
            <Button onClick={onClose} bgGradient="linear(to-r, purple.500, blue.500)"
              color="white" borderRadius="xl" px={8}>
              Close
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
