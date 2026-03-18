"use client";

import {
  Box, Button, Container, Flex, Heading, Stack, Text, Badge, Avatar,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CryptoPaymentModal from "@/components/payments/CryptoPaymentModal";

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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then((r) => r.json())
      .then((data) => { setOpp(data); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this opportunity?")) return;
    setDeleting(true);
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Loading...</Text>
      </Box>
    );
  }

  if (!opp || opp.error) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Stack align="center" gap={4}>
          <Text fontSize="4xl">😕</Text>
          <Heading color="gray.400">Opportunity not found</Heading>
          <Link href="/opportunities"><Button variant="outline" color="gray.400">Back to Browse</Button></Link>
        </Stack>
      </Box>
    );
  }

  const isOwner = session?.user?.id === opp.author?.id;

  return (
    <Box minH="100vh" bg="gray.950" color="white">
      {/* Navbar */}
      <Box bg="rgba(10,10,20,0.8)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={6} py={4}>
        <Flex maxW="7xl" mx="auto" justify="space-between" align="center">
          <Link href="/"><Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
          <Link href="/opportunities"><Button variant="ghost" size="sm" color="gray.400">← Back</Button></Link>
        </Flex>
      </Box>

      <Container maxW="4xl" py={10}>
        <Stack gap={8}>
          {/* Header */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)"
            borderRadius="2xl" p={8}>
            <Stack gap={5}>
              <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                <Flex gap={2} flexWrap="wrap">
                  <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={3} py={1}>
                    {opp.type}
                  </Badge>
                  <Badge bg={opp.status === "ACTIVE" ? "green.900" : "gray.800"}
                    color={opp.status === "ACTIVE" ? "green.300" : "gray.400"} borderRadius="full" px={3} py={1}>
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
                      <Button size="sm" variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400" borderRadius="lg">
                        Edit
                      </Button>
                    </Link>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={handleDelete}
                      loading={deleting} borderRadius="lg">
                      Delete
                    </Button>
                  </Flex>
                )}
              </Flex>

              <Heading size="xl" color="white">{opp.title}</Heading>

              {opp.compensationAmount && (
                <Text color="purple.300" fontSize="xl" fontWeight="bold">
                  {opp.compensationAmount} {opp.compensationCurrency}
                </Text>
              )}

              <Flex gap={4} flexWrap="wrap">
                <Text color="gray.400" fontSize="sm">
                  {opp.isRemote ? "🌍 Remote" : `📍 ${opp.location}`}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  📅 Posted {new Date(opp.createdAt).toLocaleDateString()}
                </Text>
                {opp._count?.payments > 0 && (
                  <Text color="gray.400" fontSize="sm">💰 {opp._count.payments} payment(s)</Text>
                )}
              </Flex>
            </Stack>
          </Box>

          {/* Description */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={8}>
            <Heading size="sm" color="gray.400" mb={4} textTransform="uppercase" letterSpacing="wider">
              Description
            </Heading>
            <Text color="gray.300" lineHeight="tall" whiteSpace="pre-wrap">{opp.description}</Text>

            {opp.aiSummary && (
              <Box mt={6} bg="rgba(139,92,246,0.1)" border="1px solid rgba(139,92,246,0.2)"
                borderRadius="xl" p={4}>
                <Text color="purple.300" fontSize="xs" fontWeight="bold" mb={1}>✨ AI Summary</Text>
                <Text color="gray.300" fontSize="sm">{opp.aiSummary}</Text>
              </Box>
            )}
          </Box>

          {/* Skills & Tags */}
          {(opp.skills?.length > 0 || opp.tags?.length > 0) && (
            <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={8}>
              {opp.skills?.length > 0 && (
                <Stack gap={3} mb={4}>
                  <Text color="gray.400" fontSize="sm" fontWeight="semibold">Skills Required</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.skills.map((s: string) => (
                      <Badge key={s} bg="rgba(59,130,246,0.15)" color="blue.300"
                        borderRadius="full" px={3} py={1} fontSize="xs">{s}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
              {opp.tags?.length > 0 && (
                <Stack gap={3}>
                  <Text color="gray.400" fontSize="sm" fontWeight="semibold">Tags</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {opp.tags.map((t: string) => (
                      <Badge key={t} bg="rgba(255,255,255,0.05)" color="gray.400"
                        borderRadius="full" px={3} py={1} fontSize="xs">#{t}</Badge>
                    ))}
                  </Flex>
                </Stack>
              )}
            </Box>
          )}

          {/* Author & CTA */}
          <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" p={8}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={6}>
              <Flex gap={4} align="center">
                <Avatar.Root size="md">
                  <Avatar.Fallback bg="purple.600" color="white">
                    {opp.author?.name?.[0] || "?"}
                  </Avatar.Fallback>
                </Avatar.Root>
                <Stack gap={0}>
                  <Text fontWeight="semibold" color="white">{opp.author?.name || "Anonymous"}</Text>
                  <Text color="gray.500" fontSize="sm">{opp.author?.university || "Student"}</Text>
                </Stack>
              </Flex>

              {!isOwner && session && opp.paymentType === "CRYPTO" && (
                <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                  transition="all 0.2s" borderRadius="xl" px={8} onClick={() => setPaymentOpen(true)}>
                  ⚡ Pay with Crypto
                </Button>
              )}
              {!session && (
                <Link href="/login">
                  <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }}
                    borderRadius="xl" px={8}>
                    Sign in to apply
                  </Button>
                </Link>
              )}
            </Flex>
          </Box>
        </Stack>
      </Container>

      {paymentOpen && (
        <CryptoPaymentModal
          opportunity={opp}
          onClose={() => setPaymentOpen(false)}
        />
      )}
    </Box>
  );
}
