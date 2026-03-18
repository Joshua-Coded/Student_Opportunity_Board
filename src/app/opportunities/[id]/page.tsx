"use client";

import {
  Box, Button, Container, Flex, Heading, Stack, Text, Badge, Avatar,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CryptoPaymentModal from "@/components/payments/CryptoPaymentModal";
import ApplyModal from "@/components/applications/ApplyModal";

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
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then((r) => r.json())
      .then((data) => { setOpp(data); setLoading(false); });
  }, [id]);

  // Check if user already applied
  useEffect(() => {
    if (!session?.user?.id || !id) return;
    fetch("/api/applications?mode=sent")
      .then((r) => r.json())
      .then((apps: any[]) => {
        if (Array.isArray(apps)) {
          setApplied(apps.some((a) => a.opportunityId === id));
        }
      });
  }, [session, id]);

  async function handleDelete() {
    if (!confirm("Delete this opportunity?")) return;
    setDeleting(true);
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Box w={8} h={8} borderRadius="full" border="2px solid" borderColor="purple.500"
          borderTopColor="transparent" style={{ animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Box>
    );
  }

  if (!opp || opp.error) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Stack align="center" gap={4}>
          <Text fontSize="4xl">😕</Text>
          <Heading color="gray.400">Opportunity not found</Heading>
          <Link href="/opportunities"><Button variant="outline" color="gray.400" borderRadius="xl">Back to Browse</Button></Link>
        </Stack>
      </Box>
    );
  }

  const isOwner = session?.user?.id === opp.author?.id;

  return (
    <Box minH="100vh" bg="gray.950" color="white">
      {/* Navbar */}
      <Box bg="rgba(10,10,20,0.8)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={6} py={4}
        position="sticky" top={0} zIndex={50}>
        <Flex maxW="4xl" mx="auto" justify="space-between" align="center">
          <Link href="/"><Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
          <Flex gap={2}>
            <Link href="/opportunities"><Button variant="ghost" size="sm" color="gray.400">← Browse</Button></Link>
          </Flex>
        </Flex>
      </Box>

      <Container maxW="4xl" py={10}>
        <Stack gap={5}>

          {/* Header card */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)"
            borderRadius="2xl" p={8}>
            <Stack gap={5}>
              <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                <Flex gap={2} flexWrap="wrap">
                  <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={3} py={1}>
                    {opp.type}
                  </Badge>
                  <Badge
                    bg={opp.status === "ACTIVE" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"}
                    color={opp.status === "ACTIVE" ? "green.300" : "gray.400"}
                    borderRadius="full" px={3} py={1}>
                    {opp.status}
                  </Badge>
                  {opp.paymentType === "CRYPTO" && (
                    <Badge bg="rgba(139,92,246,0.2)" color="purple.300" borderRadius="full" px={3} py={1}>
                      ⚡ Crypto
                    </Badge>
                  )}
                </Flex>
                {isOwner && (
                  <Flex gap={2}>
                    <Link href={`/opportunities/${id}/edit`}>
                      <Button size="sm" variant="outline" borderColor="rgba(255,255,255,0.1)"
                        color="gray.400" borderRadius="lg">Edit</Button>
                    </Link>
                    <Button size="sm" colorScheme="red" variant="outline"
                      onClick={handleDelete} loading={deleting} borderRadius="lg">Delete</Button>
                  </Flex>
                )}
              </Flex>

              <Heading size="xl" color="white">{opp.title}</Heading>

              {opp.compensationAmount && (
                <Text color="purple.300" fontSize="xl" fontWeight="bold">
                  {opp.compensationAmount} {opp.compensationCurrency}
                </Text>
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

          {/* Description */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={8}>
            <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={4}>
              Description
            </Text>
            <Text color="gray.300" lineHeight="tall" whiteSpace="pre-wrap" fontSize="sm">{opp.description}</Text>
            {opp.aiSummary && (
              <Box mt={6} bg="rgba(139,92,246,0.08)" border="1px solid rgba(139,92,246,0.2)"
                borderRadius="xl" p={4}>
                <Text color="purple.300" fontSize="xs" fontWeight="bold" mb={1}>✨ AI Summary</Text>
                <Text color="gray.300" fontSize="sm">{opp.aiSummary}</Text>
              </Box>
            )}
          </Box>

          {/* Skills & Tags */}
          {(opp.skills?.length > 0 || opp.tags?.length > 0) && (
            <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={6}>
              {opp.skills?.length > 0 && (
                <Stack gap={3} mb={opp.tags?.length > 0 ? 5 : 0}>
                  <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Skills Required</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.skills.map((s: string) => (
                      <Badge key={s} bg="rgba(59,130,246,0.12)" color="blue.300"
                        borderRadius="full" px={3} py={1} fontSize="xs">{s}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
              {opp.tags?.length > 0 && (
                <Stack gap={3}>
                  <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Tags</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.tags.map((t: string) => (
                      <Badge key={t} bg="rgba(255,255,255,0.04)" color="gray.400"
                        borderRadius="full" px={3} py={1} fontSize="xs">#{t}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
            </Box>
          )}

          {/* Author + CTA */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={6}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={5}>
              <Link href={`/profile/${opp.author?.id}`}>
                <Flex gap={4} align="center" cursor="pointer"
                  _hover={{ opacity: 0.8 }} transition="opacity 0.2s">
                  <Avatar.Root size="md">
                    <Avatar.Fallback bg="purple.600" color="white">
                      {opp.author?.name?.[0] || "?"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Stack gap={0.5}>
                    <Text fontWeight="semibold" color="white">{opp.author?.name || "Anonymous"}</Text>
                    <Text color="gray.500" fontSize="sm">{opp.author?.university || "Student"}</Text>
                  </Stack>
                </Flex>
              </Link>

              {/* CTA buttons */}
              {!session && (
                <Link href="/login">
                  <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                    transition="all 0.2s" borderRadius="xl" px={8}>
                    Sign in to apply
                  </Button>
                </Link>
              )}

              {session && !isOwner && opp.status === "ACTIVE" && (
                <Flex gap={3} flexWrap="wrap">
                  {opp.paymentType === "CRYPTO" && (
                    <Button
                      onClick={() => setPaymentOpen(true)}
                      bg="rgba(139,92,246,0.15)" color="purple.300"
                      border="1px solid rgba(139,92,246,0.3)"
                      _hover={{ bg: "rgba(139,92,246,0.25)", transform: "translateY(-1px)" }}
                      transition="all 0.2s" borderRadius="xl" px={6}>
                      ⚡ Pay with Crypto
                    </Button>
                  )}
                  {applied ? (
                    <Button disabled bg="rgba(34,197,94,0.1)" color="green.300"
                      border="1px solid rgba(34,197,94,0.25)" borderRadius="xl" px={8} cursor="default">
                      ✓ Applied
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setApplyOpen(true)}
                      bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                      _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                      transition="all 0.2s" borderRadius="xl" px={8}>
                      Apply Now →
                    </Button>
                  )}
                </Flex>
              )}

              {isOwner && (
                <Link href={`/dashboard/applications`}>
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

      {applyOpen && (
        <ApplyModal
          opportunity={opp}
          onClose={() => setApplyOpen(false)}
          onSuccess={() => { setApplyOpen(false); setApplied(true); }}
        />
      )}

      {paymentOpen && (
        <CryptoPaymentModal opportunity={opp} onClose={() => setPaymentOpen(false)} />
      )}
    </Box>
  );
}
