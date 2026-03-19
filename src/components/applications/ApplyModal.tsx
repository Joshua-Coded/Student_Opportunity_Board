"use client";

import { Badge, Box, Button, Flex, Heading, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  opportunity: { id: string; title: string; type: string; author?: { name?: string } };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ opportunity, onClose, onSuccess }: Props) {
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", _placeholder: { color: "gray.700" },
    _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }, borderRadius: "xl",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/applications", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: opportunity.id, coverLetter, portfolioUrl }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      const msg = data.error?.coverLetter?.[0] || data.error || "Failed to submit";
      setError(typeof msg === "string" ? msg : "Please check your inputs");
      return;
    }
    onSuccess();
  }

  return (
    <Box position="fixed" inset={0} zIndex={200} display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box position="absolute" inset={0} bg="blackAlpha.800" backdropFilter="blur(8px)" onClick={onClose} />
      <Box position="relative" bg="#0d0d1a" border="1px solid rgba(255,255,255,0.1)"
        borderRadius="2xl" p={8} maxW="lg" w="full" boxShadow="2xl" maxH="90vh" overflowY="auto">
        <Flex justify="space-between" align="flex-start" mb={6}>
          <Stack spacing={1}>
            <Heading size="md" color="white">Apply for opportunity</Heading>
            <Text color="gray.500" fontSize="sm" noOfLines={1}>{opportunity.title}</Text>
          </Stack>
          <Button size="xs" variant="ghost" color="gray.500" onClick={onClose} ml={4}>✕</Button>
        </Flex>

        <Box bg="rgba(139,92,246,0.08)" border="1px solid rgba(139,92,246,0.2)"
          borderRadius="xl" p={4} mb={6}>
          <Flex gap={3} align="center">
            <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="xs">{opportunity.type}</Badge>
            <Text color="gray.400" fontSize="xs">by {opportunity.author?.name || "Anonymous"}</Text>
          </Flex>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={5}>
            <Stack spacing={1}>
              <Text color="gray.400" fontSize="sm" fontWeight="medium">Cover Letter <Text as="span" color="red.400">*</Text></Text>
              <Text color="gray.600" fontSize="xs">Introduce yourself and explain why you&apos;re a great fit.</Text>
              <Textarea {...inputStyle} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={`Hi, I'm [your name]...\n\nI bring experience in...\n\nI'm excited because...`}
                rows={7} required resize="none" />
              <Text fontSize="xs" color={coverLetter.length < 30 ? "red.400" : "gray.600"} textAlign="right">
                {coverLetter.length} chars (30 min)
              </Text>
            </Stack>

            <Stack spacing={1}>
              <Text color="gray.400" fontSize="sm" fontWeight="medium">Portfolio / GitHub URL</Text>
              <Input {...inputStyle} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/you or https://portfolio.com" type="url" />
            </Stack>

            {error && (
              <Box bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.25)" borderRadius="xl" px={4} py={3}>
                <Text color="red.400" fontSize="sm">⚠ {error}</Text>
              </Box>
            )}

            <Flex gap={3}>
              <Button flex={1} variant="outline" borderColor="rgba(255,255,255,0.1)"
                color="gray.400" _hover={{ bg: "rgba(255,255,255,0.05)" }} borderRadius="xl" onClick={onClose}>
                Cancel
              </Button>
              <Button flex={2} type="submit" isLoading={loading}
                bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }} borderRadius="xl">
                Submit Application →
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
