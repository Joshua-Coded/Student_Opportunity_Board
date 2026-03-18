"use client";

import {
  Box, Button, Container, Flex, Heading, Input, SimpleGrid, Stack, Text, Badge, Select,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const TYPES = ["ALL", "GIG", "INTERNSHIP", "PART_TIME", "FULL_TIME", "VOLUNTEER", "RESEARCH"];
const PAYMENT = ["ALL", "FREE", "CRYPTO", "NEGOTIABLE"];

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

export default function OpportunitiesPage() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (type !== "ALL") params.set("type", type);
    if (payment !== "ALL") params.set("paymentType", payment);

    setLoading(true);
    fetch(`/api/opportunities?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOpportunities(data.opportunities || []);
        setTotalPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, type, payment, page]);

  return (
    <Box minH="100vh" bg="gray.950" color="white">
      {/* Navbar */}
      <Box bg="rgba(10,10,20,0.8)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={6} py={4} position="sticky" top={0} zIndex={50}>
        <Flex maxW="7xl" mx="auto" justify="space-between" align="center">
          <Link href="/">
            <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">
              OpportunityBoard
            </Heading>
          </Link>
          <Flex gap={3}>
            {session ? (
              <Link href="/dashboard">
                <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }} borderRadius="lg">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm" color="gray.300">Log in</Button></Link>
                <Link href="/register">
                  <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white" borderRadius="lg">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </Flex>
        </Flex>
      </Box>

      <Container maxW="7xl" py={10}>
        <Stack gap={8}>
          {/* Header */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Stack gap={1}>
              <Heading size="xl">Browse Opportunities</Heading>
              <Text color="gray.400">Find gigs, internships, and more</Text>
            </Stack>
            {session && (
              <Link href="/opportunities/new">
                <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="xl">
                  + Post Opportunity
                </Button>
              </Link>
            )}
          </Flex>

          {/* Filters */}
          <Flex gap={3} flexWrap="wrap">
            <Input
              placeholder="Search opportunities..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
              color="white" _placeholder={{ color: "gray.600" }}
              _focus={{ borderColor: "purple.500" }}
              borderRadius="xl" maxW="300px"
            />
            <Flex gap={2} flexWrap="wrap">
              {TYPES.map((t) => (
                <Button key={t} size="sm" onClick={() => { setType(t); setPage(1); }}
                  bg={type === t ? "purple.600" : "rgba(255,255,255,0.05)"}
                  color={type === t ? "white" : "gray.400"}
                  border="1px solid" borderColor={type === t ? "purple.500" : "rgba(255,255,255,0.08)"}
                  _hover={{ bg: "purple.600", color: "white" }} borderRadius="full" fontSize="xs">
                  {t}
                </Button>
              ))}
            </Flex>
            <Flex gap={2} flexWrap="wrap">
              {PAYMENT.map((p) => (
                <Button key={p} size="sm" onClick={() => { setPayment(p); setPage(1); }}
                  bg={payment === p ? "blue.700" : "rgba(255,255,255,0.05)"}
                  color={payment === p ? "white" : "gray.400"}
                  border="1px solid" borderColor={payment === p ? "blue.500" : "rgba(255,255,255,0.08)"}
                  _hover={{ bg: "blue.700", color: "white" }} borderRadius="full" fontSize="xs">
                  {p}
                </Button>
              ))}
            </Flex>
          </Flex>

          {/* Grid */}
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {[...Array(6)].map((_, i) => (
                <Box key={i} bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.06)"
                  borderRadius="2xl" p={6} h="200px" />
              ))}
            </SimpleGrid>
          ) : opportunities.length === 0 ? (
            <Box textAlign="center" py={20}>
              <Text fontSize="4xl" mb={4}>🔍</Text>
              <Heading size="md" color="gray.400">No opportunities found</Heading>
              <Text color="gray.600" mt={2}>Try adjusting your filters</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {opportunities.map((opp) => (
                <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                  <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                    borderRadius="2xl" p={6} cursor="pointer" transition="all 0.2s"
                    _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.4)", transform: "translateY(-2px)" }}>
                    <Stack gap={3}>
                      <Flex justify="space-between" align="flex-start">
                        <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={2} fontSize="xs">
                          {opp.type}
                        </Badge>
                        {opp.paymentType === "CRYPTO" && (
                          <Badge bg="rgba(139,92,246,0.2)" color="purple.300" borderRadius="full" px={2} fontSize="xs">
                            ⚡ Crypto
                          </Badge>
                        )}
                      </Flex>
                      <Heading size="sm" color="white" noOfLines={2}>{opp.title}</Heading>
                      <Text color="gray.400" fontSize="sm" noOfLines={2}>{opp.description}</Text>
                      <Flex justify="space-between" align="center" mt={2}>
                        <Text color="gray.600" fontSize="xs">
                          {opp.author?.university || opp.author?.name || "Anonymous"}
                        </Text>
                        <Text color="gray.600" fontSize="xs">
                          {opp.isRemote ? "🌍 Remote" : opp.location}
                        </Text>
                      </Flex>
                      {opp.compensationAmount && (
                        <Text color="purple.300" fontSize="sm" fontWeight="semibold">
                          {opp.compensationAmount} {opp.compensationCurrency}
                        </Text>
                      )}
                    </Stack>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" gap={2} mt={4}>
              <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1} variant="outline" borderColor="rgba(255,255,255,0.1)"
                color="gray.400" borderRadius="lg">← Prev</Button>
              <Text color="gray.500" fontSize="sm" alignSelf="center">
                Page {page} of {totalPages}
              </Text>
              <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages} variant="outline" borderColor="rgba(255,255,255,0.1)"
                color="gray.400" borderRadius="lg">Next →</Button>
            </Flex>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
