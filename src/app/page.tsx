"use client";

import { Box, Badge, Button, Container, Flex, Heading, SimpleGrid, Stack, Text, HStack, Avatar } from "@chakra-ui/react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

// ── Data ─────────────────────────────────────────────────────────────────────

const features = [
  { icon: "🎯", title: "Post & Discover", description: "Browse gigs, internships, research roles and part-time work posted by students and startups worldwide.", gradient: "linear(135deg, #7c3aed, #4f46e5)" },
  { icon: "⚡", title: "Crypto Payments", description: "Send and receive ETH, USDC, or MATIC cross-border instantly — no bank account, no wire fees.", gradient: "linear(135deg, #2563eb, #0891b2)" },
  { icon: "🤖", title: "Claude AI Enhance", description: "One click rewrites your listing with Claude MCP — sharper title, cleaner description, better tags.", gradient: "linear(135deg, #059669, #0d9488)" },
  { icon: "☁️", title: "Rich Media", description: "Upload banners, logos and portfolio images via Cloudinary CDN. Fast globally, optimised automatically.", gradient: "linear(135deg, #d97706, #dc2626)" },
];

const stats = [
  { value: "12K+", label: "Students" },
  { value: "3.1K", label: "Opportunities" },
  { value: "$2.4M", label: "Paid in Crypto" },
  { value: "47", label: "Countries" },
];

const testimonials = [
  { name: "Amara Diallo", role: "CS Student · Univ. of Lagos", text: "Found a Next.js gig that paid 0.15 ETH within 24 hours of posting. The AI enhanced my listing and made it look insanely professional.", avatar: "AD", color: "#7c3aed" },
  { name: "Carlos Mendes", role: "UX Designer · São Paulo", text: "Received 200 USDC on Polygon for a branding project. No fees, instant settlement. This is what cross-border work should feel like.", avatar: "CM", color: "#2563eb" },
  { name: "Priya Nair", role: "ML Researcher · IIT Bombay", text: "Posted a research assistant role and had 8 applicants by morning. The platform just works — clean, fast, student-focused.", avatar: "PN", color: "#059669" },
];

const floatingCards = [
  { title: "React Developer", pay: "0.15 ETH", type: "GIG", tag: "🔥 Hot" },
  { title: "ML Research", pay: "Negotiable", type: "RESEARCH", tag: "🎓 Academic" },
  { title: "UX Internship", pay: "0.08 ETH", type: "INTERNSHIP", tag: "🌍 Remote" },
];

const typeColors: Record<string, string> = {
  GIG: "#7c3aed", RESEARCH: "#2563eb", INTERNSHIP: "#059669",
};

const TICKER = ["React Developer", "ML Research Assistant", "Smart Contract Auditor", "UX Designer", "Data Analyst", "Rust Developer", "Technical Writer", "Node.js Developer"];

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const num = parseInt(target.replace(/\D/g, ""));
  const suffix = target.replace(/[0-9]/g, "");
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start + suffix);
    }, 40);
    return () => clearInterval(timer);
  }, [target, num, suffix]);
  return <>{display}</>;
}

