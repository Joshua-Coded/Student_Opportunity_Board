"use client";

import {
  Avatar, Badge, Box, Button, Container, Flex, FormControl, FormLabel,
  Heading, Input, Stack, Text, Textarea, useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UploadImage from "@/components/UploadImage";
import MobileNav from "@/components/MobileNav";
import { connectWallet, switchToSepolia, isMetaMaskInstalled } from "@/lib/web3";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Browse", href: "/opportunities", icon: "🔍" },
  { label: "Post New", href: "/opportunities/new", icon: "➕" },
  { label: "Applications", href: "/dashboard/applications", icon: "📨" },
  { label: "Profile", href: "/dashboard/profile", icon: "👤" },
];

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: "", bio: "", university: "", major: "", graduationYear: "", walletAddress: "", image: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState("");

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      setForm({
        name: data.name || "", bio: data.bio || "",
        university: data.university || "", major: data.major || "",
        graduationYear: data.graduationYear?.toString() || "", walletAddress: data.walletAddress || "",
        image: data.image || "",
      });
      setLoading(false);
    });
  }, [status]);

  async function connectMetaMask() {
    if (!isMetaMaskInstalled()) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setConnectingWallet(true);
    try {
      const account = await connectWallet();
      await switchToSepolia();
      set("walletAddress", account);
      toast({ title: "Wallet connected!", description: account, status: "success", duration: 3000 });
    } catch {
      toast({ title: "Could not connect wallet", status: "error", duration: 3000 });
    } finally {
      setConnectingWallet(false);
    }
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: any = { ...form };
    if (form.graduationYear) payload.graduationYear = parseInt(form.graduationYear);
    else delete payload.graduationYear;
    const res = await fetch("/api/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setWalletError("");
      await updateSession({ image: updated.image || null });
      toast({ title: "Profile saved!", status: "success", duration: 2000 });
    } else {
      const data = await res.json();
      const walletMsg = data.error?.walletAddress?.[0];
      if (walletMsg) setWalletError(walletMsg);
      else toast({ title: "Failed to save", status: "error", duration: 2000 });
    }
  }

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", _placeholder: { color: "gray.600" },
    _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }, borderRadius: "xl",
  };

  if (loading) return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
      <Text color="gray.500">Loading...</Text>
    </Box>
  );

  return (
    <Box minH="100vh" bg="#050510" color="white">
      <Flex minH="100vh">
        {/* Sidebar */}
        <Box w="220px" flexShrink={0} bg="rgba(255,255,255,0.02)"
          borderRight="1px solid rgba(255,255,255,0.06)"
          display={{ base: "none", md: "flex" }} flexDir="column" py={6} px={4}
          position="sticky" top={0} h="100vh" justifyContent="space-between">
          <Stack spacing={8}>
            <Link href="/"><Heading size="sm" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer" px={3}>OpportunityBoard</Heading></Link>
            <Stack spacing={1}>
              {navItems.map((item) => (
                <Link href={item.href} key={item.label}>
                  <Flex align="center" gap={3} px={3} py={2} borderRadius="lg" cursor="pointer"
                    transition="all 0.15s" _hover={{ bg: "rgba(255,255,255,0.06)" }}
                    bg={item.href === "/dashboard/profile" ? "rgba(139,92,246,0.1)" : "transparent"}
                    borderLeft="2px solid" borderColor={item.href === "/dashboard/profile" ? "purple.500" : "transparent"}>
                    <Text>{item.icon}</Text>
                    <Text fontSize="sm" color={item.href === "/dashboard/profile" ? "purple.300" : "gray.400"}
                      fontWeight={item.href === "/dashboard/profile" ? "medium" : "normal"}>{item.label}</Text>
                  </Flex>
                </Link>
              ))}
            </Stack>
          </Stack>
          <Box px={3}>
            <Flex align="center" gap={3}>
              <Avatar size="sm" name={session?.user?.name || "U"} src={session?.user?.image || undefined} bg="purple.600" color="white" />
              <Text fontSize="xs" color="gray.500" isTruncated>{session?.user?.name}</Text>
            </Flex>
          </Box>
        </Box>

        {/* Main */}
        <Box flex={1} overflowY="auto">
          <Box borderBottom="1px solid rgba(255,255,255,0.06)" px={8} py={4}
            bg="rgba(5,5,16,0.8)" backdropFilter="blur(20px)" position="sticky" top={0} zIndex={10}>
            <Heading size="md">Profile Settings</Heading>
          </Box>
          <Container maxW="2xl" py={8} px={{ base: 4, md: 8 }} pb={{ base: 24, md: 8 }}>
            <Stack spacing={6}>
              {/* Avatar card */}
              <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)" borderRadius="2xl" p={6}>
                <Flex gap={5} align="center" flexWrap="wrap">
                  <Box position="relative" flexShrink={0}>
                    {form.image ? (
                      <Box w="80px" h="80px" borderRadius="full" overflow="hidden" border="2px solid rgba(139,92,246,0.4)">
                        <img src={form.image} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    ) : (
                      <Avatar size="xl" name={profile?.name || session?.user?.name || "U"} bg="purple.600" color="white" />
                    )}
                  </Box>
                  <Stack spacing={1} flex={1}>
                    <Text fontWeight="semibold" color="white" fontSize="lg">{profile?.name || "Student"}</Text>
                    <Text color="gray.500" fontSize="sm">{session?.user?.email}</Text>
                    <Flex gap={2} mt={1}>
                      <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="xs">🎓 Student</Badge>
                      {profile?._count?.opportunities > 0 && (
                        <Badge colorScheme="blue" borderRadius="full" px={2} fontSize="xs">
                          {profile._count.opportunities} listing{profile._count.opportunities > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </Flex>
                    <Box maxW="280px" mt={2}>
                      <UploadImage
                        label="Upload Avatar"
                        currentUrl={form.image}
                        onUpload={(url) => set("image", url)}
                        accept="image/*"
                      />
                    </Box>
                  </Stack>
                </Flex>
              </Box>

              {/* Form */}
              <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)" borderRadius="2xl" p={6}>
                <Heading size="sm" mb={6} color="gray.300">Personal Information</Heading>
                <form onSubmit={handleSave}>
                  <Stack spacing={5}>
                    <Flex gap={4} flexWrap="wrap">
                      <FormControl flex={1} minW="180px">
                        <FormLabel color="gray.400" fontSize="sm">Full Name</FormLabel>
                        <Input {...inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" />
                      </FormControl>
                      <FormControl flex={1} minW="180px">
                        <FormLabel color="gray.400" fontSize="sm">Email</FormLabel>
                        <Input {...inputStyle} value={session?.user?.email || ""} isDisabled opacity={0.5} />
                      </FormControl>
                    </Flex>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Bio</FormLabel>
                      <Textarea {...inputStyle} value={form.bio} onChange={(e) => set("bio", e.target.value)}
                        placeholder="Tell others about yourself..." rows={3} resize="none" />
                    </FormControl>
                    <Flex gap={4} flexWrap="wrap">
                      <FormControl flex={2} minW="180px">
                        <FormLabel color="gray.400" fontSize="sm">University</FormLabel>
                        <Input {...inputStyle} value={form.university} onChange={(e) => set("university", e.target.value)} placeholder="e.g. University of Lagos" />
                      </FormControl>
                      <FormControl flex={1} minW="120px">
                        <FormLabel color="gray.400" fontSize="sm">Grad Year</FormLabel>
                        <Input {...inputStyle} type="number" value={form.graduationYear}
                          onChange={(e) => set("graduationYear", e.target.value)} placeholder="2026" />
                      </FormControl>
                    </Flex>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Major</FormLabel>
                      <Input {...inputStyle} value={form.major} onChange={(e) => set("major", e.target.value)} placeholder="e.g. Computer Science" />
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Crypto Wallet Address</FormLabel>
                      <Flex gap={2}>
                        <Input {...inputStyle} value={form.walletAddress} onChange={(e) => set("walletAddress", e.target.value)}
                          placeholder="0x..." fontFamily="mono" fontSize="sm" flex={1} />
                        <Button onClick={connectMetaMask} isLoading={connectingWallet} size="md"
                          bg="rgba(139,92,246,0.15)" color="purple.300" border="1px solid rgba(139,92,246,0.3)"
                          _hover={{ bg: "rgba(139,92,246,0.25)" }} borderRadius="xl" flexShrink={0} fontSize="sm">
                          🦊 MetaMask
                        </Button>
                      </Flex>
                      {walletError ? (
                        <Text color="red.400" fontSize="xs" mt={1}>⚠ {walletError}</Text>
                      ) : (
                        <Text color="gray.600" fontSize="xs" mt={1}>
                          {form.walletAddress ? "✓ Wallet set — you can receive crypto payments" : "Connect MetaMask or paste your address to receive payments"}
                        </Text>
                      )}
                    </FormControl>
                    <Button type="submit" isLoading={saving} w="full"
                      bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                      _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                      transition="all 0.2s" borderRadius="xl" py={6}>
                      Save Changes
                    </Button>
                  </Stack>
                </form>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Flex>
      <MobileNav />
    </Box>
  );
}
