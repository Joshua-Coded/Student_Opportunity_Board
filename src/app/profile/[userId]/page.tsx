"use client";

import {
  Box, Container, Flex, Heading, SimpleGrid, Stack, Text, Badge, Avatar, Button,
} from "@chakra-ui/react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${userId}`).then((r) => r.json()).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Loading profile...</Text>
      </Box>
    );
  }

  if (!user || user.error) {
    return (
      <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
        <Stack align="center" gap={4}>
          <Text fontSize="4xl">😕</Text>
          <Heading color="gray.400" size="md">Profile not found</Heading>
          <Link href="/opportunities"><Button variant="outline" color="gray.400" borderRadius="xl">Browse Opportunities</Button></Link>
        </Stack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.950" color="white">
      {/* Navbar */}
      <Box bg="rgba(10,10,20,0.8)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={6} py={4}>
        <Flex maxW="5xl" mx="auto" justify="space-between" align="center">
          <Link href="/"><Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
          <Link href="/opportunities"><Button variant="ghost" size="sm" color="gray.400">← Browse</Button></Link>
        </Flex>
      </Box>

      <Container maxW="3xl" py={12}>
        <Stack gap={8}>
          {/* Profile Card */}
          <Box
            bgGradient="linear(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)"
            border="1px solid rgba(139,92,246,0.2)" borderRadius="2xl" p={8} position="relative" overflow="hidden">
            <Box position="absolute" top="-60px" right="-60px" w="200px" h="200px"
              borderRadius="full" bg="purple.600" opacity={0.07} filter="blur(50px)" />
            <Flex gap={6} align="center" flexWrap="wrap">
              <Avatar.Root size="2xl">
                <Avatar.Fallback bg="purple.600" color="white" fontSize="3xl">
                  {user.name?.[0] || "?"}
                </Avatar.Fallback>
              </Avatar.Root>
              <Stack gap={2} flex={1}>
                <Heading size="xl" color="white">{user.name || "Anonymous Student"}</Heading>
                {user.university && (
                  <Text color="purple.300" fontWeight="medium">{user.university}</Text>
                )}
                {user.major && (
                  <Text color="gray.400" fontSize="sm">{user.major}
                    {user.graduationYear ? ` · Class of ${user.graduationYear}` : ""}
                  </Text>
                )}
                <Flex gap={2} flexWrap="wrap" mt={1}>
                  <Badge bg="rgba(139,92,246,0.15)" color="purple.300" borderRadius="full" px={3} py={1} fontSize="xs">
                    🎓 Student
                  </Badge>
                  <Badge bg="rgba(255,255,255,0.05)" color="gray.400" borderRadius="full" px={3} py={1} fontSize="xs">
                    {user._count?.opportunities || 0} listing{user._count?.opportunities !== 1 ? "s" : ""}
                  </Badge>
                  <Badge bg="rgba(255,255,255,0.05)" color="gray.500" borderRadius="full" px={3} py={1} fontSize="xs">
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

          {/* Their Opportunities */}
          {user.opportunities?.length > 0 && (
            <Stack gap={4}>
              <Heading size="sm" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Active Opportunities
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {user.opportunities.map((opp: any) => (
                  <Link href={`/opportunities/${opp.id}`} key={opp.id}>
                    <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                      borderRadius="xl" p={5} cursor="pointer" transition="all 0.2s"
                      _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.3)", transform: "translateY(-2px)" }}>
                      <Flex justify="space-between" mb={2}>
                        <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={2} fontSize="xs">
                          {opp.type}
                        </Badge>
                        {opp.paymentType === "CRYPTO" && (
                          <Badge bg="rgba(139,92,246,0.15)" color="purple.300" borderRadius="full" px={2} fontSize="xs">⚡</Badge>
                        )}
                      </Flex>
                      <Text fontWeight="semibold" color="white" fontSize="sm" noOfLines={1}>{opp.title}</Text>
                      <Text color="gray.600" fontSize="xs" mt={2}>
                        {opp.isRemote ? "🌍 Remote" : "📍 On-site"} ·{" "}
                        {new Date(opp.createdAt).toLocaleDateString()}
                      </Text>
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
