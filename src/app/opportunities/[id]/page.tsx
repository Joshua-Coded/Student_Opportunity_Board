"use client";

import {
  Avatar, Badge, Box, Button, Container, Flex, Heading, Stack, Text, useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ApplyModal from "@/components/applications/ApplyModal";
import GigPaymentButton from "@/components/GigPaymentButton";
import { useLanguage } from "@/contexts/LanguageContext";

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filling, setFilling] = useState(false);
  const toast = useToast();
  const [cryptoPrice, setCryptoPrice] = useState<number | null>(null);
  const [acceptedApplicants, setAcceptedApplicants] = useState<any[]>([]);
  const [paidApplicants, setPaidApplicants] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/opportunities/${id}`).then((r) => r.json()).then((data) => { setOpp(data); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!opp?.compensationAmount || !opp?.compensationCurrency || opp.paymentType !== "CRYPTO") return;
    const symbol = opp.compensationCurrency;
    if (symbol === "USDC") { setCryptoPrice(1); return; }
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

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copied!", status: "success", duration: 2000, isClosable: true, position: "top" });
    });
  }

  function handleShareTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this opportunity: ${opp?.title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }

  async function handleMarkFilled() {
    if (!confirm("Mark this opportunity as filled? It will no longer accept applications.")) return;
    setFilling(true);
    await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    });
    setOpp((prev: any) => ({ ...prev, status: "CLOSED" }));
    setFilling(false);
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">{t.common.loading}</Text>
      </Box>
    );
  }

  if (!opp || opp.error) {
    return (
      <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
        <Stack align="center" spacing={4}>
          <Text fontSize="4xl">😕</Text>
          <Heading color="gray.400" size="md">Opportunity not found</Heading>
          <Link href="/opportunities"><Button variant="outline" color="gray.400" borderRadius="xl">{t.common.backToBrowse}</Button></Link>
        </Stack>
      </Box>
    );
  }

  const isOwner = session?.user?.id === opp.author?.id;

  return (
    <Box minH="100vh" bg="#050510" color="white">
      <Box bg="rgba(5,5,16,0.85)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={{ base: 4, md: 6 }} py={4}
        position="sticky" top={0} zIndex={50}>
        <Flex maxW="4xl" mx="auto" justify="space-between" align="center">
          <Link href="/"><Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
          <Flex gap={2} align="center">
            <Button size="sm" variant="ghost" color="gray.500" onClick={handleShare}
              _hover={{ color: "white", bg: "rgba(255,255,255,0.06)" }} borderRadius="lg" title="Copy link">
              🔗
            </Button>
            <Button size="sm" variant="ghost" color="gray.500" onClick={handleShareTwitter}
              _hover={{ color: "white", bg: "rgba(255,255,255,0.06)" }} borderRadius="lg" title="Share on X">
              𝕏
            </Button>
            <Link href="/opportunities"><Button variant="ghost" size="sm" color="gray.400">{t.common.backToBrowse}</Button></Link>
          </Flex>
        </Flex>
      </Box>

      <Container maxW="4xl" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
        <Stack spacing={5}>
          {/* Header */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={{ base: 5, md: 8 }}>
            <Stack spacing={5}>
              <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                <Flex gap={2} flexWrap="wrap">
                  <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={3} py={1}>{opp.type}</Badge>
                  <Badge colorScheme={opp.status === "ACTIVE" ? "green" : "gray"} borderRadius="full" px={3} py={1}>{opp.status}</Badge>
                  {opp.paymentType === "CRYPTO" && <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>⚡ {t.common.crypto}</Badge>}
                </Flex>
                {isOwner && (
                  <Flex gap={2} flexWrap="wrap">
                    <Link href={`/opportunities/${id}/edit`}>
                      <Button size="sm" variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400" borderRadius="lg">{t.opportunity.edit}</Button>
                    </Link>
                    {opp.status === "ACTIVE" && (
                      <Button size="sm" onClick={handleMarkFilled} isLoading={filling}
                        bg="rgba(34,197,94,0.1)" color="green.300"
                        border="1px solid rgba(34,197,94,0.25)"
                        _hover={{ bg: "rgba(34,197,94,0.2)" }} borderRadius="lg">
                        {t.opportunity.markFilled}
                      </Button>
                    )}
                    <Button size="sm" colorScheme="red" variant="outline" onClick={handleDelete} isLoading={deleting} borderRadius="lg">{t.opportunity.delete}</Button>
                  </Flex>
                )}
              </Flex>
              <Heading size={{ base: "lg", md: "xl" }} color="white">{opp.title}</Heading>
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
                <Text color="gray.400" fontSize="sm">{opp.isRemote ? t.opportunity.remote : `📍 ${opp.location}`}</Text>
                <Text color="gray.400" fontSize="sm">📅 {new Date(opp.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
                {opp.expiresAt && (
                  <Text color={new Date(opp.expiresAt) < new Date() ? "red.400" : "orange.300"} fontSize="sm">
                    ⏰ {new Date(opp.expiresAt) < new Date() ? "Closed" : "Closes"} {new Date(opp.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </Text>
                )}
                {opp._count?.applications > 0 && (
                  <Text color="gray.400" fontSize="sm">👥 {opp._count.applications} {t.opportunity.applicants}</Text>
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
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={{ base: 5, md: 8 }}>
            <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={4}>{t.opportunity.description}</Text>
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
                  <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">{t.opportunity.skillsRequired}</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.skills.map((s: string) => (
                      <Badge key={s} colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">{s}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
              {opp.tags?.length > 0 && (
                <Stack spacing={3}>
                  <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">{t.opportunity.tags}</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" colorScheme="gray" borderRadius="full" px={3} py={1} fontSize="xs">#{tag}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
            </Box>
          )}

          {/* Pay Accepted Applicants */}
          {isOwner && opp.paymentType === "CRYPTO" && acceptedApplicants.length > 0 && (
            <Box bg="rgba(139,92,246,0.06)" border="1px solid rgba(139,92,246,0.25)" borderRadius="2xl" p={6}>
              <Text color="purple.300" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={4}>
                {t.opportunity.payAccepted}
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
                            : t.common.noWalletSet}
                        </Text>
                      </Stack>
                    </Flex>
                    {paidApplicants.has(app.applicant?.id) ? (
                      <Badge colorScheme="green" borderRadius="full" px={3} py={1}>{t.opportunity.applied}</Badge>
                    ) : app.applicant?.walletAddress ? (
                      <GigPaymentButton
                        opportunityId={id as string}
                        applicantId={app.applicant.id}
                        applicantName={app.applicant.name || "Applicant"}
                        applicantAvatar={app.applicant.image}
                        amountEth={opp.compensationAmount?.toString() || "0.01"}
                        currency={opp.compensationCurrency || "ETH"}
                        gigTitle={opp.title}
                        onSuccess={() => {
                          setPaidApplicants((prev) => new Set(Array.from(prev).concat(app.applicant.id)));
                        }}
                      />
                    ) : (
                      <Badge colorScheme="gray" borderRadius="full" px={3} py={1} fontSize="xs">{t.opportunity.noWallet}</Badge>
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
                    {t.opportunity.signInToApply}
                  </Button>
                </Link>
              )}

              {session && !isOwner && opp.status === "ACTIVE" && (
                <Flex gap={3} flexWrap="wrap">
                  {applied ? (
                    <Button isDisabled bg="rgba(34,197,94,0.1)" color="green.300"
                      border="1px solid rgba(34,197,94,0.25)" borderRadius="xl" px={8} _disabled={{ opacity: 1 }}>
                      {t.opportunity.applied}
                    </Button>
                  ) : (
                    <Button onClick={() => setApplyOpen(true)}
                      bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                      _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                      transition="all 0.2s" borderRadius="xl" px={8}>
                      {t.opportunity.applyNow}
                    </Button>
                  )}
                </Flex>
              )}

              {isOwner && (
                <Link href="/dashboard/applications">
                  <Button variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400"
                    _hover={{ bg: "rgba(255,255,255,0.05)" }} borderRadius="xl">
                    {t.opportunity.viewApplications}
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
