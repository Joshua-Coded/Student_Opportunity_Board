"use client";

import {
  Badge, Box, Button, Container, Flex, Heading,
  Input, Select, SimpleGrid, Stack, Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const TYPES = ["ALL", "GIG", "INTERNSHIP", "PART_TIME", "FULL_TIME", "VOLUNTEER", "RESEARCH"];
const PAYMENT = ["ALL", "FREE", "CRYPTO", "NEGOTIABLE"];
const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

export default function OpportunitiesPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [university, setUniversity] = useState("");
  const [universities, setUniversities] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/crypto/price?symbol=ETH").then((r) => r.json()),
      fetch("/api/crypto/price?symbol=MATIC").then((r) => r.json()),
      fetch("/api/universities").then((r) => r.json()),
    ]).then(([eth, matic, unis]) => {
      setPrices({ ETH: eth.usd || 0, MATIC: matic.usd || 0, USDC: 1 });
      if (Array.isArray(unis)) setUniversities(unis);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/saved").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setSavedIds(new Set(data.map((s: any) => s.opportunityId)));
    }).catch(() => {});
  }, [session]);

  async function toggleSave(e: React.MouseEvent, oppId: string) {
    e.preventDefault();
    if (!session) return;
    const res = await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: oppId }),
    });
    const data = await res.json();
    setSavedIds((prev) => {
      const next = new Set(prev);
      data.saved ? next.add(oppId) : next.delete(oppId);
      return next;
    });
  }

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (type !== "ALL") params.set("type", type);
    if (payment !== "ALL") params.set("paymentType", payment);
    if (university) params.set("university", university);
    setLoading(true);
    fetch(`/api/opportunities?${params}`)
      .then((r) => r.json())
      .then((data) => { setOpportunities(data.opportunities || []); setTotalPages(data.pages || 1); })
      .finally(() => setLoading(false));
  }, [search, type, payment, university, page]);

  return (
    <Box minH="100vh" bg="#050510" color="white">
      {/* Navbar */}
      <Box bg="rgba(5,5,16,0.85)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={{ base: 4, md: 6 }} py={4}
        position="sticky" top={0} zIndex={50}>
        <Flex maxW="7xl" mx="auto" justify="space-between" align="center">
          <Link href="/">
            <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">
              OpportunityBoard
            </Heading>
          </Link>
          <Flex gap={3} align="center">
            <LanguageToggle />
            {session ? (
              <Link href="/dashboard">
                <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }} borderRadius="lg">
                  {t.nav.dashboard}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm" color="gray.300">{t.nav.login}</Button></Link>
                <Link href="/register">
                  <Button size="sm" bgGradient="linear(to-r, purple.500, blue.500)" color="white" borderRadius="lg">{t.nav.signup}</Button>
                </Link>
              </>
            )}
          </Flex>
        </Flex>
      </Box>

      <Container maxW="7xl" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
        <Stack spacing={8}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size={{ base: "lg", md: "xl" }}>{t.browse.title}</Heading>
              <Text color="gray.400" mt={1}>{t.browse.subtitle}</Text>
            </Box>
            {session && (
              <Link href="/opportunities/new">
                <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="xl">
                  {t.nav.postOpportunity}
                </Button>
              </Link>
            )}
          </Flex>

          {/* Filters */}
          <Stack spacing={3}>
            <Flex gap={3} flexWrap="wrap">
              <Input placeholder={t.browse.search} value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                color="white" _placeholder={{ color: "gray.600" }}
                _focus={{ borderColor: "purple.500" }} borderRadius="xl" maxW={{ base: "full", md: "320px" }} />
              {universities.length > 0 && (
                <Select value={university} onChange={(e) => { setUniversity(e.target.value); setPage(1); }}
                  bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                  color={university ? "white" : "gray.600"} borderRadius="xl"
                  _focus={{ borderColor: "purple.500" }} maxW={{ base: "full", md: "260px" }}
                  sx={{ option: { bg: "#0d0d1a", color: "white" } }}>
                  <option value="">{t.browse.allUniversities}</option>
                  {universities.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Select>
              )}
            </Flex>
            <Flex gap={2} flexWrap="wrap">
              {TYPES.map((ty) => (
                <Button key={ty} size="sm" onClick={() => { setType(ty); setPage(1); }}
                  bg={type === ty ? "purple.600" : "rgba(255,255,255,0.05)"}
                  color={type === ty ? "white" : "gray.400"}
                  border="1px solid" borderColor={type === ty ? "purple.500" : "rgba(255,255,255,0.08)"}
                  _hover={{ bg: "purple.700", color: "white" }} borderRadius="full" fontSize="xs">
                  {ty}
                </Button>
              ))}
              {PAYMENT.map((p) => (
                <Button key={p} size="sm" onClick={() => { setPayment(p); setPage(1); }}
                  bg={payment === p ? "blue.700" : "rgba(255,255,255,0.05)"}
                  color={payment === p ? "white" : "gray.400"}
                  border="1px solid" borderColor={payment === p ? "blue.500" : "rgba(255,255,255,0.08)"}
                  _hover={{ bg: "blue.800", color: "white" }} borderRadius="full" fontSize="xs">
                  {p}
                </Button>
              ))}
            </Flex>
          </Stack>

          {/* Grid */}
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[...Array(6)].map((_, i) => (
                <Box key={i} bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.06)"
                  borderRadius="2xl" h="200px" />
              ))}
            </SimpleGrid>
          ) : opportunities.length === 0 ? (
            <Box textAlign="center" py={20}>
              <Text fontSize="4xl" mb={4}>🔍</Text>
              <Heading size="md" color="gray.400">{t.browse.noResults}</Heading>
              <Text color="gray.600" mt={2}>{t.browse.adjustFilters}</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {opportunities.map((opp) => (
                <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                  <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                    borderRadius="2xl" p={6} cursor="pointer" transition="all 0.2s" h="full"
                    _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "purple.800", transform: "translateY(-2px)" }}>
                    <Stack spacing={3}>
                      <Flex justify="space-between" align="flex-start">
                        <Flex gap={2}>
                          <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={2} fontSize="xs">
                            {opp.type}
                          </Badge>
                            {opp.paymentType === "CRYPTO" && (
                            <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="xs">⚡ {t.common.crypto}</Badge>
                          )}
                        </Flex>
                        {session && (
                          <Button size="xs" variant="ghost" px={1}
                            color={savedIds.has(opp.id) ? "red.400" : "gray.600"}
                            _hover={{ color: "red.400", bg: "transparent" }}
                            onClick={(e) => toggleSave(e, opp.id)}
                            title={savedIds.has(opp.id) ? "Unsave" : "Save"}>
                            {savedIds.has(opp.id) ? "♥" : "♡"}
                          </Button>
                        )}
                      </Flex>
                      <Heading size="sm" color="white" noOfLines={2}>{opp.title}</Heading>
                      <Text color="gray.400" fontSize="sm" noOfLines={2}>{opp.description}</Text>
                      <Flex justify="space-between" align="center" mt="auto">
                        <Text color="gray.600" fontSize="xs">{opp.author?.university || opp.author?.name || "Anonymous"}</Text>
                        <Text color="gray.600" fontSize="xs">{opp.isRemote ? t.opportunity.remote : opp.location}</Text>
                      </Flex>
                      {opp.compensationAmount && (
                        <Flex align="baseline" gap={2} flexWrap="wrap">
                          <Text color="purple.300" fontSize="sm" fontWeight="semibold">
                            {opp.compensationAmount} {opp.compensationCurrency}
                          </Text>
                          {prices[opp.compensationCurrency] && opp.compensationCurrency !== "USDC" && (
                            <Text color="gray.600" fontSize="xs">
                              ≈ ${(parseFloat(opp.compensationAmount) * prices[opp.compensationCurrency]).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </Text>
                          )}
                        </Flex>
                      )}
                    </Stack>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" gap={3} mt={4}>
              <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}
                isDisabled={page === 1} variant="outline" borderColor="rgba(255,255,255,0.1)"
                color="gray.400" borderRadius="lg">{t.browse.prev}</Button>
              <Text color="gray.500" fontSize="sm" alignSelf="center">Page {page} of {totalPages}</Text>
              <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                isDisabled={page === totalPages} variant="outline" borderColor="rgba(255,255,255,0.1)"
                color="gray.400" borderRadius="lg">{t.browse.next}</Button>
            </Flex>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
