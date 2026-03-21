"use client";

import {
  Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Something went wrong"); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", _placeholder: { color: "gray.600" },
    _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" },
    borderRadius: "xl",
  };

  return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box position="absolute" top="20%" right="25%" w="400px" h="400px" borderRadius="full"
        bgColor="blue.900" opacity={0.15} filter="blur(80px)" pointerEvents="none" />
      <Box w="full" maxW="sm" position="relative">
        <Box bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl" p={8} boxShadow="2xl">
          <Stack spacing={6}>
            <Stack spacing={1} textAlign="center">
              <Link href="/">
                <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)"
                  bgClip="text" cursor="pointer">OpportunityBoard</Heading>
              </Link>
              <Heading size="lg" color="white" mt={2}>Set new password</Heading>
              <Text color="gray.500" fontSize="sm">Choose a strong password for your account.</Text>
            </Stack>

            {!token && (
              <Box bg="rgba(239,68,68,0.08)" border="1px solid rgba(239,68,68,0.2)" borderRadius="xl" p={4}>
                <Text color="red.400" fontSize="sm" textAlign="center">Invalid reset link. Please request a new one.</Text>
              </Box>
            )}

            {done ? (
              <Box bg="rgba(34,197,94,0.08)" border="1px solid rgba(34,197,94,0.2)"
                borderRadius="xl" p={4} textAlign="center">
                <Text fontSize="2xl" mb={2}>✅</Text>
                <Text color="green.300" fontWeight="semibold" fontSize="sm">Password updated!</Text>
                <Text color="gray.500" fontSize="xs" mt={1}>Redirecting you to sign in...</Text>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.400" fontSize="sm">New Password</FormLabel>
                    <Input {...inputStyle} type="password" placeholder="Min. 8 characters"
                      value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="gray.400" fontSize="sm">Confirm Password</FormLabel>
                    <Input {...inputStyle} type="password" placeholder="Repeat your password"
                      value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                  </FormControl>
                  {error && (
                    <Box bg="rgba(239,68,68,0.08)" border="1px solid rgba(239,68,68,0.2)" borderRadius="xl" px={4} py={2}>
                      <Text color="red.400" fontSize="sm">{error}</Text>
                    </Box>
                  )}
                  <Button type="submit" isLoading={loading} isDisabled={!token} w="full"
                    bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                    transition="all 0.2s" borderRadius="xl" py={6}>
                    Update password
                  </Button>
                </Stack>
              </form>
            )}

            <Box textAlign="center">
              <Link href="/login">
                <Text color="purple.400" fontSize="sm" _hover={{ color: "purple.300" }} cursor="pointer">
                  ← Back to sign in
                </Text>
              </Link>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
