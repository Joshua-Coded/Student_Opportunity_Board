import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";

const features = [
  {
    title: "Post Opportunities",
    description: "Share gigs, internships, and research roles with students on your campus.",
  },
  {
    title: "Crypto Payments",
    description: "Send and receive payments in ETH or USDC — no bank account needed.",
  },
  {
    title: "AI-Enhanced Listings",
    description: "Claude MCP improves your listing for clarity and discoverability in one click.",
  },
  {
    title: "Image Uploads",
    description: "Add logos and banners to your opportunity via Cloudinary CDN.",
  },
];

export default function HomePage() {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navbar */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
        <Flex maxW="6xl" mx="auto" justify="space-between" align="center">
          <Heading size="md" color="purple.600">
            OpportunityBoard
          </Heading>
          <Flex gap={3}>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button colorScheme="purple" size="sm">Sign up</Button>
            </Link>
          </Flex>
        </Flex>
      </Box>

      {/* Hero */}
      <Container maxW="4xl" py={20} textAlign="center">
        <Stack gap={6} align="center">
          <Heading size="2xl" fontWeight="bold" lineHeight="shorter">
            Find gigs. Post opportunities.
            <br />
            Get paid in crypto.
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            A student-first platform for discovering paid gigs, internships, and
            campus opportunities — with cross-border crypto payments built in.
          </Text>
          <Flex gap={4} flexWrap="wrap" justify="center">
            <Link href="/register">
              <Button colorScheme="purple" size="lg" px={8}>
                Get started free
              </Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="outline" size="lg" px={8}>
                Browse opportunities
              </Button>
            </Link>
          </Flex>
        </Stack>
      </Container>

      {/* Features */}
      <Container maxW="6xl" pb={20}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          {features.map((f) => (
            <Box key={f.title} bg="white" p={6} rounded="xl" shadow="sm" borderWidth="1px">
              <Heading size="sm" mb={2}>{f.title}</Heading>
              <Text color="gray.600" fontSize="sm">{f.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
