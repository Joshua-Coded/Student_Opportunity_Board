"use client";

import {
  Avatar, Badge, Box, Button, Container, Flex, Heading, Stack, Text,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CryptoPaymentModal from "@/components/payments/CryptoPaymentModal";
import MobileNav from "@/components/MobileNav";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Browse", href: "/opportunities", icon: "🔍" },
  { label: "Post New", href: "/opportunities/new", icon: "➕" },
  { label: "Applications", href: "/dashboard/applications", icon: "📨" },
  { label: "Profile", href: "/dashboard/profile", icon: "👤" },
];

const statusScheme: Record<string, string> = {
  PENDING: "yellow", REVIEWED: "blue", ACCEPTED: "green", REJECTED: "red",
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
  const [payTarget, setPayTarget] = useState<{ app: any } | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

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

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setReceived((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
  }

  async function withdraw(id: string) {
    if (!confirm("Withdraw this application?")) return;
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setSent((prev) => prev.filter((a) => a.id !== id));
  }

  if (status === "loading" || loading) {
    return <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center"><Text color="gray.500">Loading...</Text></Box>;
  }

  return (
    <>
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
                    bg={item.href === "/dashboard/applications" ? "rgba(139,92,246,0.1)" : "transparent"}
                    borderLeft="2px solid" borderColor={item.href === "/dashboard/applications" ? "purple.500" : "transparent"}>
                    <Text>{item.icon}</Text>
                    <Text fontSize="sm" color={item.href === "/dashboard/applications" ? "purple.300" : "gray.400"}
                      fontWeight={item.href === "/dashboard/applications" ? "medium" : "normal"}>{item.label}</Text>
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
            <Heading size="md">Applications</Heading>
          </Box>

          <Container maxW="4xl" py={8} px={{ base: 4, md: 8 }} pb={{ base: 24, md: 8 }}>
            <Stack spacing={6}>
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

              {/* Sent */}
              {tab === "sent" && (
                <Stack spacing={4}>
                  {sent.length === 0 ? (
                    <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                      borderRadius="2xl" p={12} textAlign="center">
                      <Text fontSize="3xl" mb={3}>📨</Text>
                      <Text color="gray.500" fontSize="sm" mb={4}>No applications sent yet</Text>
                      <Link href="/opportunities"><Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white" borderRadius="lg">Browse Opportunities</Button></Link>
                    </Box>
                  ) : sent.map((app) => (
                    <Box key={app.id} bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" p={5}>
                      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                        <Stack spacing={1} flex={1}>
                          <Flex gap={2} align="center" flexWrap="wrap">
                            <Badge colorScheme={typeColor[app.opportunity?.type] || "gray"} borderRadius="full" px={2} fontSize="xs">{app.opportunity?.type}</Badge>
                            <Badge colorScheme={statusScheme[app.status] || "gray"} borderRadius="full" px={2} fontSize="xs">{app.status}</Badge>
                          </Flex>
                          <Link href={`/opportunities/${app.opportunity?.id}`}>
                            <Text fontWeight="semibold" color="white" fontSize="sm" cursor="pointer" _hover={{ color: "purple.300" }}>{app.opportunity?.title}</Text>
                          </Link>
                          {app.opportunity?.author?.id && (
                            <Link href={`/profile/${app.opportunity.author.id}`}>
                              <Flex align="center" gap={2} mt={1} w="fit-content">
                                <Avatar size="xs" name={app.opportunity.author.name || "?"} src={app.opportunity.author.image || undefined} bg="purple.700" />
                                <Text color="gray.500" fontSize="xs" _hover={{ color: "purple.300" }}>
                                  Posted by {app.opportunity.author.name}
                                  {app.opportunity.author.university ? ` · ${app.opportunity.author.university}` : ""}
                                </Text>
                              </Flex>
                            </Link>
                          )}
                          <Text color="gray.700" fontSize="xs">Applied {new Date(app.createdAt).toLocaleDateString()}</Text>
                        </Stack>
                        {app.status === "PENDING" && (
                          <Button size="xs" variant="outline" borderColor="rgba(239,68,68,0.3)"
                            color="red.400" _hover={{ bg: "rgba(239,68,68,0.1)" }} borderRadius="lg"
                            onClick={() => withdraw(app.id)}>Withdraw</Button>
                        )}
                      </Flex>
                      {app.coverLetter && (
                        <Box mt={3} pt={3} borderTop="1px solid rgba(255,255,255,0.06)">
                          <Text color="gray.500" fontSize="xs" noOfLines={2}>{app.coverLetter}</Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Received */}
              {tab === "received" && (
                <Stack spacing={4}>
                  {received.length === 0 ? (
                    <Box bg="rgba(255,255,255,0.02)" border="1px dashed rgba(255,255,255,0.08)"
                      borderRadius="2xl" p={12} textAlign="center">
                      <Text fontSize="3xl" mb={3}>📥</Text>
                      <Text color="gray.500" fontSize="sm" mb={4}>No applications received yet</Text>
                      <Link href="/opportunities/new"><Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white" borderRadius="lg">Post Opportunity</Button></Link>
                    </Box>
                  ) : received.map((app) => (
                    <Box key={app.id}
                      bg="rgba(255,255,255,0.03)"
                      border={`1px solid ${app.status === "ACCEPTED" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`}
                      borderRadius="xl" p={6}>

                      {/* Applicant profile row */}
                      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
                        <Flex gap={4} align="flex-start" flex={1}>
                          <Link href={`/profile/${app.applicant?.id}`}>
                            <Avatar
                              size="lg"
                              name={app.applicant?.name || "?"}
                              src={app.applicant?.image || undefined}
                              bg="blue.700" color="white" flexShrink={0}
                              cursor="pointer"
                            />
                          </Link>
                          <Stack spacing={1} flex={1}>
                            <Link href={`/profile/${app.applicant?.id}`}>
                              <Text fontWeight="semibold" color="white" _hover={{ color: "purple.300" }} cursor="pointer">
                                {app.applicant?.name}
                              </Text>
                            </Link>
                            {(app.applicant?.university || app.applicant?.major) && (
                              <Text color="purple.400" fontSize="xs" fontWeight="medium">
                                🎓 {app.applicant?.university}{app.applicant?.major ? ` · ${app.applicant.major}` : ""}
                              </Text>
                            )}
                            {app.applicant?.bio && (
                              <Text color="gray.500" fontSize="xs" noOfLines={2} mt={0.5}>{app.applicant.bio}</Text>
                            )}
                            <Flex gap={3} mt={1} flexWrap="wrap">
                              <Link href={`/opportunities/${app.opportunity?.id}`}>
                                <Text color="gray.600" fontSize="xs" cursor="pointer" _hover={{ color: "purple.400" }}>
                                  📋 {app.opportunity?.title}
                                </Text>
                              </Link>
                              <Text color="gray.700" fontSize="xs">Applied {new Date(app.createdAt).toLocaleDateString()}</Text>
                            </Flex>
                          </Stack>
                        </Flex>

                        {/* Actions */}
                        <Stack spacing={2} align="flex-end">
                          <Badge colorScheme={statusScheme[app.status] || "gray"} borderRadius="full" px={3} py={1} fontSize="xs">
                            {app.status}
                          </Badge>
                          <Flex gap={2} flexWrap="wrap" justify="flex-end">
                            {(app.status === "PENDING" || app.status === "REVIEWED") && (
                              <>
                                <Button size="xs" onClick={() => updateStatus(app.id, "ACCEPTED")}
                                  bg="rgba(34,197,94,0.15)" color="green.300" border="1px solid rgba(34,197,94,0.25)"
                                  _hover={{ bg: "rgba(34,197,94,0.25)" }} borderRadius="lg">Accept ✓</Button>
                                <Button size="xs" onClick={() => updateStatus(app.id, "REJECTED")}
                                  bg="rgba(239,68,68,0.1)" color="red.400" border="1px solid rgba(239,68,68,0.2)"
                                  _hover={{ bg: "rgba(239,68,68,0.2)" }} borderRadius="lg">Reject ✗</Button>
                              </>
                            )}
                            {app.status === "ACCEPTED" && app.opportunity?.paymentType === "CRYPTO" && (
                              <Button size="xs"
                                bg="rgba(139,92,246,0.15)" color="purple.300"
                                border="1px solid rgba(139,92,246,0.3)"
                                _hover={{ bg: "rgba(139,92,246,0.25)" }} borderRadius="lg"
                                onClick={() => setPayTarget({ app })}>
                                ⚡ Pay with Crypto
                              </Button>
                            )}
                          </Flex>
                        </Stack>
                      </Flex>

                      {/* Cover Letter */}
                      {app.coverLetter && (
                        <Box mt={4} pt={4} borderTop="1px solid rgba(255,255,255,0.06)">
                          <Text color="gray.500" fontSize="xs" fontWeight="semibold" mb={2}>📄 Cover Letter</Text>
                          <Text color="gray.400" fontSize="sm" lineHeight="relaxed">{app.coverLetter}</Text>
                        </Box>
                      )}

                      {/* Portfolio link */}
                      {app.portfolioUrl && (
                        <Box mt={2}>
                          <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            <Text color="purple.400" fontSize="xs" _hover={{ textDecoration: "underline" }}>
                              🔗 {app.portfolioUrl}
                            </Text>
                          </a>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </Container>
        </Box>
      </Flex>
    </Box>

    {payTarget && (
      <CryptoPaymentModal
        opportunity={payTarget.app.opportunity}
        applicantId={payTarget.app.applicant?.id}
        applicantName={payTarget.app.applicant?.name || "Applicant"}
        onClose={() => setPayTarget(null)}
      />
    )}
    <MobileNav />
    </>
  );
}
