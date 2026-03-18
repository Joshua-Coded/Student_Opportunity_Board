"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Badge,
  Avatar,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

const features = [
  {
    icon: "🎯",
    title: "Post Opportunities",
    description:
      "Share gigs, internships, and research roles with thousands of students instantly.",
    color: "purple.500",
    bg: "purple.50",
  },
  {
    icon: "⚡",
    title: "Crypto Payments",
    description:
      "Send and receive ETH or USDC cross-border — no bank account required.",
    color: "blue.500",
    bg: "blue.50",
  },
  {
    icon: "🤖",
    title: "AI-Enhanced Listings",
    description:
      "Claude MCP rewrites your listing for clarity and discoverability in one click.",
    color: "green.500",
    bg: "green.50",
  },
  {
    icon: "☁️",
    title: "Rich Media Uploads",
    description:
      "Add logos, banners, and portfolio images via Cloudinary CDN — fast anywhere.",
    color: "orange.500",
    bg: "orange.50",
  },
];

const stats = [
  { value: "10K+", label: "Students" },
  { value: "2.4K", label: "Opportunities" },
  { value: "$1.2M", label: "Paid Out" },
  { value: "98%", label: "Satisfaction" },
];

const testimonials = [
  {
    name: "Amara Diallo",
    role: "CS Student, University of Lagos",
    text: "Found a freelance gig that paid in USDC in under 24 hours. This platform is a game changer for African students.",
    avatar: "AD",
  },
  {
    name: "Carlos Mendes",
    role: "Design Intern, São Paulo",
    text: "I posted a branding gig and got 12 applications overnight. The AI feature made my listing look so professional.",
    avatar: "CM",
  },
  {
    name: "Priya Nair",
    role: "Research Lead, IIT Bombay",
    text: "The crypto payment feature solved everything. No more international wire fees eating into project budgets.",
    avatar: "PN",
  },
];

const opportunityTypes = ["GIG", "INTERNSHIP", "RESEARCH", "PART-TIME", "VOLUNTEER", "FULL-TIME"];