// ── Ticker ─────────────────────────────────────────────────────────────────────
function RollingTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TICKER.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <Box overflow="hidden" h="44px" display="flex" alignItems="center">
      <AnimatePresence mode="wait">
        <MotionBox
          key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <Text
            fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
            fontWeight="black"
            bgGradient="linear(to-r, purple.400, blue.400, cyan.300)"
            bgClip="text"
            lineHeight="1"
          >
            {TICKER[index]}
          </Text>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <Box minH="100vh" bg="#050510" color="white" overflow="hidden">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <MotionBox
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        position="fixed" top={0} left={0} right={0} zIndex={100}
        bg="rgba(5,5,16,0.75)" backdropFilter="blur(24px) saturate(180%)"
        borderBottom="1px solid rgba(255,255,255,0.06)"
      >
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={2.5}>
            <Box w={8} h={8} borderRadius="lg" bgGradient="linear(135deg, #7c3aed, #2563eb)"
              display="flex" alignItems="center" justifyContent="center" fontSize="sm" shadow="0 0 20px rgba(124,58,237,0.5)">
              🎓
            </Box>
            <Heading size="sm" letterSpacing="tight"
              bgGradient="linear(to-r, white, rgba(255,255,255,0.7))" bgClip="text">
              OpportunityBoard
            </Heading>
          </HStack>

          <HStack gap={7} display={{ base: "none", md: "flex" }}>
            {["Browse", "How it works", "Pricing"].map((item) => (
              <Text key={item} fontSize="sm" color="rgba(255,255,255,0.45)" cursor="pointer"
                _hover={{ color: "white" }} transition="color 0.2s" fontWeight="medium">
                {item}
              </Text>
            ))}
          </HStack>

          <HStack gap={3}>
            <Link href="/login">
              <Button variant="ghost" size="sm" color="rgba(255,255,255,0.5)"
                _hover={{ color: "white", bg: "rgba(255,255,255,0.06)" }} borderRadius="lg" fontWeight="medium">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" px={5}
                bg="white" color="#050510"
                _hover={{ bg: "rgba(255,255,255,0.88)", transform: "translateY(-1px)", shadow: "0 8px 30px rgba(255,255,255,0.15)" }}
                transition="all 0.2s" borderRadius="lg" fontWeight="semibold">
                Get started
              </Button>
            </Link>
          </HStack>
        </Flex>
      </MotionBox>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <Box ref={heroRef} minH="100vh" position="relative" display="flex" alignItems="center" pt={20} overflow="hidden">

        {/* Background orbs */}
        <Box position="absolute" top="8%" left="-5%" w="600px" h="600px" borderRadius="full"
          bg="rgba(124,58,237,0.12)" filter="blur(120px)" pointerEvents="none" />
        <Box position="absolute" bottom="10%" right="-5%" w="500px" h="500px" borderRadius="full"
          bg="rgba(37,99,235,0.1)" filter="blur(100px)" pointerEvents="none" />
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)" w="800px" h="800px"
          borderRadius="full" bg="rgba(124,58,237,0.04)" filter="blur(80px)" pointerEvents="none" />

        {/* Grid pattern overlay */}
        <Box position="absolute" inset={0} opacity={0.03} pointerEvents="none"
          backgroundImage="linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)"
          backgroundSize="60px 60px" />

        {/* Floating cards — left */}
        <MotionBox position="absolute" left="3%" top="28%" display={{ base: "none", xl: "block" }}
          initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 0.7 }}>
          <MotionBox animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
            <Box bg="rgba(255,255,255,0.04)" backdropFilter="blur(20px)"
              border="1px solid rgba(255,255,255,0.09)" borderRadius="2xl" p={4} minW="190px" shadow="2xl">
              <Flex justify="space-between" align="center" mb={3}>
                <Badge bg="rgba(124,58,237,0.2)" color="#a78bfa" borderRadius="full" px={2} fontSize="10px">GIG</Badge>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)">2m ago</Text>
              </Flex>
              <Text fontWeight="semibold" fontSize="sm" color="white" mb={1}>React Developer</Text>
              <Text fontSize="xs" color="#a78bfa" fontWeight="bold">0.15 ETH</Text>
              <Box mt={3} h="1px" bg="rgba(255,255,255,0.06)" />
              <Text fontSize="xs" color="rgba(255,255,255,0.3)" mt={2}>🌍 Remote · Ethereum</Text>
            </Box>
          </MotionBox>
        </MotionBox>

        {/* Floating cards — right */}
        <MotionBox position="absolute" right="3%" top="20%" display={{ base: "none", xl: "block" }}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.7 }}>
          <MotionBox animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
            <Box bg="rgba(255,255,255,0.04)" backdropFilter="blur(20px)"
              border="1px solid rgba(255,255,255,0.09)" borderRadius="2xl" p={4} minW="190px" shadow="2xl">
              <Flex justify="space-between" align="center" mb={3}>
                <Badge bg="rgba(5,150,105,0.2)" color="#6ee7b7" borderRadius="full" px={2} fontSize="10px">INTERNSHIP</Badge>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)">5m ago</Text>
              </Flex>
              <Text fontWeight="semibold" fontSize="sm" color="white" mb={1}>Web3 Internship</Text>
              <Text fontSize="xs" color="#6ee7b7" fontWeight="bold">0.1 ETH / month</Text>
              <Box mt={3} h="1px" bg="rgba(255,255,255,0.06)" />
              <Text fontSize="xs" color="rgba(255,255,255,0.3)" mt={2}>🌍 Remote · Polygon</Text>
            </Box>
          </MotionBox>
        </MotionBox>

        <MotionBox position="absolute" right="5%" bottom="25%" display={{ base: "none", xl: "block" }}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, duration: 0.7 }}>
          <MotionBox animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}>
            <Box bg="rgba(255,255,255,0.04)" backdropFilter="blur(20px)"
              border="1px solid rgba(255,255,255,0.09)" borderRadius="2xl" p={4} minW="190px" shadow="2xl">
              <Flex justify="space-between" align="center" mb={3}>
                <Badge bg="rgba(37,99,235,0.2)" color="#93c5fd" borderRadius="full" px={2} fontSize="10px">RESEARCH</Badge>
                <Text fontSize="10px" color="rgba(255,255,255,0.3)">12m ago</Text>
              </Flex>
              <Text fontWeight="semibold" fontSize="sm" color="white" mb={1}>ML Research Role</Text>
              <Text fontSize="xs" color="#93c5fd" fontWeight="bold">Negotiable</Text>
              <Box mt={3} h="1px" bg="rgba(255,255,255,0.06)" />
              <Text fontSize="xs" color="rgba(255,255,255,0.3)" mt={2}>🎓 Academic · Remote</Text>
            </Box>
          </MotionBox>
        </MotionBox>

        {/* Hero content */}
        <Container maxW="3xl" position="relative" zIndex={1} textAlign="center">
          <Stack gap={7} align="center">
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Flex align="center" gap={2} bg="rgba(124,58,237,0.1)" border="1px solid rgba(124,58,237,0.25)"
                borderRadius="full" px={4} py={2} display="inline-flex">
                <Box w={1.5} h={1.5} borderRadius="full" bg="#a78bfa"
                  style={{ animation: "pulse 2s infinite" }} />
                <Text fontSize="xs" color="rgba(167,139,250,0.9)" fontWeight="medium" letterSpacing="wide">
                  Powered by Claude MCP · Built for students
                </Text>
              </Flex>
            </MotionBox>

            <Stack gap={3}>
              <MotionHeading
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                fontSize={{ base: "4xl", md: "6xl" }} fontWeight="black" lineHeight="1.05" letterSpacing="-0.03em"
                color="white"
              >
                Find your next
              </MotionHeading>
              <RollingTicker />
              <MotionHeading
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
                fontSize={{ base: "4xl", md: "6xl" }} fontWeight="black" lineHeight="1.05" letterSpacing="-0.03em"
                color="rgba(255,255,255,0.35)"
              >
                Get paid in crypto.
              </MotionHeading>
            </Stack>

            <MotionText
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
              fontSize={{ base: "md", md: "lg" }} color="rgba(255,255,255,0.45)" maxW="xl" lineHeight="relaxed"
            >
              The global student opportunity platform. Post gigs, discover internships,
              and receive cross-border crypto payments — no bank required.
            </MotionText>

            <MotionFlex
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
              gap={3} flexWrap="wrap" justify="center"
            >
              <Link href="/register">
                <Button size="lg" px={8} py={6} fontSize="sm" fontWeight="semibold"
                  bg="white" color="#050510"
                  _hover={{ bg: "rgba(255,255,255,0.9)", transform: "translateY(-2px)", shadow: "0 20px 60px rgba(255,255,255,0.15)" }}
                  transition="all 0.25s" borderRadius="xl">
                  Start for free →
                </Button>
              </Link>
              <Link href="/opportunities">
                <Button size="lg" px={8} py={6} fontSize="sm" fontWeight="medium"
                  bg="rgba(255,255,255,0.06)" color="rgba(255,255,255,0.7)"
                  border="1px solid rgba(255,255,255,0.1)"
                  _hover={{ bg: "rgba(255,255,255,0.1)", color: "white", transform: "translateY(-2px)" }}
                  transition="all 0.25s" borderRadius="xl">
                  Browse opportunities
                </Button>
              </Link>
            </MotionFlex>

            <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <Flex gap={2} flexWrap="wrap" justify="center">
                {["GIG", "INTERNSHIP", "RESEARCH", "PART-TIME", "VOLUNTEER", "FULL-TIME"].map((t) => (
                  <Badge key={t} px={3} py={1} borderRadius="full" fontSize="10px" fontWeight="medium"
                    bg="rgba(255,255,255,0.05)" color="rgba(255,255,255,0.3)"
                    border="1px solid rgba(255,255,255,0.07)" letterSpacing="wider">
                    {t}
                  </Badge>
                ))}
              </Flex>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <Box py={14} borderY="1px solid rgba(255,255,255,0.05)" bg="rgba(255,255,255,0.015)">
        <Container maxW="3xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={6} textAlign="center">
            {stats.map((s, i) => (
              <MotionBox key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color="white">
                  <Counter target={s.value} />
                </Text>
                <Text color="rgba(255,255,255,0.3)" fontSize="sm" mt={1} fontWeight="medium">{s.label}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Features ────────────────────────────────────────────────── */}
      <Box py={28}>
        <Container maxW="6xl">
          <Stack gap={20}>
            <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} textAlign="center">
              <Text fontSize="xs" fontWeight="bold" color="rgba(167,139,250,0.8)" letterSpacing="widest" textTransform="uppercase" mb={4}>
                Platform Features
              </Text>
              <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" letterSpacing="-0.02em" mb={4}>
                Everything you need in one place
              </Heading>
              <Text color="rgba(255,255,255,0.4)" fontSize="lg" maxW="xl" mx="auto">
                Modern tooling, AI-powered, and built with the global student in mind.
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
              {features.map((f, i) => (
                <MotionBox key={f.title}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)"
                  borderRadius="2xl" p={6} cursor="default" position="relative" overflow="hidden"
                  _hover={{ borderColor: "rgba(255,255,255,0.14)", bg: "rgba(255,255,255,0.04)" }}
                  transition="all 0.25s">
                  <Box position="absolute" top={0} left={0} right={0} h="1px" bgGradient={f.gradient} opacity={0.6} />
                  <Box w={10} h={10} borderRadius="xl" bgGradient={f.gradient} display="flex"
                    alignItems="center" justifyContent="center" fontSize="lg" mb={4} shadow="lg">
                    {f.icon}
                  </Box>
                  <Heading size="sm" mb={2} color="white" letterSpacing="-0.01em">{f.title}</Heading>
                  <Text color="rgba(255,255,255,0.4)" fontSize="sm" lineHeight="relaxed">{f.description}</Text>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* ── Testimonials ────────────────────────────────────────────── */}
      <Box py={24} bg="rgba(255,255,255,0.012)" borderY="1px solid rgba(255,255,255,0.05)">
        <Container maxW="6xl">
          <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            textAlign="center" mb={14}>
            <Text fontSize="xs" fontWeight="bold" color="rgba(167,139,250,0.8)" letterSpacing="widest" textTransform="uppercase" mb={4}>
              Student Stories
            </Text>
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" letterSpacing="-0.02em">
              Loved by students everywhere
            </Heading>
          </MotionBox>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {testimonials.map((t, i) => (
              <MotionBox key={t.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)"
                borderRadius="2xl" p={7} position="relative">
                <Text color="rgba(255,255,255,0.55)" fontSize="sm" lineHeight="relaxed" mb={7}>
                  &ldquo;{t.text}&rdquo;
                </Text>
                <HStack gap={3}>
                  <Box w={9} h={9} borderRadius="full" bg={t.color} display="flex"
                    alignItems="center" justifyContent="center" fontSize="xs" fontWeight="bold" flexShrink={0}>
                    {t.avatar}
                  </Box>
                  <Stack gap={0}>
                    <Text fontWeight="semibold" fontSize="sm" color="white">{t.name}</Text>
                    <Text color="rgba(255,255,255,0.3)" fontSize="xs">{t.role}</Text>
                  </Stack>
                </HStack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <Box py={32} position="relative" overflow="hidden">
        <Box position="absolute" inset={0}
          bgGradient="radial(ellipse at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 65%)" />
        <Box position="absolute" top="20%" left="20%" w="300px" h="300px" borderRadius="full"
          bg="rgba(124,58,237,0.06)" filter="blur(80px)" />
        <Box position="absolute" bottom="20%" right="20%" w="250px" h="250px" borderRadius="full"
          bg="rgba(37,99,235,0.06)" filter="blur(60px)" />

        <Container maxW="2xl" position="relative" textAlign="center">
          <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Stack gap={7} align="center">
              <Text fontSize="xs" fontWeight="bold" color="rgba(167,139,250,0.8)" letterSpacing="widest" textTransform="uppercase">
                Get started today
              </Text>
              <Heading fontSize={{ base: "4xl", md: "6xl" }} fontWeight="black" lineHeight="1.05" letterSpacing="-0.03em">
                Your next opportunity
                <br />
                <Box as="span" color="rgba(255,255,255,0.3)">is one click away.</Box>
              </Heading>
              <Text color="rgba(255,255,255,0.4)" fontSize="lg" maxW="md">
                Join thousands of students already earning and growing on OpportunityBoard.
              </Text>
              <Link href="/register">
                <Button size="lg" px={10} py={6} fontSize="sm" fontWeight="semibold"
                  bg="white" color="#050510"
                  _hover={{ bg: "rgba(255,255,255,0.9)", transform: "translateY(-3px)", shadow: "0 24px 60px rgba(255,255,255,0.15)" }}
                  transition="all 0.25s" borderRadius="xl">
                  Create your free account →
                </Button>
              </Link>
              <Text color="rgba(255,255,255,0.2)" fontSize="xs">
                No credit card required · Free forever for students
              </Text>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Box borderTop="1px solid rgba(255,255,255,0.05)" py={8}>
        <Container maxW="6xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <HStack gap={2}>
              <Box w={5} h={5} borderRadius="md" bgGradient="linear(135deg, #7c3aed, #2563eb)"
                display="flex" alignItems="center" justifyContent="center" fontSize="10px">🎓</Box>
              <Text color="rgba(255,255,255,0.2)" fontSize="sm">OpportunityBoard © 2025</Text>
            </HStack>
            <HStack gap={6}>
              {["Privacy", "Terms", "Contact", "GitHub"].map((item) => (
                <Text key={item} color="rgba(255,255,255,0.2)" fontSize="sm" cursor="pointer"
                  _hover={{ color: "rgba(255,255,255,0.5)" }} transition="color 0.2s">{item}</Text>
              ))}
            </HStack>
          </Flex>
        </Container>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
}
