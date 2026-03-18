"use client";

import {
  Box, Button, Container, Flex, Heading, Input, Stack, Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", university: "", major: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(data.error || {});
    } else {
      router.push("/login?registered=1");
    }
  }

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <Stack gap={1}>
      <Text color="gray.400" fontSize="sm">{label}</Text>
      <Input
        type={type} value={(form as any)[key]} onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
        color="white" _placeholder={{ color: "gray.600" }}
        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
        borderRadius="xl" px={4} py={5}
      />
      {errors[key] && <Text color="red.400" fontSize="xs">{errors[key][0]}</Text>}
    </Stack>
  );

  return (
    <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center" py={10}>
      <Box position="absolute" top="10%" right="20%" w="350px" h="350px" borderRadius="full"
        bg="blue.600" opacity={0.06} filter="blur(80px)" pointerEvents="none" />

      <Container maxW="sm" position="relative">
        <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl" p={8} shadow="2xl">
          <Stack gap={6}>
            <Stack gap={1} textAlign="center">
              <Link href="/">
                <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)"
                  bgClip="text" cursor="pointer">OpportunityBoard</Heading>
              </Link>
              <Heading size="lg" color="white">Create account</Heading>
              <Text color="gray.500" fontSize="sm">Join thousands of students</Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                {field("Full Name", "name", "text", "Your name")}
                {field("Email", "email", "email", "you@university.edu")}
                {field("Password", "password", "password", "Min. 8 characters")}
                {field("University", "university", "text", "e.g. University of Lagos")}
                {field("Major", "major", "text", "e.g. Computer Science")}

                {errors.general && (
                  <Box bg="red.900" border="1px solid" borderColor="red.700" borderRadius="lg" px={4} py={2}>
                    <Text color="red.300" fontSize="sm">{errors.general[0]}</Text>
                  </Box>
                )}

                <Button type="submit" loading={loading}
                  bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="xl" py={5} fontSize="sm">
                  Create account
                </Button>
              </Stack>
            </form>

            <Flex justify="center" gap={1}>
              <Text color="gray.500" fontSize="sm">Already have an account?</Text>
              <Link href="/login">
                <Text color="purple.400" fontSize="sm" _hover={{ color: "purple.300" }} cursor="pointer">
                  Sign in
                </Text>
              </Link>
            </Flex>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
