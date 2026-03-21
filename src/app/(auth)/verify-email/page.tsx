"use client";

import { Box, Button, Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((r) => r.json()).then((data) => {
      if (data.success) setStatus("success");
      else { setStatus("error"); setMessage(data.error || "Verification failed."); }
    }).catch(() => { setStatus("error"); setMessage("Something went wrong."); });
  }, [token]);

  return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box position="absolute" top="20%" left="30%" w="400px" h="400px" borderRadius="full"
        bgColor="purple.900" opacity={0.15} filter="blur(80px)" pointerEvents="none" />
      <Box w="full" maxW="sm" position="relative">
        <Box bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl" p={8} boxShadow="2xl" textAlign="center">
          <Stack spacing={6} align="center">
            <Link href="/">
              <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)"
                bgClip="text" cursor="pointer">OpportunityBoard</Heading>
            </Link>

            {status === "loading" && (
              <Stack spacing={3} align="center">
                <Spinner color="purple.400" size="lg" />
                <Text color="gray.400" fontSize="sm">Verifying your email...</Text>
              </Stack>
            )}

            {status === "success" && (
              <Stack spacing={4} align="center">
                <Text fontSize="4xl">✅</Text>
                <Heading size="md" color="white">Email verified!</Heading>
                <Text color="gray.400" fontSize="sm">Your account is now active. You can sign in.</Text>
                <Link href="/login">
                  <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }}
                    borderRadius="xl" px={8}>Sign in →</Button>
                </Link>
              </Stack>
            )}

            {status === "error" && (
              <Stack spacing={4} align="center">
                <Text fontSize="4xl">❌</Text>
                <Heading size="md" color="white">Verification failed</Heading>
                <Text color="gray.400" fontSize="sm">{message}</Text>
                <Link href="/register">
                  <Button variant="outline" borderColor="rgba(139,92,246,0.4)"
                    color="purple.300" _hover={{ bg: "rgba(139,92,246,0.1)" }}
                    borderRadius="xl" px={8}>Register again</Button>
                </Link>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
