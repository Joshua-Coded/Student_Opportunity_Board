"use client";

import {
  Avatar, Badge, Box, Button, Container, Flex, Heading, Stack, Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ApplyModal from "@/components/applications/ApplyModal";
import GigPaymentButton from "@/components/GigPaymentButton";

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cryptoPrice, setCryptoPrice] = useState<number | null>(null);
  const [acceptedApplicants, setAcceptedApplicants] = useState<any[]>([]);
  const [paidApplicants, setPaidApplicants] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/opportunities/${id}`).then((r) => r.json()).then((data) => { setOpp(data); setLoading(false); });
  }, [id]);

  // Fetch live price once we know the currency
  useEffect(() => {
    if (!opp?.compensationAmount || !opp?.compensationCurrency || opp.paymentType !== "CRYPTO") return;
    const symbol = opp.compensationCurrency;
    if (symbol === "USDC") { setCryptoPrice(1); return; } // USDC is always ~$1
    fetch(`/api/crypto/price?symbol=${symbol}`)
      .then((r) => r.json())
      .then((d) => { if (d.usd) setCryptoPrice(d.usd); })
      .catch(() => {});
  }, [opp]);

  useEffect(() => {
    if (!session?.user?.id || !id) return;
    fetch("/api/applications?mode=sent").then((r) => r.json()).then((apps: any[]) => {
      if (Array.isArray(apps)) setApplied(apps.some((a) => a.opportunityId === id));
    });
  }, [session, id]);

  // Fetch accepted applicants when owner views a CRYPTO gig
  useEffect(() => {
    if (!opp || !session?.user?.id) return;
    if (session.user.id !== opp.author?.id) return;
    if (opp.paymentType !== "CRYPTO") return;
    fetch(`/api/applications?mode=received&opportunityId=${id}&status=ACCEPTED`)
      .then((r) => r.json())
      .then((apps: any[]) => {
        if (Array.isArray(apps)) setAcceptedApplicants(apps);
      });
  }, [opp, session, id]);

  async function handleDelete() {
    if (!confirm("Delete this opportunity?")) return;
    setDeleting(true);
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Loading...</Text>
      </Box>
    );
  }

  if (!opp || opp.error) {
    return (
      <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
        <Stack align="center" spacing={4}>
          <Text fontSize="4xl">😕</Text>
          <Heading color="gray.400" size="md">Opportunity not found</Heading>
          <Link href="/opportunities"><Button variant="outline" color="gray.400" borderRadius="xl">Back to Browse</Button></Link>
        </Stack>
      </Box>
    );
  }

  const isOwner = session?.user?.id === opp.author?.id;

  return (
    <Box minH="100vh" bg="#050510" color="white">
      <Box bg="rgba(5,5,16,0.85)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={6} py={4}
        position="sticky" top={0} zIndex={50}>
        <Flex maxW="4xl" mx="auto" justify="space-between" align="center">
          <Link href="/"><Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
          <Link href="/opportunities"><Button variant="ghost" size="sm" color="gray.400">← Browse</Button></Link>
        </Flex>
      </Box>

      <Container maxW="4xl" py={10}>
        <Stack spacing={5}>
          {/* Header */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={8}>
            <Stack spacing={5}>
              <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                <Flex gap={2} flexWrap="wrap">
                  <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={3} py={1}>{opp.type}</Badge>
                  <Badge colorScheme={opp.status === "ACTIVE" ? "green" : "gray"} borderRadius="full" px={3} py={1}>{opp.status}</Badge>
                  {opp.paymentType === "CRYPTO" && <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>⚡ Crypto</Badge>}
                </Flex>
                {isOwner && (
                  <Flex gap={2}>
                    <Link href={`/opportunities/${id}/edit`}>
                      <Button size="sm" variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400" borderRadius="lg">Edit</Button>
                    </Link>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={handleDelete} isLoading={deleting} borderRadius="lg">Delete</Button>
                  </Flex>
                )}
              </Flex>
              <Heading size="xl" color="white">{opp.title}</Heading>
              {opp.compensationAmount && (
                <Flex align="baseline" gap={3} flexWrap="wrap">
                  <Text color="purple.300" fontSize="xl" fontWeight="bold">
                    {opp.compensationAmount} {opp.compensationCurrency}
                  </Text>
                  {cryptoPrice && opp.compensationCurrency !== "USDC" && (
                    <Text color="gray.500" fontSize="sm">
                      ≈ ${(parseFloat(opp.compensationAmount) * cryptoPrice).toLocaleString("en-US", { maximumFractionDigits: 2 })} USD
                    </Text>
                  )}
                  {cryptoPrice && opp.compensationCurrency === "USDC" && (
                    <Text color="gray.500" fontSize="sm">≈ ${parseFloat(opp.compensationAmount).toLocaleString()} USD</Text>
                  )}
                </Flex>
              )}
              <Flex gap={5} flexWrap="wrap">
                <Text color="gray.400" fontSize="sm">{opp.isRemote ? "🌍 Remote" : `📍 ${opp.location}`}</Text>
                <Text color="gray.400" fontSize="sm">📅 {new Date(opp.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
                {opp._count?.applications > 0 && (
                  <Text color="gray.400" fontSize="sm">👥 {opp._count.applications} applicant{opp._count.applications !== 1 ? "s" : ""}</Text>
                )}
              </Flex>
            </Stack>
          </Box>

          {/* Cover Image */}
          {opp.images?.length > 0 && (
            <Box borderRadius="2xl" overflow="hidden" border="1px solid rgba(255,255,255,0.08)" maxH="360px">
              <img src={opp.images[0]} alt={opp.title} style={{ width: "100%", height: "100%", objectFit: "cover", maxHeight: "360px" }} />
            </Box>
          )}

          {/* Description */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={8}>
            <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={4}>Description</Text>
            <Text color="gray.300" lineHeight="tall" whiteSpace="pre-wrap" fontSize="sm">{opp.description}</Text>
            {opp.aiSummary && (
              <Box mt={6} bg="rgba(139,92,246,0.08)" border="1px solid rgba(139,92,246,0.2)" borderRadius="xl" p={4}>
                <Text color="purple.300" fontSize="xs" fontWeight="bold" mb={1}>✨ AI Summary</Text>
                <Text color="gray.300" fontSize="sm">{opp.aiSummary}</Text>
              </Box>
            )}
          </Box>

          {/* Skills & Tags */}
          {(opp.skills?.length > 0 || opp.tags?.length > 0) && (
            <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={6}>
              {opp.skills?.length > 0 && (
                <Stack spacing={3} mb={opp.tags?.length > 0 ? 5 : 0}>
                  <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Skills Required</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.skills.map((s: string) => (
                      <Badge key={s} colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">{s}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
              {opp.tags?.length > 0 && (
                <Stack spacing={3}>
                  <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Tags</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.tags.map((t: string) => (
                      <Badge key={t} variant="outline" colorScheme="gray" borderRadius="full" px={3} py={1} fontSize="xs">#{t}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
            </Box>
          )}

          {/* Pay Accepted Applicants — visible to owner on CRYPTO gigs */}
          {isOwner && opp.paymentType === "CRYPTO" && acceptedApplicants.length > 0 && (
            <Box bg="rgba(139,92,246,0.06)" border="1px solid rgba(139,92,246,0.25)" borderRadius="2xl" p={6}>
              <Text color="purple.300" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={4}>
                💸 Pay Accepted Applicants
              </Text>
              <Stack spacing={3}>
                {acceptedApplicants.map((app: any) => (
                  <Flex key={app.id} justify="space-between" align="center" bg="rgba(255,255,255,0.03)" p={3} borderRadius="xl">
                    <Flex gap={3} align="center">
                      <Avatar size="sm" name={app.applicant?.name || "?"} src={app.applicant?.image} bg="purple.600" color="white" />
                      <Stack spacing={0}>
                        <Text color="white" fontSize="sm" fontWeight="semibold">{app.applicant?.name}</Text>
                        <Text color="gray.500" fontSize="xs">
                          {app.applicant?.walletAddress
                            ? `${app.applicant.walletAddress.slice(0, 6)}...${app.applicant.walletAddress.slice(-4)}`
                            : "No wallet address set"}
                        </Text>
                      </Stack>
                    </Flex>
                    {paidApplicants.has(app.applicant?.id) ? (
                      <Badge colorScheme="green" borderRadius="full" px={3} py={1}>✓ Paid</Badge>
                    ) : app.applicant?.walletAddress ? (
                      <GigPaymentButton
                        opportunityId={id as string}
                        applicantId={app.applicant.id}
                        applicantName={app.applicant.name || "Applicant"}
                        applicantAvatar={app.applicant.image}
                        amountEth={opp.compensationAmount?.toString() || "0.01"}
                        currency={opp.compensationCurrency || "ETH"}
                        gigTitle={opp.title}
                        onSuccess={(txHash) => {
                          setPaidApplicants((prev) => new Set(Array.from(prev).concat(app.applicant.id)));
                        }}
                      />
                    ) : (
                      <Badge colorScheme="gray" borderRadius="full" px={3} py={1} fontSize="xs">No wallet</Badge>
                    )}
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}

          {/* Author + CTA */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={6}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={5}>
              <Link href={`/profile/${opp.author?.id}`}>
                <Flex gap={4} align="center" cursor="pointer" _hover={{ opacity: 0.8 }} transition="opacity 0.2s">
                  <Avatar size="md" name={opp.author?.name || "?"} bg="purple.600" color="white" />
                  <Stack spacing={0.5}>
                    <Text fontWeight="semibold" color="white">{opp.author?.name || "Anonymous"}</Text>
                    <Text color="gray.500" fontSize="sm">{opp.author?.university || "Student"}</Text>
                  </Stack>
                </Flex>
              </Link>

              {!session && (
                <Link href="/login">
                  <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }} borderRadius="xl" px={8}>
                    Sign in to apply
                  </Button>
                </Link>
              )}

              {session && !isOwner && opp.status === "ACTIVE" && (
                <Flex gap={3} flexWrap="wrap">
                  {applied ? (
                    <Button isDisabled bg="rgba(34,197,94,0.1)" color="green.300"
                      border="1px solid rgba(34,197,94,0.25)" borderRadius="xl" px={8} _disabled={{ opacity: 1 }}>
                      ✓ Applied
                    </Button>
                  ) : (
                    <Button onClick={() => setApplyOpen(true)}
                      bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                      _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                      transition="all 0.2s" borderRadius="xl" px={8}>
                      Apply Now →
                    </Button>
                  )}
                </Flex>
              )}

              {isOwner && (
                <Link href="/dashboard/applications">
                  <Button variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400"
                    _hover={{ bg: "rgba(255,255,255,0.05)" }} borderRadius="xl">
                    View Applications
                  </Button>
                </Link>
              )}
            </Flex>
          </Box>
        </Stack>
      </Container>

      {applyOpen && <ApplyModal opportunity={opp} onClose={() => setApplyOpen(false)} onSuccess={() => { setApplyOpen(false); setApplied(true); }} />}
    </Box>
  );
}
