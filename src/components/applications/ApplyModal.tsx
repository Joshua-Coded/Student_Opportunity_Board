"use client";

import {
  Box, Button, Flex, Heading, Input, Stack, Text, Textarea, Badge,
} from "@chakra-ui/react";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: opportunity.id, coverLetter, portfolioUrl }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const msg = data.error?.coverLetter?.[0] || data.error || "Failed to submit application";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      return;
    }
    onSuccess();
  }

  return (
    <Box position="fixed" inset={0} zIndex={200} display="flex" alignItems="center" justifyContent="center">
      <Box position="absolute" inset={0} bg="blackAlpha.800" backdropFilter="blur(8px)" onClick={onClose} />
      <Box position="relative" bg="#0d0d1a" border="1px solid rgba(255,255,255,0.1)"
        borderRadius="2xl" p={8} maxW="lg" w="full" mx={4} shadow="2xl" maxH="90vh" overflow="auto">

        {/* Header */}
        <Flex justify="space-between" align="flex-start" mb={6}>
          <Stack gap={1}>
            <Heading size="md" color="white">Apply for this opportunity</Heading>
            <Text color="gray.500" fontSize="sm" noOfLines={1}>{opportunity.title}</Text>
          </Stack>
          <Button size="xs" variant="ghost" color="gray.500" onClick={onClose} ml={4}>✕</Button>
        </Flex>

        {/* Opportunity snapshot */}
        <Box bg="rgba(139,92,246,0.08)" border="1px solid rgba(139,92,246,0.2)"
          borderRadius="xl" p={4} mb={6}>
          <Flex gap={3} align="center">
            <Badge bg="rgba(139,92,246,0.2)" color="purple.300" borderRadius="full" px={2} fontSize="xs">
              {opportunity.type}
            </Badge>
            <Text color="gray.400" fontSize="xs">
              Posted by {opportunity.author?.name || "Anonymous"}
            </Text>
          </Flex>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack gap={5}>
            <Stack gap={1}>
              <Text color="gray.400" fontSize="sm" fontWeight="medium">
                Cover Letter <Text as="span" color="red.400">*</Text>
              </Text>
              <Text color="gray.600" fontSize="xs" mb={1}>
                Introduce yourself, explain why you're a great fit, and what value you bring.
              </Text>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={`Hi, I'm [your name] and I'd love to work on this opportunity...\n\nI bring experience in...\n\nI'm excited because...`}
                rows={8}
                required
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                _placeholder={{ color: "gray.700" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                borderRadius="xl"
                resize="none"
                fontSize="sm"
              />
              <Flex justify="flex-end">
                <Text fontSize="xs" color={coverLetter.length < 30 ? "red.400" : "gray.600"}>
                  {coverLetter.length} / 30 min chars
                </Text>
              </Flex>
            </Stack>

            <Stack gap={1}>
              <Text color="gray.400" fontSize="sm" fontWeight="medium">Portfolio / GitHub URL</Text>
              <Text color="gray.600" fontSize="xs" mb={1}>Optional but highly recommended.</Text>
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourname or https://yourportfolio.com"
                type="url"
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                _placeholder={{ color: "gray.700" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                borderRadius="xl"
                fontSize="sm"
              />
            </Stack>

            {error && (
              <Box bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.25)"
                borderRadius="xl" px={4} py={3}>
                <Text color="red.400" fontSize="sm">⚠ {error}</Text>
              </Box>
            )}

            <Flex gap={3} pt={2}>
              <Button flex={1} variant="outline" borderColor="rgba(255,255,255,0.1)"
                color="gray.400" _hover={{ bg: "rgba(255,255,255,0.05)" }}
                borderRadius="xl" onClick={onClose}>
                Cancel
              </Button>
              <Button flex={2} type="submit" loading={loading}
                bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                transition="all 0.2s" borderRadius="xl">
                Submit Application →
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
