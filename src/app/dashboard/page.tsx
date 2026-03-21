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
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [myOpps, setMyOpps] = useState<any[]>([]);
  const [recentOpps, setRecentOpps] = useState<any[]>([]);
  const [paymentsReceived, setPaymentsReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: t.dashboard.overview, href: "/dashboard" },
    { label: t.dashboard.browse, href: "/opportunities" },
    { label: t.dashboard.postNew, href: "/opportunities/new" },
    { label: t.dashboard.applications, href: "/dashboard/applications" },
    { label: t.dashboard.profile, href: "/dashboard/profile" },
  ];

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
        <Text color="gray.500">{t.common.loading}</Text>
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
                <Link href={item.href} key={item.href}>
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
            <Flex justify="space-between" align="center" mb={2}>
              <LanguageToggle />
            </Flex>
            <Button size="xs" variant="ghost" color="gray.600" w="full"
              _hover={{ color: "gray.400" }} onClick={() => signOut({ callbackUrl: "/" })}>
              {t.dashboard.signOut}
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
                <Heading size="md" color="white">{t.dashboard.overview}</Heading>
                <Text color="gray.500" fontSize="xs" mt={0.5}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Text>
              </Box>
              <Link href="/opportunities/new">
                <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="lg" fontSize="xs">
                  {t.nav.postOpportunity}
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
                      <Text color="gray.400" fontSize="sm">{t.dashboard.welcomeBack}</Text>
                      <Heading size="md" color="white">{session?.user?.name}</Heading>
                      {profile?.university && (
                        <Text color="purple.300" fontSize="sm">{profile.university}{profile?.major ? ` · ${profile.major}` : ""}</Text>
                      )}
                    </Stack>
                  </Flex>
                  <Link href="/dashboard/profile">
                    <Button size="sm" variant="outline" borderColor="rgba(139,92,246,0.4)"
                      color="purple.300" _hover={{ bg: "rgba(139,92,246,0.1)" }} borderRadius="lg">
                      {t.dashboard.editProfile}
                    </Button>
                  </Link>
                </Flex>
              </Box>

              {/* Wallet missing banner */}
              {profile && !profile.walletAddress && (
                <Box bg="rgba(234,179,8,0.08)" border="1px solid rgba(234,179,8,0.25)" borderRadius="xl" px={5} py={4}>
                  <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
                    <Flex align="center" gap={3}>
                      <Text fontSize="xl">🦊</Text>
                      <Stack spacing={0}>
                        <Text color="yellow.300" fontWeight="semibold" fontSize="sm">{t.dashboard.setupWallet}</Text>
                        <Text color="gray.500" fontSize="xs">{t.dashboard.setupWalletDesc}</Text>
                      </Stack>
                    </Flex>
                    <Link href="/dashboard/profile">
                      <Button size="sm" colorScheme="yellow" variant="outline" borderRadius="lg">{t.dashboard.addWallet}</Button>
                    </Link>
                  </Flex>
                </Box>
              )}

              {/* Stats */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {[
                  { label: t.dashboard.totalListings, value: profile?._count?.opportunities ?? 0 },
                  { label: t.dashboard.activeNow, value: myOpps.filter((o) => o.status === "ACTIVE").length },
                  { label: t.dashboard.paymentsReceived, value: paymentsReceived.filter((p) => p.status === "CONFIRMED").length },
                  { label: t.dashboard.memberSince, value: profile?.createdAt ? new Date(profile.createdAt).getFullYear() : "—" },
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
                  <Heading size="sm" color="white">{t.dashboard.myOpportunities}</Heading>
                  <Link href="/opportunities/new">
                    <Button size="xs" variant="ghost" color="purple.400"
                      _hover={{ color: "purple.300" }}>{t.dashboard.postNew2}</Button>
                  </Link>
                </Flex>
                {myOpps.length === 0 ? (
                  <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                    borderRadius="2xl" p={10} textAlign="center">
                    <Text color="gray.500" fontSize="sm" mb={4}>{t.dashboard.noOpportunities}</Text>
                    <Link href="/opportunities/new">
                      <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)"
                        color="white" borderRadius="lg">{t.dashboard.postFirst}</Button>
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
                <Heading size="sm" color="white">{t.dashboard.paymentsReceived}</Heading>
                {paymentsReceived.length === 0 ? (
                  <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                    borderRadius="xl" p={6} textAlign="center">
                    <Text color="gray.600" fontSize="sm">{t.dashboard.noPayments}</Text>
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
                  <Heading size="sm" color="white">{t.dashboard.recentOnPlatform}</Heading>
                  <Link href="/opportunities">
                    <Button size="xs" variant="ghost" color="blue.400" _hover={{ color: "blue.300" }}>{t.dashboard.browseAll}</Button>
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
                          {opp.paymentType === "CRYPTO" && <Badge colorScheme="purple" borderRadius="full" fontSize="xs">{t.common.crypto}</Badge>}
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
