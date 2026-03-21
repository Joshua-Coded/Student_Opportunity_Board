"use client";

import { Avatar, Badge, Box, Button, Container, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [ratings, setRatings] = useState<{ ratings: any[]; average: number | null; count: number }>({ ratings: [], average: null, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/profile/${userId}`).then((r) => r.json()),
      fetch(`/api/ratings?userId=${userId}`).then((r) => r.json()),
    ]).then(([userData, ratingsData]) => {
      setUser(userData);
      setRatings(ratingsData);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
      <Text color="gray.500">Loading...</Text>
    </Box>
  );

  if (!user || user.error) return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center">
      <Stack align="center" spacing={4}>
        <Text fontSize="4xl">😕</Text>
        <Heading color="gray.400" size="md">Profile not found</Heading>
        <Link href="/opportunities"><Button variant="outline" color="gray.400" borderRadius="xl">Browse Opportunities</Button></Link>
      </Stack>
    </Box>
  );

  return (
    <Box minH="100vh" bg="#050510" color="white">
      <Box bg="rgba(5,5,16,0.85)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={6} py={4}>
        <Flex maxW="3xl" mx="auto" justify="space-between" align="center">
          <Link href="/"><Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
          <Link href="/opportunities"><Button variant="ghost" size="sm" color="gray.400">← Browse</Button></Link>
        </Flex>
      </Box>

      <Container maxW="3xl" py={12}>
        <Stack spacing={8}>
          <Box bgGradient="linear(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))"
            border="1px solid rgba(139,92,246,0.2)" borderRadius="2xl" p={8}>
            <Flex gap={6} align="center" flexWrap="wrap">
              <Avatar size="2xl" name={user.name || "?"} src={user.image || undefined} bg="purple.600" color="white" />
              <Stack spacing={2} flex={1}>
                <Heading size="xl" color="white">{user.name || "Anonymous Student"}</Heading>
                {user.university && <Text color="purple.300" fontWeight="medium">{user.university}</Text>}
                {user.major && <Text color="gray.400" fontSize="sm">{user.major}{user.graduationYear ? ` · Class of ${user.graduationYear}` : ""}</Text>}
                <Flex gap={2} flexWrap="wrap" mt={1}>
                  <Badge colorScheme="purple" borderRadius="full" px={3} py={1} fontSize="xs">🎓 Student</Badge>
                  <Badge colorScheme="gray" borderRadius="full" px={3} py={1} fontSize="xs">
                    {user._count?.opportunities || 0} listing{user._count?.opportunities !== 1 ? "s" : ""}
                  </Badge>
                  {ratings.count > 0 && (
                    <Badge colorScheme="yellow" borderRadius="full" px={3} py={1} fontSize="xs">
                      ⭐ {ratings.average?.toFixed(1)} ({ratings.count} review{ratings.count !== 1 ? "s" : ""})
                    </Badge>
                  )}
                  <Badge colorScheme="gray" borderRadius="full" px={3} py={1} fontSize="xs">
                    Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </Badge>
                </Flex>
              </Stack>
            </Flex>
            {user.bio && (
              <Box mt={6} pt={6} borderTop="1px solid rgba(255,255,255,0.08)">
                <Text color="gray.300" lineHeight="relaxed">{user.bio}</Text>
              </Box>
            )}
          </Box>

          {ratings.count > 0 && (
            <Stack spacing={4}>
              <Heading size="sm" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Reviews ({ratings.count})
              </Heading>
              <Stack spacing={3}>
                {ratings.ratings.map((r: any) => (
                  <Box key={r.id} bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                    borderRadius="xl" p={5}>
                    <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
                      <Flex align="center" gap={3}>
                        <Avatar size="sm" name={r.rater?.name || "?"} src={r.rater?.image || undefined} bg="purple.700" />
                        <Stack spacing={0}>
                          <Text color="white" fontSize="sm" fontWeight="semibold">{r.rater?.name}</Text>
                          <Text color="gray.600" fontSize="xs">{r.opportunity?.title}</Text>
                        </Stack>
                      </Flex>
                      <Flex align="center" gap={1}>
                        {[1,2,3,4,5].map((s) => (
                          <Text key={s} fontSize="sm" opacity={s <= r.stars ? 1 : 0.2}>⭐</Text>
                        ))}
                      </Flex>
                    </Flex>
                    {r.comment && (
                      <Text color="gray.400" fontSize="sm" mt={3} lineHeight="relaxed">{r.comment}</Text>
                    )}
                    <Text color="gray.700" fontSize="xs" mt={2}>
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}

          {user.opportunities?.length > 0 && (
            <Stack spacing={4}>
              <Heading size="sm" color="gray.400" textTransform="uppercase" letterSpacing="wider">Active Opportunities</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {user.opportunities.map((opp: any) => (
                  <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                    <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                      borderRadius="xl" p={5} cursor="pointer" transition="all 0.2s"
                      _hover={{ bg: "rgba(255,255,255,0.06)", transform: "translateY(-2px)" }}>
                      <Flex justify="space-between" mb={2}>
                        <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={2} fontSize="xs">{opp.type}</Badge>
                        {opp.paymentType === "CRYPTO" && <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="xs">⚡</Badge>}
                      </Flex>
                      <Text fontWeight="semibold" color="white" fontSize="sm" noOfLines={1}>{opp.title}</Text>
                      <Text color="gray.600" fontSize="xs" mt={1}>{opp.isRemote ? "🌍 Remote" : "📍 On-site"} · {new Date(opp.createdAt).toLocaleDateString()}</Text>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
