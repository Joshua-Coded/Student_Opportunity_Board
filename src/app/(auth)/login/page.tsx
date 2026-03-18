"use client";

import {
  Box, Button, Container, Flex, Heading, Input, Stack, Text, Link as ChakraLink,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
      <Box position="absolute" top="20%" left="30%" w="400px" h="400px" borderRadius="full"
        bg="purple.600" opacity={0.06} filter="blur(80px)" pointerEvents="none" />

      <Container maxW="sm" position="relative">
        <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl" p={8} shadow="2xl">
          <Stack gap={6}>
            <Stack gap={1} textAlign="center">
              <Link href="/">
                <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)"
                  bgClip="text" cursor="pointer">OpportunityBoard</Heading>
              </Link>
              <Heading size="lg" color="white">Welcome back</Heading>
              <Text color="gray.500" fontSize="sm">Sign in to your account</Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Stack gap={1}>
                  <Text color="gray.400" fontSize="sm">Email</Text>
                  <Input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu" required
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _placeholder={{ color: "gray.600" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                    borderRadius="xl" px={4} py={5}
                  />
                </Stack>
                <Stack gap={1}>
                  <Text color="gray.400" fontSize="sm">Password</Text>
                  <Input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _placeholder={{ color: "gray.600" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                    borderRadius="xl" px={4} py={5}
                  />
                </Stack>

                {error && (
                  <Box bg="red.900" border="1px solid" borderColor="red.700"
                    borderRadius="lg" px={4} py={2}>
                    <Text color="red.300" fontSize="sm">{error}</Text>
                  </Box>
                )}

                <Button type="submit" loading={loading}
                  bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="xl" py={5} fontSize="sm">
                  Sign in
                </Button>
              </Stack>
            </form>

            <Flex justify="center" gap={1}>
              <Text color="gray.500" fontSize="sm">Don&apos;t have an account?</Text>
              <Link href="/register">
                <Text color="purple.400" fontSize="sm" _hover={{ color: "purple.300" }} cursor="pointer">
                  Sign up
                </Text>
              </Link>
            </Flex>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
