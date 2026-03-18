"use client";

import {
  Box, Button, Container, Flex, Heading, Stack, Text, Badge, Avatar, SimpleGrid,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Browse", href: "/opportunities", icon: "🔍" },
  { label: "Post New", href: "/opportunities/new", icon: "➕" },
  { label: "Applications", href: "/dashboard/applications", icon: "📨" },
  { label: "Profile", href: "/dashboard/profile", icon: "👤" },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: "rgba(234,179,8,0.12)",  color: "#fbbf24" },
  REVIEWED: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
  ACCEPTED: { bg: "rgba(34,197,94,0.12)",  color: "#4ade80" },
  REJECTED: { bg: "rgba(239,68,68,0.12)",  color: "#f87171" },
};

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"sent" | "received">("sent");
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/applications?mode=sent").then((r) => r.json()),
      fetch("/api/applications?mode=received").then((r) => r.json()),
    ]).then(([s, r]) => {
      setSent(Array.isArray(s) ? s : []);
      setReceived(Array.isArray(r) ? r : []);
      setLoading(false);
    });
  }, [status]);

  async function updateStatus(applicationId: string, newStatus: string) {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setReceived((prev) =>
      prev.map((a) => a.id === applicationId ? { ...a, status: newStatus } : a)
    );
  }

  async function withdraw(applicationId: string) {
    if (!confirm("Withdraw this application?")) return;
    await fetch(`/api/applications/${applicationId}`, { method: "DELETE" });
    setSent((prev) => prev.filter((a) => a.id !== applicationId));
  }

  if (status === "loading" || loading) {
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
          <Link href="/"><Heading size="sm" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer" px={3}>OpportunityBoard</Heading></Link>
          <Stack gap={1} flex={1}>
            {navItems.map((item) => (
              <Link href={item.href} key={item.label}>
                <Flex align="center" gap={3} px={3} py={2.5} borderRadius="lg" cursor="pointer"
                  transition="all 0.15s" _hover={{ bg: "rgba(255,255,255,0.06)" }}
                  bg={item.href === "/dashboard/applications" ? "rgba(139,92,246,0.1)" : "transparent"}
                  borderLeft={item.href === "/dashboard/applications" ? "2px solid" : "2px solid transparent"}
                  borderColor={item.href === "/dashboard/applications" ? "purple.500" : "transparent"}>
                  <Text fontSize="sm">{item.icon}</Text>
                  <Text fontSize="sm" color={item.href === "/dashboard/applications" ? "purple.300" : "gray.400"}
                    fontWeight={item.href === "/dashboard/applications" ? "medium" : "normal"}>
                    {item.label}
                  </Text>
                </Flex>
              </Link>
            ))}
          </Stack>
          <Box px={3}>
            <Flex align="center" gap={3}>
              <Avatar.Root size="sm">
                <Avatar.Fallback bg="purple.600" color="white" fontSize="xs">
                  {session?.user?.name?.[0] || "U"}
                </Avatar.Fallback>
              </Avatar.Root>
              <Text fontSize="xs" color="gray.500" noOfLines={1}>{session?.user?.name}</Text>
            </Flex>
          </Box>
        </Box>

        {/* Main */}
        <Box flex={1} overflow="auto">
          <Box borderBottom="1px solid rgba(255,255,255,0.06)" px={8} py={4}
            bg="rgba(10,10,20,0.6)" backdropFilter="blur(20px)" position="sticky" top={0} zIndex={10}>
            <Heading size="md">Applications</Heading>
          </Box>

          <Container maxW="4xl" py={8} px={{ base: 4, md: 8 }}>
            <Stack gap={6}>
              {/* Tabs */}
              <Flex gap={2} bg="rgba(255,255,255,0.03)" p={1} borderRadius="xl"
                border="1px solid rgba(255,255,255,0.07)" w="fit-content">
                {(["sent", "received"] as const).map((t) => (
                  <Button key={t} size="sm" onClick={() => setTab(t)}
                    bg={tab === t ? "rgba(139,92,246,0.2)" : "transparent"}
                    color={tab === t ? "purple.300" : "gray.500"}
                    borderRadius="lg" px={5} _hover={{ color: "white" }} transition="all 0.15s">
                    {t === "sent" ? `📨 Sent (${sent.length})` : `📥 Received (${received.length})`}
                  </Button>
                ))}
              </Flex>

              {/* Sent Applications */}
              {tab === "sent" && (
                <Stack gap={4}>
                  {sent.length === 0 ? (
                    <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                      borderRadius="2xl" p={12} textAlign="center">
                      <Text fontSize="3xl" mb={3}>📨</Text>
                      <Heading size="sm" color="gray.500" mb={2}>No applications yet</Heading>
                      <Text color="gray.600" fontSize="sm" mb={5}>Browse opportunities and apply to get started</Text>
                      <Link href="/opportunities">
                        <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)"
                          color="white" borderRadius="lg" px={6}>Browse Opportunities</Button>
                      </Link>
                    </Box>
                  ) : (
                    sent.map((app) => (
                      <Box key={app.id} bg="rgba(255,255,255,0.03)"
                        border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" p={5}>
                        <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                          <Stack gap={1} flex={1}>
                            <Flex gap={2} align="center" flexWrap="wrap">
                              <Badge colorScheme={typeColor[app.opportunity?.type] || "gray"}
                                borderRadius="full" px={2} fontSize="xs">
                                {app.opportunity?.type}
                              </Badge>
                              <Badge
                                bg={statusColors[app.status]?.bg}
                                color={statusColors[app.status]?.color}
                                borderRadius="full" px={2} fontSize="xs">
                                {app.status}
                              </Badge>
                            </Flex>
                            <Link href={`/opportunities/${app.opportunity?.id}`}>
                              <Text fontWeight="semibold" color="white" fontSize="sm"
                                cursor="pointer" _hover={{ color: "purple.300" }} transition="color 0.15s">
                                {app.opportunity?.title}
                              </Text>
                            </Link>
                            <Text color="gray.600" fontSize="xs">
                              Posted by {app.opportunity?.author?.name || "Anonymous"} ·{" "}
                              Applied {new Date(app.createdAt).toLocaleDateString()}
                            </Text>
                          </Stack>
                          {app.status === "PENDING" && (
                            <Button size="xs" variant="outline" borderColor="rgba(239,68,68,0.3)"
                              color="red.400" _hover={{ bg: "rgba(239,68,68,0.1)" }}
                              borderRadius="lg" onClick={() => withdraw(app.id)}>
                              Withdraw
                            </Button>
                          )}
                        </Flex>
                        {app.coverLetter && (
                          <Box mt={3} pt={3} borderTop="1px solid rgba(255,255,255,0.06)">
                            <Text color="gray.500" fontSize="xs" noOfLines={2}>{app.coverLetter}</Text>
                          </Box>
                        )}
                      </Box>
                    ))
                  )}
                </Stack>
              )}

              {/* Received Applications */}
              {tab === "received" && (
                <Stack gap={4}>
                  {received.length === 0 ? (
                    <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                      borderRadius="2xl" p={12} textAlign="center">
                      <Text fontSize="3xl" mb={3}>📥</Text>
                      <Heading size="sm" color="gray.500" mb={2}>No applications received yet</Heading>
                      <Text color="gray.600" fontSize="sm" mb={5}>Post an opportunity to start receiving applications</Text>
                      <Link href="/opportunities/new">
                        <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)"
                          color="white" borderRadius="lg" px={6}>Post Opportunity</Button>
                      </Link>
                    </Box>
                  ) : (
                    received.map((app) => (
                      <Box key={app.id} bg="rgba(255,255,255,0.03)"
                        border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" p={6}>
                        <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
                          <Flex gap={3} align="flex-start" flex={1}>
                            <Avatar.Root size="md" flexShrink={0}>
                              <Avatar.Fallback bg="blue.700" color="white" fontSize="sm">
                                {app.applicant?.name?.[0] || "?"}
                              </Avatar.Fallback>
                            </Avatar.Root>
                            <Stack gap={1}>
                              <Text fontWeight="semibold" color="white">{app.applicant?.name}</Text>
                              <Text color="gray.500" fontSize="xs">
                                {app.applicant?.university} {app.applicant?.major ? `· ${app.applicant.major}` : ""}
                              </Text>
                              <Link href={`/opportunities/${app.opportunity?.id}`}>
                                <Text color="gray.600" fontSize="xs" cursor="pointer"
                                  _hover={{ color: "purple.400" }} transition="color 0.15s">
                                  For: {app.opportunity?.title}
                                </Text>
                              </Link>
                              <Text color="gray.600" fontSize="xs">
                                Applied {new Date(app.createdAt).toLocaleDateString()}
                              </Text>
                            </Stack>
                          </Flex>
                          <Flex gap={2} align="center" flexWrap="wrap">
                            <Badge bg={statusColors[app.status]?.bg} color={statusColors[app.status]?.color}
                              borderRadius="full" px={3} py={1} fontSize="xs">{app.status}</Badge>
                            {app.status === "PENDING" && (
                              <>
                                <Button size="xs" onClick={() => updateStatus(app.id, "ACCEPTED")}
                                  bg="rgba(34,197,94,0.15)" color="green.300"
                                  border="1px solid rgba(34,197,94,0.25)"
                                  _hover={{ bg: "rgba(34,197,94,0.25)" }} borderRadius="lg">
                                  Accept ✓
                                </Button>
                                <Button size="xs" onClick={() => updateStatus(app.id, "REJECTED")}
                                  bg="rgba(239,68,68,0.1)" color="red.400"
                                  border="1px solid rgba(239,68,68,0.2)"
                                  _hover={{ bg: "rgba(239,68,68,0.2)" }} borderRadius="lg">
                                  Reject ✗
                                </Button>
                              </>
                            )}
                            {app.status === "REVIEWED" && (
                              <>
                                <Button size="xs" onClick={() => updateStatus(app.id, "ACCEPTED")}
                                  bg="rgba(34,197,94,0.15)" color="green.300"
                                  border="1px solid rgba(34,197,94,0.25)"
                                  _hover={{ bg: "rgba(34,197,94,0.25)" }} borderRadius="lg">
                                  Accept
                                </Button>
                                <Button size="xs" onClick={() => updateStatus(app.id, "REJECTED")}
                                  bg="rgba(239,68,68,0.1)" color="red.400"
                                  border="1px solid rgba(239,68,68,0.2)"
                                  _hover={{ bg: "rgba(239,68,68,0.2)" }} borderRadius="lg">
                                  Reject
                                </Button>
                              </>
                            )}
                          </Flex>
                        </Flex>
                        {app.coverLetter && (
                          <Box mt={4} pt={4} borderTop="1px solid rgba(255,255,255,0.06)">
                            <Text color="gray.500" fontSize="xs" fontWeight="semibold" mb={2}>Cover Letter</Text>
                            <Text color="gray.400" fontSize="sm" lineHeight="relaxed">{app.coverLetter}</Text>
                          </Box>
                        )}
                        {app.applicant?.bio && (
                          <Box mt={3}>
                            <Text color="gray.600" fontSize="xs" fontStyle="italic" noOfLines={2}>
                              {app.applicant.bio}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Stack>
          </Container>
        </Box>
      </Flex>
    </Box>
  );
}
