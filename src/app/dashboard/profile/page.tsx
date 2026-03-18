"use client";

import {
  Box, Button, Flex, Heading, Input, Stack, Text, Textarea, Avatar, Badge, Container,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Browse", href: "/opportunities", icon: "🔍" },
  { label: "Post New", href: "/opportunities/new", icon: "➕" },
  { label: "Profile", href: "/dashboard/profile", icon: "👤" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: "", bio: "", university: "", major: "", graduationYear: "", walletAddress: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      setForm({
        name: data.name || "",
        bio: data.bio || "",
        university: data.university || "",
        major: data.major || "",
        graduationYear: data.graduationYear?.toString() || "",
        walletAddress: data.walletAddress || "",
      });
      setLoading(false);
    });
  }, [status]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaved(false);
    const payload: any = { ...form };
    if (form.graduationYear) payload.graduationYear = parseInt(form.graduationYear);
    else delete payload.graduationYear;

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErrors(data.error || {}); return; }
    setProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", _placeholder: { color: "gray.600" },
    _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" },
    borderRadius: "xl",
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.950" color="white">
      <Flex minH="100vh">

        {/* Sidebar */}
        <Box w="220px" flexShrink={0} bg="rgba(255,255,255,0.02)"
          borderRight="1px solid rgba(255,255,255,0.06)"
          display={{ base: "none", md: "flex" }} flexDir="column" py={6} px={4} gap={8}
          position="sticky" top={0} h="100vh">
          <Link href="/">
            <Heading size="sm" bgGradient="linear(to-r, purple.400, blue.400)"
              bgClip="text" cursor="pointer" px={3}>OpportunityBoard</Heading>
          </Link>
          <Stack gap={1} flex={1}>
            {navItems.map((item) => (
              <Link href={item.href} key={item.label}>
                <Flex align="center" gap={3} px={3} py={2.5} borderRadius="lg" cursor="pointer"
                  transition="all 0.15s" _hover={{ bg: "rgba(255,255,255,0.06)" }}
                  bg={item.href === "/dashboard/profile" ? "rgba(139,92,246,0.1)" : "transparent"}
                  borderLeft={item.href === "/dashboard/profile" ? "2px solid" : "2px solid transparent"}
                  borderColor={item.href === "/dashboard/profile" ? "purple.500" : "transparent"}>
                  <Text fontSize="sm">{item.icon}</Text>
                  <Text fontSize="sm" color={item.href === "/dashboard/profile" ? "purple.300" : "gray.400"}
                    fontWeight={item.href === "/dashboard/profile" ? "medium" : "normal"}>
                    {item.label}
                  </Text>
                </Flex>
              </Link>
            ))}
          </Stack>
          <Box px={3}>
            <Flex align="center" gap={3} mb={3}>
              <Avatar.Root size="sm">
                <Avatar.Fallback bg="purple.600" color="white" fontSize="xs">
                  {session?.user?.name?.[0] || "U"}
                </Avatar.Fallback>
              </Avatar.Root>
              <Stack gap={0} overflow="hidden">
                <Text fontSize="xs" fontWeight="semibold" color="white" noOfLines={1}>{session?.user?.name}</Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>{session?.user?.email}</Text>
              </Stack>
            </Flex>
          </Box>
        </Box>

        {/* Main */}
        <Box flex={1} overflow="auto">
          <Box borderBottom="1px solid rgba(255,255,255,0.06)" px={8} py={4}
            bg="rgba(10,10,20,0.6)" backdropFilter="blur(20px)" position="sticky" top={0} zIndex={10}>
            <Heading size="md">Profile Settings</Heading>
          </Box>

          <Container maxW="2xl" py={8} px={{ base: 4, md: 8 }}>
            <Stack gap={8}>

              {/* Avatar section */}
              <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                borderRadius="2xl" p={6}>
                <Flex gap={5} align="center">
                  <Avatar.Root size="xl">
                    <Avatar.Fallback bg="purple.600" color="white" fontSize="2xl">
                      {profile?.name?.[0] || session?.user?.name?.[0] || "U"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Stack gap={1}>
                    <Text fontWeight="semibold" color="white" fontSize="lg">{profile?.name || "Student"}</Text>
                    <Text color="gray.500" fontSize="sm">{session?.user?.email}</Text>
                    <Flex gap={2} mt={1}>
                      <Badge bg="rgba(139,92,246,0.15)" color="purple.300" borderRadius="full" px={2} fontSize="xs">
                        🎓 Student
                      </Badge>
                      {profile?._count?.opportunities > 0 && (
                        <Badge bg="rgba(59,130,246,0.15)" color="blue.300" borderRadius="full" px={2} fontSize="xs">
                          {profile._count.opportunities} listing{profile._count.opportunities > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </Flex>
                  </Stack>
                </Flex>
              </Box>

              {/* Form */}
              <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                borderRadius="2xl" p={6}>
                <Heading size="sm" mb={6} color="gray.300">Personal Information</Heading>
                <form onSubmit={handleSave}>
                  <Stack gap={5}>
                    <Flex gap={4} flexWrap="wrap">
                      <Stack gap={1} flex={1} minW="200px">
                        <Text color="gray.400" fontSize="sm">Full Name</Text>
                        <Input {...inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)}
                          placeholder="Your full name" />
                        {errors.name && <Text color="red.400" fontSize="xs">{errors.name[0]}</Text>}
                      </Stack>
                      <Stack gap={1} flex={1} minW="200px">
                        <Text color="gray.400" fontSize="sm">Email</Text>
                        <Input {...inputStyle} value={session?.user?.email || ""} disabled
                          opacity={0.5} cursor="not-allowed" />
                      </Stack>
                    </Flex>

                    <Stack gap={1}>
                      <Text color="gray.400" fontSize="sm">Bio</Text>
                      <Textarea {...inputStyle} value={form.bio} onChange={(e) => set("bio", e.target.value)}
                        placeholder="Tell others about yourself, your skills, and what you're looking for..."
                        rows={3} resize="none" />
                      {errors.bio && <Text color="red.400" fontSize="xs">{errors.bio[0]}</Text>}
                    </Stack>

                    <Flex gap={4} flexWrap="wrap">
                      <Stack gap={1} flex={2} minW="200px">
                        <Text color="gray.400" fontSize="sm">University</Text>
                        <Input {...inputStyle} value={form.university} onChange={(e) => set("university", e.target.value)}
                          placeholder="e.g. University of Lagos" />
                      </Stack>
                      <Stack gap={1} flex={1} minW="140px">
                        <Text color="gray.400" fontSize="sm">Graduation Year</Text>
                        <Input {...inputStyle} type="number" value={form.graduationYear}
                          onChange={(e) => set("graduationYear", e.target.value)}
                          placeholder="2026" min={2024} max={2035} />
                      </Stack>
                    </Flex>

                    <Stack gap={1}>
                      <Text color="gray.400" fontSize="sm">Major / Field of Study</Text>
                      <Input {...inputStyle} value={form.major} onChange={(e) => set("major", e.target.value)}
                        placeholder="e.g. Computer Science" />
                    </Stack>

                    <Stack gap={1}>
                      <Text color="gray.400" fontSize="sm">Crypto Wallet Address</Text>
                      <Input {...inputStyle} value={form.walletAddress} onChange={(e) => set("walletAddress", e.target.value)}
                        placeholder="0x... or your wallet address" fontFamily="mono" fontSize="sm" />
                      <Text color="gray.600" fontSize="xs">Used to receive crypto payments for your opportunities</Text>
                      {errors.walletAddress && <Text color="red.400" fontSize="xs">{errors.walletAddress[0]}</Text>}
                    </Stack>

                    {saved && (
                      <Box bg="rgba(34,197,94,0.1)" border="1px solid rgba(34,197,94,0.3)"
                        borderRadius="xl" px={4} py={3}>
                        <Text color="green.300" fontSize="sm">✓ Profile saved successfully</Text>
                      </Box>
                    )}

                    <Button type="submit" loading={saving}
                      bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                      _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                      transition="all 0.2s" borderRadius="xl" py={5}>
                      Save Changes
                    </Button>
                  </Stack>
                </form>
              </Box>

            </Stack>
          </Container>
        </Box>
      </Flex>
    </Box>
  );
}
