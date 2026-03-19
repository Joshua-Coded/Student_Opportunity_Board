"use client";

import {
  Box, Button, Flex, FormControl, FormLabel, FormErrorMessage,
  Heading, Input, Stack, Text, useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
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
      return;
    }
    toast({ title: "Account created! Please sign in.", status: "success", duration: 3000 });
    router.push("/login");
  }

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", _placeholder: { color: "gray.600" },
    _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" },
    borderRadius: "xl",
  };

  return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center" px={4} py={10}>
      <Box position="absolute" top="10%" right="20%" w="350px" h="350px" borderRadius="full"
        bgColor="blue.900" opacity={0.12} filter="blur(80px)" pointerEvents="none" />
      <Box w="full" maxW="sm" position="relative">
        <Box bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)"
          borderRadius="2xl" p={8} boxShadow="2xl">
          <Stack spacing={6}>
            <Stack spacing={1} textAlign="center">
              <Link href="/">
                <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)"
                  bgClip="text" cursor="pointer">OpportunityBoard</Heading>
              </Link>
              <Heading size="lg" color="white" mt={2}>Create account</Heading>
              <Text color="gray.500" fontSize="sm">Join thousands of students</Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {[
                  { label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
                  { label: "Email", key: "email", type: "email", placeholder: "you@university.edu" },
                  { label: "Password", key: "password", type: "password", placeholder: "Min. 8 characters" },
                  { label: "University", key: "university", type: "text", placeholder: "e.g. University of Lagos" },
                  { label: "Major", key: "major", type: "text", placeholder: "e.g. Computer Science" },
                ].map(({ label, key, type, placeholder }) => (
                  <FormControl key={key} isInvalid={!!errors[key]}>
                    <FormLabel color="gray.400" fontSize="sm">{label}</FormLabel>
                    <Input {...inputStyle} type={type} placeholder={placeholder}
                      value={(form as any)[key]} onChange={(e) => set(key, e.target.value)}
                      required={["name","email","password"].includes(key)} />
                    {errors[key] && <FormErrorMessage>{errors[key][0]}</FormErrorMessage>}
                  </FormControl>
                ))}

                <Button type="submit" isLoading={loading} w="full"
                  bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="xl" py={6}>
                  Create account
                </Button>
              </Stack>
            </form>

            <Flex justify="center">
              <Text color="gray.500" fontSize="sm">Already have an account?</Text>
              <Link href="/login">
                <Text color="purple.400" fontSize="sm" _hover={{ color: "purple.300" }} cursor="pointer" ml={1}>
                  Sign in
                </Text>
              </Link>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
