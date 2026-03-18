"use client";

import {
  Box, Button, Container, Flex, Heading, SimpleGrid,
  Stack, Text, Badge, Avatar,
} from "@chakra-ui/react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Browse", href: "/opportunities", icon: "🔍" },
  { label: "Post New", href: "/opportunities/new", icon: "➕" },
  { label: "Profile", href: "/dashboard/profile", icon: "👤" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [myOpps, setMyOpps] = useState<any[]>([]);
  const [recentOpps, setRecentOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/opportunities?page=1").then((r) => r.json()),
    ]).then(([prof, opps]) => {
      setProfile(prof);
      const all = opps.opportunities || [];
      setMyOpps(all.filter((o: any) => o.author?.id === session?.user?.id));
      setRecentOpps(all.slice(0, 6));
      setLoading(false);
    });
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Stack align="center" gap={3}>
          <Box w={8} h={8} borderRadius="full" border="2px solid" borderColor="purple.500"
            borderTopColor="transparent" animation="spin 0.8s linear infinite" />
          <Text color="gray.500" fontSize="sm">Loading dashboard...</Text>
        </Stack>
      </Box>
    );
  }

  const activeOpps = myOpps.filter((o) => o.status === "ACTIVE");

  return (
    <Box minH="100vh" bg="gray.950" color="white">
      <Flex minH="100vh">

        {/* ── Sidebar ── */}
        <Box
          w="220px" flexShrink={0}
          bg="rgba(255,255,255,0.02)"
          borderRight="1px solid rgba(255,255,255,0.06)"
          display={{ base: "none", md: "flex" }}
          flexDir="column" py={6} px={4} gap={8}
          position="sticky" top={0} h="100vh"
        >
          <Link href="/">
            <Heading size="sm" bgGradient="linear(to-r, purple.400, blue.400)"
              bgClip="text" cursor="pointer" px={3}>
              OpportunityBoard
            </Heading>
          </Link>

          <Stack gap={1} flex={1}>
            {navItems.map((item) => (
              <Link href={item.href} key={item.label}>
                <Flex align="center" gap={3} px={3} py={2.5} borderRadius="lg"
                  cursor="pointer" transition="all 0.15s"
                  _hover={{ bg: "rgba(255,255,255,0.06)", color: "white" }}
                  bg={item.href === "/dashboard" ? "rgba(139,92,246,0.1)" : "transparent"}
                  borderLeft={item.href === "/dashboard" ? "2px solid" : "2px solid transparent"}
                  borderColor={item.href === "/dashboard" ? "purple.500" : "transparent"}
                >
                  <Text fontSize="sm">{item.icon}</Text>
                  <Text fontSize="sm" color={item.href === "/dashboard" ? "purple.300" : "gray.400"}
                    fontWeight={item.href === "/dashboard" ? "medium" : "normal"}>
                    {item.label}
                  </Text>
                </Flex>
              </Link>
            ))}
          </Stack>

          {/* User in sidebar */}
          <Box px={3}>
            <Flex align="center" gap={3} mb={3}>
              <Avatar.Root size="sm">
                <Avatar.Fallback bg="purple.600" color="white" fontSize="xs">
                  {session?.user?.name?.[0] || "U"}
                </Avatar.Fallback>
              </Avatar.Root>
              <Stack gap={0} overflow="hidden">
                <Text fontSize="xs" fontWeight="semibold" color="white" noOfLines={1}>
                  {session?.user?.name || "Student"}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>{session?.user?.email}</Text>
              </Stack>
            </Flex>
            <Button size="xs" variant="ghost" color="gray.600" w="full"
              _hover={{ color: "gray.400", bg: "rgba(255,255,255,0.05)" }}
              onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          </Box>
        </Box>

        {/* ── Main Content ── */}
        <Box flex={1} overflow="auto">

          {/* Top bar */}
          <Box borderBottom="1px solid rgba(255,255,255,0.06)" px={8} py={4}
            bg="rgba(10,10,20,0.6)" backdropFilter="blur(20px)"
            position="sticky" top={0} zIndex={10}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="md" color="white">Overview</Heading>
                <Text color="gray.500" fontSize="xs" mt={0.5}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Text>
              </Box>
              <Flex gap={3} align="center">
                <Link href="/opportunities/new">
                  <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                    transition="all 0.2s" borderRadius="lg" fontSize="xs">
                    + Post Opportunity
                  </Button>
                </Link>
                <Avatar.Root size="sm" display={{ md: "none" }}>
                  <Avatar.Fallback bg="purple.600" color="white" fontSize="xs">
                    {session?.user?.name?.[0] || "U"}
                  </Avatar.Fallback>
                </Avatar.Root>
              </Flex>
            </Flex>
          </Box>

          <Container maxW="5xl" py={8} px={{ base: 4, md: 8 }}>
            <Stack gap={8}>

              {/* ── Welcome Banner ── */}
              <Box
                bgGradient="linear(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 100%)"
                border="1px solid rgba(139,92,246,0.2)" borderRadius="2xl" p={6} position="relative" overflow="hidden"
              >
                <Box position="absolute" top="-40px" right="-40px" w="180px" h="180px"
                  borderRadius="full" bg="purple.600" opacity={0.08} filter="blur(40px)" />
                <Flex gap={4} align="center" justify="space-between" flexWrap="wrap">
                  <Flex gap={4} align="center">
                    <Avatar.Root size="lg">
                      <Avatar.Fallback bg="purple.600" color="white" fontSize="lg">
                        {session?.user?.name?.[0] || "U"}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <Stack gap={0.5}>
                      <Text color="gray.400" fontSize="sm">Good to see you back 👋</Text>
                      <Heading size="md" color="white">
                        {session?.user?.name || "Student"}
                      </Heading>
                      {profile?.university && (
                        <Text color="purple.300" fontSize="sm">{profile.university}
                          {profile?.major ? ` · ${profile.major}` : ""}
                        </Text>
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

              {/* ── Stats ── */}
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                {[
                  { label: "Total Listings", value: profile?._count?.opportunities ?? 0, icon: "📋", color: "purple" },
                  { label: "Active Now", value: activeOpps.length, icon: "✅", color: "green" },
                  { label: "Payments Made", value: profile?._count?.payments ?? 0, icon: "⚡", color: "blue" },
                  { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).getFullYear() : "—", icon: "🎓", color: "orange" },
                ].map((stat) => (
                  <Box key={stat.label}
                    bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                    borderRadius="xl" p={5} transition="all 0.2s"
                    _hover={{ bg: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" }}>
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <Text fontSize="xl">{stat.icon}</Text>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="black" color="white">{stat.value}</Text>
                    <Text color="gray.500" fontSize="xs" mt={1}>{stat.label}</Text>
                  </Box>
                ))}
              </SimpleGrid>

              {/* ── My Opportunities ── */}
              <Stack gap={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="sm" color="white">My Opportunities</Heading>
                  <Link href="/opportunities/new">
                    <Button size="xs" variant="ghost" color="purple.400"
                      _hover={{ color: "purple.300", bg: "rgba(139,92,246,0.1)" }} borderRadius="lg">
                      + Post new
                    </Button>
                  </Link>
                </Flex>

                {myOpps.length === 0 ? (
                  <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                    borderRadius="2xl" p={12} textAlign="center">
                    <Text fontSize="3xl" mb={3}>📋</Text>
                    <Heading size="sm" color="gray.500" mb={1}>No opportunities yet</Heading>
                    <Text color="gray.600" fontSize="sm" mb={5}>
                      Post your first gig or internship and reach students everywhere
                    </Text>
                    <Link href="/opportunities/new">
                      <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)"
                        color="white" borderRadius="lg" px={6}>
                        Post your first opportunity
                      </Button>
                    </Link>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    {myOpps.map((opp) => (
                      <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                        <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                          borderRadius="xl" p={5} cursor="pointer" transition="all 0.2s"
                          _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.3)", transform: "translateY(-1px)" }}>
                          <Flex justify="space-between" align="flex-start" mb={3}>
                            <Badge colorScheme={typeColor[opp.type] || "gray"}
                              borderRadius="full" px={2} fontSize="xs">{opp.type}</Badge>
                            <Badge
                              bg={opp.status === "ACTIVE" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"}
                              color={opp.status === "ACTIVE" ? "green.300" : "gray.500"}
                              borderRadius="full" px={2} fontSize="xs">
                              {opp.status}
                            </Badge>
                          </Flex>
                          <Text fontWeight="semibold" color="white" fontSize="sm" noOfLines={1} mb={1}>
                            {opp.title}
                          </Text>
                          <Flex justify="space-between" align="center" mt={2}>
                            <Text color="gray.600" fontSize="xs">
                              {new Date(opp.createdAt).toLocaleDateString()}
                            </Text>
                            {opp.paymentType === "CRYPTO" && (
                              <Badge bg="rgba(139,92,246,0.15)" color="purple.300"
                                borderRadius="full" px={2} fontSize="xs">⚡ Crypto</Badge>
                            )}
                          </Flex>
                        </Box>
                      </Link>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>

              {/* ── Recent on Platform ── */}
              <Stack gap={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="sm" color="white">Recent on Platform</Heading>
                  <Link href="/opportunities">
                    <Button size="xs" variant="ghost" color="blue.400"
                      _hover={{ color: "blue.300", bg: "rgba(59,130,246,0.1)" }} borderRadius="lg">
                      Browse all →
                    </Button>
                  </Link>
                </Flex>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  {recentOpps.filter((o) => o.author?.id !== session?.user?.id).slice(0, 3).map((opp) => (
                    <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                      <Box bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.06)"
                        borderRadius="xl" p={4} cursor="pointer" transition="all 0.2s"
                        _hover={{ bg: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", transform: "translateY(-1px)" }}>
                        <Flex justify="space-between" mb={2}>
                          <Badge colorScheme={typeColor[opp.type] || "gray"}
                            borderRadius="full" px={2} fontSize="xs">{opp.type}</Badge>
                          {opp.paymentType === "CRYPTO" && (
                            <Badge bg="rgba(139,92,246,0.15)" color="purple.300"
                              borderRadius="full" px={2} fontSize="xs">⚡</Badge>
                          )}
                        </Flex>
                        <Text fontWeight="semibold" color="white" fontSize="sm" noOfLines={1} mb={1}>
                          {opp.title}
                        </Text>
                        <Text color="gray.500" fontSize="xs" noOfLines={1}>
                          {opp.author?.university || opp.author?.name || "Anonymous"}
                        </Text>
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
    </Box>
  );
}
