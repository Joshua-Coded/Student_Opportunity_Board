"use client";

import {
  Avatar, Badge, Box, Button, Container, Flex, Heading,
  SimpleGrid, Stack, Text,
} from "@chakra-ui/react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Browse", href: "/opportunities" },
  { label: "Post New", href: "/opportunities/new" },
  { label: "Applications", href: "/dashboard/applications" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [myOpps, setMyOpps] = useState<any[]>([]);
  const [recentOpps, setRecentOpps] = useState<any[]>([]);
  const [paymentsReceived, setPaymentsReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/opportunities?page=1").then((r) => r.json()),
      fetch("/api/payments/received").then((r) => r.json()),
    ]).then(([prof, opps, payments]) => {
      setProfile(prof);
      const all = opps.opportunities || [];
      setMyOpps(all.filter((o: any) => o.author?.id === session?.user?.id));
      setRecentOpps(all);
      setPaymentsReceived(Array.isArray(payments) ? payments : []);
      setLoading(false);
    });
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#050510" color="white">
      <Flex minH="100vh">
        {/* Sidebar */}
        <Box w="220px" flexShrink={0} bg="rgba(255,255,255,0.02)"
          borderRight="1px solid rgba(255,255,255,0.06)"
          display={{ base: "none", md: "flex" }} flexDir="column" py={6} px={4}
          position="sticky" top={0} h="100vh" justifyContent="space-between">
          <Stack spacing={8}>
            <Link href="/">
              <Heading size="sm" bgGradient="linear(to-r, purple.400, blue.400)"
                bgClip="text" cursor="pointer" px={3}>OpportunityBoard</Heading>
            </Link>
            <Stack spacing={1}>
              {navItems.map((item) => (
                <Link href={item.href} key={item.label}>
                  <Flex align="center" gap={3} px={3} py={2} borderRadius="lg" cursor="pointer"
                    transition="all 0.15s" _hover={{ bg: "rgba(255,255,255,0.06)" }}
                    bg={item.href === "/dashboard" ? "rgba(139,92,246,0.1)" : "transparent"}
                    borderLeft="2px solid"
                    borderColor={item.href === "/dashboard" ? "purple.500" : "transparent"}>
                    <Text fontSize="sm" color={item.href === "/dashboard" ? "purple.300" : "gray.400"}
                      fontWeight={item.href === "/dashboard" ? "medium" : "normal"}>
                      {item.label}
                    </Text>
                  </Flex>
                </Link>
              ))}
            </Stack>
          </Stack>
          <Box px={3}>
            <Flex align="center" gap={3} mb={3}>
              <Avatar size="sm" name={session?.user?.name || "U"} src={session?.user?.image || undefined} bg="purple.600" color="white" />
              <Stack spacing={0} overflow="hidden">
                <Text fontSize="xs" fontWeight="semibold" color="white" isTruncated>{session?.user?.name}</Text>
                <Text fontSize="xs" color="gray.500" isTruncated>{session?.user?.email}</Text>
              </Stack>
            </Flex>
            <Button size="xs" variant="ghost" color="gray.600" w="full"
              _hover={{ color: "gray.400" }} onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          </Box>
        </Box>

        {/* Main */}
        <Box flex={1} overflowY="auto">
          <Box borderBottom="1px solid rgba(255,255,255,0.06)" px={8} py={4}
            bg="rgba(5,5,16,0.8)" backdropFilter="blur(20px)"
            position="sticky" top={0} zIndex={10}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="md" color="white">Overview</Heading>
                <Text color="gray.500" fontSize="xs" mt={0.5}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Text>
              </Box>
              <Link href="/opportunities/new">
                <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="lg" fontSize="xs">
                  + Post Opportunity
                </Button>
              </Link>
            </Flex>
          </Box>

          <Container maxW="5xl" py={8} px={{ base: 4, md: 8 }} pb={{ base: 24, md: 8 }}>
            <Stack spacing={8}>
              {/* Welcome */}
              <Box bgGradient="linear(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))"
                border="1px solid rgba(139,92,246,0.2)" borderRadius="2xl" p={6}>
                <Flex gap={4} align="center" justify="space-between" flexWrap="wrap">
                  <Flex gap={4} align="center">
                    <Avatar size="lg" name={session?.user?.name || "U"} src={session?.user?.image || undefined} bg="purple.600" color="white" />
                    <Stack spacing={0.5}>
                      <Text color="gray.400" fontSize="sm">Welcome back</Text>
                      <Heading size="md" color="white">{session?.user?.name}</Heading>
                      {profile?.university && (
                        <Text color="purple.300" fontSize="sm">{profile.university}{profile?.major ? ` · ${profile.major}` : ""}</Text>
                      )}
                    </Stack>
                  </Flex>
                  <Link href="/dashboard/profile">
                    <Button size="sm" variant="outline" borderColor="rgba(139,92,246,0.4)"
                      color="purple.300" _hover={{ bg: "rgba(139,92,246,0.1)" }} borderRadius="lg">
                      Edit Profile
                    </Button>
                  </Link>
                </Flex>
              </Box>

              {/* Stats */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {[
                  { label: "Total Listings", value: profile?._count?.opportunities ?? 0 },
                  { label: "Active Now", value: myOpps.filter((o) => o.status === "ACTIVE").length },
                  { label: "Payments Received", value: paymentsReceived.filter((p) => p.status === "CONFIRMED").length },
                  { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).getFullYear() : "—" },
                ].map((stat) => (
                  <Box key={stat.label} bg="rgba(255,255,255,0.03)"
                    border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" p={5}
                    _hover={{ bg: "rgba(255,255,255,0.05)" }} transition="all 0.2s">
                    <Text fontSize="2xl" fontWeight="black" color="white">{stat.value}</Text>
                    <Text color="gray.500" fontSize="xs" mt={1}>{stat.label}</Text>
                  </Box>
                ))}
              </SimpleGrid>

              {/* My Opportunities */}
              <Stack spacing={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="sm" color="white">My Opportunities</Heading>
                  <Link href="/opportunities/new">
                    <Button size="xs" variant="ghost" color="purple.400"
                      _hover={{ color: "purple.300" }}>+ Post new</Button>
                  </Link>
                </Flex>
                {myOpps.length === 0 ? (
                  <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                    borderRadius="2xl" p={10} textAlign="center">
                    <Text color="gray.500" fontSize="sm" mb={4}>No opportunities posted yet</Text>
                    <Link href="/opportunities/new">
                      <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)"
                        color="white" borderRadius="lg">Post your first one</Button>
                    </Link>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {myOpps.map((opp) => (
                      <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                        <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                          borderRadius="xl" p={5} cursor="pointer" transition="all 0.2s"
                          _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "purple.800", transform: "translateY(-1px)" }}>
                          <Flex justify="space-between" mb={2}>
                            <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={2} fontSize="xs">{opp.type}</Badge>
                            <Badge colorScheme={opp.status === "ACTIVE" ? "green" : "gray"} borderRadius="full" fontSize="xs">{opp.status}</Badge>
                          </Flex>
                          <Text fontWeight="semibold" color="white" fontSize="sm" noOfLines={1}>{opp.title}</Text>
                          <Text color="gray.600" fontSize="xs" mt={1}>{new Date(opp.createdAt).toLocaleDateString()}</Text>
                        </Box>
                      </Link>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>

              {/* Payments Received */}
              <Stack spacing={4}>
                <Heading size="sm" color="white">Payments Received</Heading>
                {paymentsReceived.length === 0 ? (
                  <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                    borderRadius="xl" p={6} textAlign="center">
                    <Text color="gray.600" fontSize="sm">No payments received yet</Text>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {paymentsReceived.map((p) => (
                      <Box key={p.id} bg="rgba(255,255,255,0.03)"
                        border={`1px solid ${p.status === "CONFIRMED" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`}
                        borderRadius="xl" p={5}>
                        <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                          <Stack spacing={1}>
                            <Text fontWeight="semibold" color="white" fontSize="sm">{p.opportunity?.title}</Text>
                            <Text color="gray.500" fontSize="xs">From: {p.payer?.name}</Text>
                            <Text color="gray.600" fontSize="xs">{new Date(p.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
                          </Stack>
                          <Stack spacing={1} align="flex-end">
                            <Text color="purple.300" fontWeight="bold" fontSize="lg">
                              {p.cryptoAmount} {p.cryptoCurrency}
                            </Text>
                            <Badge colorScheme={p.status === "CONFIRMED" ? "green" : "yellow"} borderRadius="full" px={2} fontSize="xs">
                              {p.status}
                            </Badge>
                            {p.txHash && (
                              <Text color="gray.600" fontSize="xs" fontFamily="mono" noOfLines={1} maxW="180px">
                                {p.txHash.slice(0, 18)}...
                              </Text>
                            )}
                          </Stack>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>

              {/* Recent on Platform */}
              <Stack spacing={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="sm" color="white">Recent on Platform</Heading>
                  <Link href="/opportunities">
                    <Button size="xs" variant="ghost" color="blue.400" _hover={{ color: "blue.300" }}>Browse all →</Button>
                  </Link>
                </Flex>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {recentOpps.filter((o) => o.author?.id !== session?.user?.id).slice(0, 3).map((opp) => (
                    <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                      <Box bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.06)"
                        borderRadius="xl" p={4} cursor="pointer" transition="all 0.2s"
                        _hover={{ bg: "rgba(255,255,255,0.05)", transform: "translateY(-1px)" }}>
                        <Flex justify="space-between" mb={2}>
                          <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={2} fontSize="xs">{opp.type}</Badge>
                          {opp.paymentType === "CRYPTO" && <Badge colorScheme="purple" borderRadius="full" fontSize="xs">Crypto</Badge>}
                        </Flex>
                        <Text fontWeight="semibold" color="white" fontSize="sm" noOfLines={1}>{opp.title}</Text>
                        <Text color="gray.500" fontSize="xs" mt={1} noOfLines={1}>{opp.author?.university || opp.author?.name}</Text>
                        {opp.compensationAmount && (
                          <Text color="purple.300" fontSize="xs" fontWeight="semibold" mt={2}>
                            {opp.compensationAmount} {opp.compensationCurrency}
                          </Text>
                        )}
                      </Box>
                    </Link>
                  ))}
                </SimpleGrid>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Flex>
      <MobileNav />
    </Box>
  );
}
