"use client";

import {
  Box, Button, Flex, FormControl, FormLabel, Heading, Input, Stack, Text, useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box position="absolute" top="20%" left="30%" w="400px" h="400px" borderRadius="full"
        bgColor="purple.900" opacity={0.15} filter="blur(80px)" pointerEvents="none" />
      <Box w="full" maxW="sm" position="relative">
        <Box bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl" p={8} boxShadow="2xl">
          <Stack spacing={6}>
            <Stack spacing={1} textAlign="center">
              <Link href="/">
                <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)"
                  bgClip="text" cursor="pointer">OpportunityBoard</Heading>
              </Link>
              <Heading size="lg" color="white" mt={2}>Forgot password?</Heading>
              <Text color="gray.500" fontSize="sm">
                {sent ? "Check your email for a reset link." : "Enter your email and we'll send you a reset link."}
              </Text>
            </Stack>

            {!sent ? (
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.400" fontSize="sm">Email</FormLabel>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)}
                      type="email" placeholder="you@university.edu" required
                      bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                      color="white" _placeholder={{ color: "gray.600" }}
                      _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                      borderRadius="xl" />
                  </FormControl>
                  <Button type="submit" isLoading={loading} w="full"
                    bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                    transition="all 0.2s" borderRadius="xl" py={6}>
                    Send reset link
                  </Button>
                </Stack>
              </form>
            ) : (
              <Box bg="rgba(34,197,94,0.08)" border="1px solid rgba(34,197,94,0.2)"
                borderRadius="xl" p={4} textAlign="center">
                <Text fontSize="2xl" mb={2}>📬</Text>
                <Text color="green.300" fontWeight="semibold" fontSize="sm">Reset link sent!</Text>
                <Text color="gray.500" fontSize="xs" mt={1}>Check your inbox and follow the link. It expires in 1 hour.</Text>
              </Box>
            )}

            <Flex justify="center">
              <Link href="/login">
                <Text color="purple.400" fontSize="sm" _hover={{ color: "purple.300" }} cursor="pointer">
                  ← Back to sign in
                </Text>
              </Link>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