const floatingCards = [
  { title: "UI Design Gig", pay: "0.05 ETH", type: "GIG", top: "15%", left: "3%" },
  { title: "ML Research Role", pay: "Negotiable", type: "RESEARCH", top: "60%", right: "2%" },
  { title: "Web3 Internship", pay: "0.1 ETH/mo", type: "INTERNSHIP", top: "30%", right: "5%" },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <Box minH="100vh" bg="gray.950" color="white" overflow="hidden">
      {/* ── Navbar ── */}
      <MotionBox
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg="rgba(10,10,20,0.7)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)"
        px={6}
        py={4}
      >
        <Flex maxW="7xl" mx="auto" justify="space-between" align="center">
          <HStack gap={2}>
            <Box w={8} h={8} borderRadius="lg" bg="purple.500" display="flex" alignItems="center" justifyContent="center" fontSize="sm">
              🎓
            </Box>
            <Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text">
              OpportunityBoard
            </Heading>
          </HStack>
          <HStack gap={6} display={{ base: "none", md: "flex" }}>
            {["Browse", "How it Works", "Pricing"].map((item) => (
              <Text key={item} color="gray.400" fontSize="sm" cursor="pointer" _hover={{ color: "white" }} transition="color 0.2s">
                {item}
              </Text>
            ))}
          </HStack>
          <HStack gap={3}>
            <Link href="/login">
              <Button variant="ghost" size="sm" color="gray.300" _hover={{ color: "white", bg: "whiteAlpha.100" }}>
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                bgGradient="linear(to-r, purple.500, blue.500)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)", shadow: "lg" }}
                transition="all 0.2s"
                px={5}
              >
                Get started
              </Button>
            </Link>
          </HStack>
        </Flex>
      </MotionBox>

      {/* ── Hero ── */}
      <Box ref={heroRef} position="relative" minH="100vh" display="flex" alignItems="center" pt={20}>
        {/* Background glow */}
        <Box
          position="absolute" inset={0} zIndex={0}
          bgGradient="radial(ellipse at 50% 40%, rgba(139,92,246,0.15) 0%, transparent 70%)"
        />
        <Box
          position="absolute" top="10%" left="10%" w="400px" h="400px" zIndex={0}
          borderRadius="full" bg="purple.600" opacity={0.07} filter="blur(80px)"
        />
        <Box
          position="absolute" bottom="10%" right="10%" w="300px" h="300px" zIndex={0}
          borderRadius="full" bg="blue.600" opacity={0.08} filter="blur(80px)"
        />

        {/* Floating Cards */}
        {floatingCards.map((card, i) => (
          <MotionBox
            key={i}
            position="absolute"
            display={{ base: "none", xl: "block" }}
            zIndex={2}
            {...(card.left ? { left: card.left } : {})}
            {...(card.right ? { right: card.right } : {})}
            top={card.top}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.2, duration: 0.6 }}
          >
            <MotionBox
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 + i, ease: "easeInOut" }}
              bg="rgba(255,255,255,0.05)"
              backdropFilter="blur(16px)"
              border="1px solid rgba(255,255,255,0.1)"
              borderRadius="xl"
              p={4}
              minW="180px"
              shadow="2xl"
            >
              <Badge colorScheme="purple" mb={2} fontSize="xs">{card.type}</Badge>
              <Text fontWeight="semibold" fontSize="sm" color="white">{card.title}</Text>
              <Text fontSize="xs" color="purple.300" mt={1}>{card.pay}</Text>
            </MotionBox>
          </MotionBox>
        ))}

        <Container maxW="5xl" position="relative" zIndex={1} textAlign="center">
          <Stack gap={8} align="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge
                px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="medium"
                bg="rgba(139,92,246,0.15)" color="purple.300"
                border="1px solid rgba(139,92,246,0.3)"
              >
                ✨ Powered by Claude MCP + Crypto Payments
              </Badge>
            </MotionBox>

            <MotionHeading
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
              fontWeight="black"
              lineHeight="1.1"
              letterSpacing="-0.02em"
            >
              The campus platform
              <br />
              <Box as="span" bgGradient="linear(to-r, purple.400, blue.400, cyan.400)" bgClip="text">
                built for students
              </Box>
            </MotionHeading>

            <MotionText
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              fontSize={{ base: "md", md: "xl" }}
              color="gray.400"
              maxW="2xl"
              lineHeight="relaxed"
            >
              Post gigs, discover internships, and get paid in crypto — no bank account
              needed. Built for the global student economy.
            </MotionText>

            <MotionFlex
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              gap={4} flexWrap="wrap" justify="center"
            >
              <Link href="/register">
                <Button
                  size="lg" px={8} py={6} fontSize="md"
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-2px)", shadow: "0 0 30px rgba(139,92,246,0.4)" }}
                  transition="all 0.25s"
                  borderRadius="xl"
                >
                  Start for free →
                </Button>
              </Link>
              <Link href="/opportunities">
                <Button
                  size="lg" px={8} py={6} fontSize="md"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.15)"
                  color="gray.300"
                  _hover={{ bg: "whiteAlpha.100", borderColor: "rgba(255,255,255,0.3)", transform: "translateY(-2px)" }}
                  transition="all 0.25s"
                  borderRadius="xl"
                >
                  Browse opportunities
                </Button>
              </Link>
            </MotionFlex>

            {/* Opportunity type pills */}
            <MotionFlex
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              gap={2} flexWrap="wrap" justify="center"
            >
              {opportunityTypes.map((type) => (
                <Badge
                  key={type}
                  px={3} py={1} borderRadius="full" fontSize="xs"
                  bg="whiteAlpha.100" color="gray.400"
                  border="1px solid rgba(255,255,255,0.08)"
                >
                  {type}
                </Badge>
              ))}
            </MotionFlex>
          </Stack>
        </Container>
      </Box>

      {/* ── Stats ── */}
      <Box py={16} borderY="1px solid rgba(255,255,255,0.06)" bg="rgba(255,255,255,0.02)">
        <Container maxW="4xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={8} textAlign="center">
            {stats.map((stat, i) => (
              <MotionBox
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Text fontSize="3xl" fontWeight="black" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text">
                  {stat.value}
                </Text>
                <Text color="gray.500" fontSize="sm" mt={1}>{stat.label}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box py={24}>
        <Container maxW="6xl">
          <Stack gap={16}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Badge px={3} py={1} borderRadius="full" fontSize="xs" bg="rgba(139,92,246,0.1)" color="purple.300" border="1px solid rgba(139,92,246,0.2)" mb={4}>
                Features
              </Badge>
              <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" mb={4}>
                Everything students need
              </Heading>
              <Text color="gray.400" maxW="xl" mx="auto">
                One platform. All the tools. Built with the latest AI and web3 infrastructure.
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
              {features.map((f, i) => (
                <MotionBox
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  bg="rgba(255,255,255,0.03)"
                  border="1px solid rgba(255,255,255,0.07)"
                  borderRadius="2xl"
                  p={6}
                  cursor="pointer"
                  _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.3)" }}
                  transition="all 0.2s"
                >
                  <Text fontSize="2xl" mb={4}>{f.icon}</Text>
                  <Heading size="sm" mb={2} color="white">{f.title}</Heading>
                  <Text color="gray.400" fontSize="sm" lineHeight="relaxed">{f.description}</Text>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box py={24} bg="rgba(255,255,255,0.01)" borderY="1px solid rgba(255,255,255,0.05)">
        <Container maxW="6xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            textAlign="center" mb={12}
          >
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" mb={4}>
              Students love it
            </Heading>
            <Text color="gray.400">Real stories from real students.</Text>
          </MotionBox>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {testimonials.map((t, i) => (
              <MotionBox
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                bg="rgba(255,255,255,0.03)"
                border="1px solid rgba(255,255,255,0.07)"
                borderRadius="2xl"
                p={6}
              >
                <Text color="gray.300" fontSize="sm" lineHeight="relaxed" mb={6}>
                  &quot;{t.text}&quot;
                </Text>
                <HStack gap={3}>
                  <Avatar.Root size="sm">
                    <Avatar.Fallback bg="purple.600" color="white" fontSize="xs">
                      {t.avatar}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">{t.name}</Text>
                    <Text color="gray.500" fontSize="xs">{t.role}</Text>
                  </Box>
                </HStack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box py={28} position="relative" overflow="hidden">
        <Box
          position="absolute" inset={0}
          bgGradient="radial(ellipse at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)"
        />
        <Container maxW="3xl" position="relative" textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Stack gap={6} align="center">
              <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="black" lineHeight="1.1">
                Ready to find your
                <br />
                <Box as="span" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text">
                  next opportunity?
                </Box>
              </Heading>
              <Text color="gray.400" fontSize="lg" maxW="lg">
                Join thousands of students already earning and growing on OpportunityBoard.
              </Text>
              <Link href="/register">
                <Button
                  size="lg" px={10} py={6} fontSize="md"
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-2px)", shadow: "0 0 40px rgba(139,92,246,0.5)" }}
                  transition="all 0.25s"
                  borderRadius="xl"
                >
                  Create your free account →
                </Button>
              </Link>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box borderTop="1px solid rgba(255,255,255,0.06)" py={8}>
        <Container maxW="6xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <HStack gap={2}>
              <Box w={6} h={6} borderRadius="md" bg="purple.500" display="flex" alignItems="center" justifyContent="center" fontSize="xs">
                🎓
              </Box>
              <Text color="gray.500" fontSize="sm">OpportunityBoard © 2025</Text>
            </HStack>
            <HStack gap={6}>
              {["Privacy", "Terms", "Contact"].map((item) => (
                <Text key={item} color="gray.600" fontSize="sm" cursor="pointer" _hover={{ color: "gray.400" }}>
                  {item}
                </Text>
              ))}
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
