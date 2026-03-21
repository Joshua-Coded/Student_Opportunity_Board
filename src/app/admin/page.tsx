"use client";

import {
  Badge, Box, Button, Container, Flex, Heading, SimpleGrid, Stack, Table,
  Tbody, Td, Text, Th, Thead, Tr, useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "opportunities" | "payments">("users");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => {
      if (d.error) { router.push("/dashboard"); return; }
      setData(d);
      setLoading(false);
    });
  }, [status, router]);

  async function closeOpp(id: string) {
    await fetch("/api/admin/opportunities", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CLOSED" }),
    });
    setData((prev: any) => ({
      ...prev,
      recentOpps: prev.recentOpps.map((o: any) => o.id === id ? { ...o, status: "CLOSED" } : o),
    }));
    toast({ title: "Opportunity closed", status: "success", duration: 2000 });
  }

  async function deleteOpp(id: string) {
    if (!confirm("Permanently delete this opportunity?")) return;
    await fetch("/api/admin/opportunities", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setData((prev: any) => ({ ...prev, recentOpps: prev.recentOpps.filter((o: any) => o.id !== id) }));
    toast({ title: "Opportunity deleted", status: "success", duration: 2000 });
  }

  if (loading) return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
      <Text color="gray.500">Loading admin...</Text>
    </Box>
  );

  const { stats, recentUsers, recentOpps, recentPayments } = data;

  return (
    <Box minH="100vh" bg="#050510" color="white">
      <Box bg="rgba(5,5,16,0.9)" backdropFilter="blur(20px)" borderBottom="1px solid rgba(255,255,255,0.07)" px={6} py={4} position="sticky" top={0} zIndex={50}>
        <Flex maxW="7xl" mx="auto" justify="space-between" align="center">
          <Flex align="center" gap={4}>
            <Link href="/"><Heading size="sm" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
            <Badge colorScheme="red" borderRadius="full" px={2}>Admin</Badge>
          </Flex>
          <Link href="/dashboard"><Button variant="ghost" size="sm" color="gray.400">← Dashboard</Button></Link>
        </Flex>
      </Box>

      <Container maxW="7xl" py={8} px={{ base: 4, md: 8 }}>
        <Stack spacing={8}>
          <Heading size="lg">Admin Dashboard</Heading>

          {/* Stats */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            {[
              { label: "Total Users", value: stats.users, color: "purple" },
              { label: "Opportunities", value: stats.opportunities, color: "blue" },
              { label: "Payments Made", value: stats.payments, color: "green" },
              { label: "Applications", value: stats.applications, color: "orange" },
              { label: "Ratings", value: stats.ratings, color: "yellow" },
            ].map((s) => (
              <Box key={s.label} bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" p={5}>
                <Text fontSize="2xl" fontWeight="black" color="white">{s.value}</Text>
                <Text color="gray.500" fontSize="xs" mt={1}>{s.label}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Tabs */}
          <Flex gap={2} bg="rgba(255,255,255,0.03)" p={1} borderRadius="xl" border="1px solid rgba(255,255,255,0.07)" w="fit-content">
            {(["users", "opportunities", "payments"] as const).map((t) => (
              <Button key={t} size="sm" onClick={() => setTab(t)}
                bg={tab === t ? "rgba(139,92,246,0.2)" : "transparent"}
                color={tab === t ? "purple.300" : "gray.500"}
                borderRadius="lg" px={5} _hover={{ color: "white" }} transition="all 0.15s" textTransform="capitalize">
                {t}
              </Button>
            ))}
          </Flex>

          {/* Users table */}
          {tab === "users" && (
            <Box bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.07)" borderRadius="2xl" overflow="hidden">
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr borderBottom="1px solid rgba(255,255,255,0.07)">
                      <Th color="gray.500" borderColor="transparent">Name</Th>
                      <Th color="gray.500" borderColor="transparent">Email</Th>
                      <Th color="gray.500" borderColor="transparent">University</Th>
                      <Th color="gray.500" borderColor="transparent">Verified</Th>
                      <Th color="gray.500" borderColor="transparent">Listings</Th>
                      <Th color="gray.500" borderColor="transparent">Joined</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentUsers.map((u: any) => (
                      <Tr key={u.id} _hover={{ bg: "rgba(255,255,255,0.02)" }} borderBottom="1px solid rgba(255,255,255,0.04)">
                        <Td borderColor="transparent">
                          <Flex align="center" gap={2}>
                            <Text color="white" fontSize="sm">{u.name || "—"}</Text>
                            {u.isAdmin && <Badge colorScheme="red" fontSize="9px">admin</Badge>}
                          </Flex>
                        </Td>
                        <Td color="gray.400" fontSize="xs" borderColor="transparent">{u.email}</Td>
                        <Td color="gray.500" fontSize="xs" borderColor="transparent">{u.university || "—"}</Td>
                        <Td borderColor="transparent">
                          <Badge colorScheme={u.emailVerified ? "green" : "yellow"} fontSize="9px" borderRadius="full">
                            {u.emailVerified ? "✓" : "pending"}
                          </Badge>
                        </Td>
                        <Td color="gray.400" fontSize="xs" borderColor="transparent">{u._count.opportunities}</Td>
                        <Td color="gray.600" fontSize="xs" borderColor="transparent">{new Date(u.createdAt).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          )}

          {/* Opportunities table */}
          {tab === "opportunities" && (
            <Box bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.07)" borderRadius="2xl" overflow="hidden">
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr borderBottom="1px solid rgba(255,255,255,0.07)">
                      <Th color="gray.500" borderColor="transparent">Title</Th>
                      <Th color="gray.500" borderColor="transparent">Posted by</Th>
                      <Th color="gray.500" borderColor="transparent">Type</Th>
                      <Th color="gray.500" borderColor="transparent">Status</Th>
                      <Th color="gray.500" borderColor="transparent">Date</Th>
                      <Th color="gray.500" borderColor="transparent">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentOpps.map((o: any) => (
                      <Tr key={o.id} _hover={{ bg: "rgba(255,255,255,0.02)" }} borderBottom="1px solid rgba(255,255,255,0.04)">
                        <Td borderColor="transparent">
                          <Link href={`/opportunities/${o.id}`}>
                            <Text color="white" fontSize="sm" _hover={{ color: "purple.300" }} noOfLines={1} maxW="200px">{o.title}</Text>
                          </Link>
                        </Td>
                        <Td color="gray.400" fontSize="xs" borderColor="transparent">{o.author?.name}</Td>
                        <Td borderColor="transparent"><Badge colorScheme="purple" fontSize="9px">{o.type}</Badge></Td>
                        <Td borderColor="transparent">
                          <Badge colorScheme={o.status === "ACTIVE" ? "green" : "gray"} fontSize="9px">{o.status}</Badge>
                        </Td>
                        <Td color="gray.600" fontSize="xs" borderColor="transparent">{new Date(o.createdAt).toLocaleDateString()}</Td>
                        <Td borderColor="transparent">
                          <Flex gap={2}>
                            {o.status === "ACTIVE" && (
                              <Button size="xs" onClick={() => closeOpp(o.id)}
                                bg="rgba(234,179,8,0.1)" color="yellow.300" border="1px solid rgba(234,179,8,0.2)"
                                _hover={{ bg: "rgba(234,179,8,0.2)" }} borderRadius="lg">Close</Button>
                            )}
                            <Button size="xs" onClick={() => deleteOpp(o.id)}
                              bg="rgba(239,68,68,0.1)" color="red.400" border="1px solid rgba(239,68,68,0.2)"
                              _hover={{ bg: "rgba(239,68,68,0.2)" }} borderRadius="lg">Delete</Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          )}

          {/* Payments table */}
          {tab === "payments" && (
            <Box bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.07)" borderRadius="2xl" overflow="hidden">
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr borderBottom="1px solid rgba(255,255,255,0.07)">
                      <Th color="gray.500" borderColor="transparent">Gig</Th>
                      <Th color="gray.500" borderColor="transparent">Paid by</Th>
                      <Th color="gray.500" borderColor="transparent">Amount</Th>
                      <Th color="gray.500" borderColor="transparent">TX Hash</Th>
                      <Th color="gray.500" borderColor="transparent">Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentPayments.map((p: any) => (
                      <Tr key={p.id} _hover={{ bg: "rgba(255,255,255,0.02)" }} borderBottom="1px solid rgba(255,255,255,0.04)">
                        <Td color="white" fontSize="sm" borderColor="transparent" maxW="180px">
                          <Text noOfLines={1}>{p.opportunity?.title}</Text>
                        </Td>
                        <Td color="gray.400" fontSize="xs" borderColor="transparent">{p.payer?.name}</Td>
                        <Td borderColor="transparent">
                          <Text color="green.300" fontWeight="bold" fontSize="sm">{p.cryptoAmount.toString()} {p.cryptoCurrency}</Text>
                        </Td>
                        <Td color="gray.600" fontSize="xs" fontFamily="mono" borderColor="transparent">
                          {p.txHash ? `${p.txHash.slice(0, 14)}...` : "—"}
                        </Td>
                        <Td color="gray.600" fontSize="xs" borderColor="transparent">
                          {p.confirmedAt ? new Date(p.confirmedAt).toLocaleDateString() : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
