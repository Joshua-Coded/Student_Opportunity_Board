"use client";

import {
  Box, Button, Flex, FormControl, FormLabel, Heading,
  Input, Stack, Text, useToast,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    setResent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setUnverified(false);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error === "EMAIL_NOT_VERIFIED") {
      setUnverified(true);
    } else if (res?.error) {
      toast({ title: t.auth.invalidEmail, status: "error", duration: 3000, isClosable: true });
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box position="absolute" top="20%" left="30%" w="400px" h="400px" borderRadius="full"
        bgColor="purple.900" opacity={0.15} filter="blur(80px)" pointerEvents="none" />
      <Box w="full" maxW="sm" position="relative">
        <Flex justify="flex-end" mb={3}>
          <LanguageToggle />
        </Flex>
        <Box bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl" p={8} boxShadow="2xl">
          <Stack spacing={6}>
            <Stack spacing={1} textAlign="center">
              <Link href="/">
                <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)"
                  bgClip="text" cursor="pointer">OpportunityBoard</Heading>
              </Link>
              <Heading size="lg" color="white" mt={2}>{t.auth.welcomeBack}</Heading>
              <Text color="gray.500" fontSize="sm">{t.auth.signInToAccount}</Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel color="gray.400" fontSize="sm">{t.auth.email}</FormLabel>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)}
                    type="email" placeholder="you@university.edu" required
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _placeholder={{ color: "gray.600" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                    borderRadius="xl" />
                </FormControl>
                <FormControl>
                  <Flex justify="space-between" align="center">
                    <FormLabel color="gray.400" fontSize="sm" mb={0}>{t.auth.password}</FormLabel>
                    <Link href="/forgot-password">
                      <Text color="purple.400" fontSize="xs" _hover={{ color: "purple.300" }} cursor="pointer">{t.auth.forgotPassword}</Text>
                    </Link>
                  </Flex>
                  <Input value={password} onChange={(e) => setPassword(e.target.value)}
                    type="password" placeholder="••••••••" required
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _placeholder={{ color: "gray.600" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                    borderRadius="xl" />
                </FormControl>
                {unverified && (
                  <Box bg="rgba(234,179,8,0.08)" border="1px solid rgba(234,179,8,0.25)" borderRadius="xl" px={4} py={3}>
                    <Text color="yellow.300" fontSize="sm" fontWeight="semibold">{t.auth.checkEmailVerify}</Text>
                    <Text color="gray.400" fontSize="xs" mt={1} mb={2}>{t.auth.checkEmailDesc}</Text>
                    {resent ? (
                      <Text color="green.300" fontSize="xs">{t.auth.newVerificationSent}</Text>
                    ) : (
                      <Button size="xs" onClick={handleResend} isLoading={resending}
                        bg="rgba(234,179,8,0.15)" color="yellow.300"
                        border="1px solid rgba(234,179,8,0.3)"
                        _hover={{ bg: "rgba(234,179,8,0.25)" }} borderRadius="lg">
                        {t.auth.resendVerification}
                      </Button>
                    )}
                  </Box>
                )}
                <Button type="submit" isLoading={loading} w="full"
                  bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="xl" py={6}>
                  {t.auth.signIn}
                </Button>
              </Stack>
            </form>

            <Flex justify="center" gap={1}>
              <Text color="gray.500" fontSize="sm">{t.auth.noAccount}</Text>
              <Link href="/register">
                <Text color="purple.400" fontSize="sm" _hover={{ color: "purple.300" }} cursor="pointer" ml={1}>
                  {t.auth.signUp}
                </Text>
              </Link>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
