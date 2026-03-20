"use client";

import { Box, Badge, Button, Container, Flex, Heading, Input, SimpleGrid, Stack, Text, HStack, Avatar } from "@chakra-ui/react";
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

const testimonials = [
  { name: "Amara Diallo", role: "CS Student · Univ. of Lagos", text: "Found a Next.js gig that paid 0.15 ETH within 24 hours of posting. The AI enhanced my listing and made it look insanely professional.", avatar: "AD", color: "#7c3aed" },
  { name: "Carlos Mendes", role: "UX Designer · São Paulo", text: "Received 200 USDC on Polygon for a branding project. No fees, instant settlement. This is what cross-border work should feel like.", avatar: "CM", color: "#2563eb" },
  { name: "Priya Nair", role: "ML Researcher · IIT Bombay", text: "Posted a research assistant role and had 8 applicants by morning. The platform just works — clean, fast, student-focused.", avatar: "PN", color: "#059669" },
];

const TICKER = ["React Developer", "ML Research Assistant", "Smart Contract Auditor", "UX Designer", "Data Analyst", "Rust Developer", "Technical Writer", "Node.js Developer"];

const CATEGORIES = [
  { type: "GIG", label: "Gigs", icon: "⚡", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)", text: "#a78bfa" },
  { type: "INTERNSHIP", label: "Internships", icon: "🏢", bg: "rgba(5,150,105,0.12)", border: "rgba(5,150,105,0.3)", text: "#6ee7b7" },
  { type: "PART_TIME", label: "Part-time", icon: "🕐", bg: "rgba(37,99,235,0.12)", border: "rgba(37,99,235,0.3)", text: "#93c5fd" },
  { type: "FULL_TIME", label: "Full-time", icon: "💼", bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.3)", text: "#5eead4" },
  { type: "VOLUNTEER", label: "Volunteer", icon: "🤝", bg: "rgba(217,119,6,0.12)", border: "rgba(217,119,6,0.3)", text: "#fcd34d" },
  { type: "RESEARCH", label: "Research", icon: "🔬", bg: "rgba(219,39,119,0.12)", border: "rgba(219,39,119,0.3)", text: "#f9a8d4" },
];

const FAQS = [
  { q: "Is it free to sign up?", a: "Yes — signing up, browsing, and applying are completely free. Posting opportunities is also free." },
  { q: "Do I need a crypto wallet to use the platform?", a: "Not to browse or apply. You only need a wallet address in your profile if you want to receive crypto payments for work you complete." },
  { q: "Which cryptocurrencies are supported?", a: "ETH, USDC, and MATIC on Ethereum and Polygon networks. The poster specifies the chain when listing an opportunity." },
  { q: "How does AI enhancement work?", a: "When posting, click 'Enhance with AI'. Claude rewrites your title and description to be clearer and more professional — powered by Claude MCP." },
  { q: "Can I post without offering crypto payment?", a: "Yes. Payment type is flexible — Free, Negotiable, or Crypto. Crypto is optional." },
  { q: "Is this platform only for students?", a: "Built with students in mind but open to anyone. Startups and independent posters can also list opportunities." },
];

const typeColor: Record<string, string> = {
  GIG: "purple", INTERNSHIP: "blue", PART_TIME: "green",
  FULL_TIME: "teal", VOLUNTEER: "orange", RESEARCH: "pink",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function Counter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <>{target > 0 ? display.toLocaleString() : "—"}</>;
}

function RollingTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TICKER.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <Box overflow="hidden" h="44px" display="flex" alignItems="center">
      <AnimatePresence mode="wait">
        <MotionBox key={index}
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }} transition={{ duration: 0.35, ease: "easeInOut" }}>
          <Text fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }} fontWeight="black"
            bgGradient="linear(to-r, purple.400, blue.400, cyan.300)" bgClip="text" lineHeight="1">
            {TICKER[index]}
          </Text>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <MotionBox initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
      <Box bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)"
        borderRadius="xl" overflow="hidden" cursor="pointer" onClick={() => setOpen(!open)}
        _hover={{ borderColor: "rgba(255,255,255,0.12)" }} transition="border-color 0.2s">
        <Flex justify="space-between" align="center" px={6} py={4}>
          <Text fontWeight="medium" color="white" fontSize="sm" pr={4}>{question}</Text>
          <Text color="gray.500" fontSize="xl" lineHeight={1}
            style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</Text>
        </Flex>
        {open && (
          <Box px={6} pb={5}>
            <Text color="rgba(255,255,255,0.45)" fontSize="sm" lineHeight="relaxed">{answer}</Text>
          </Box>
        )}
      </Box>
    </MotionBox>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setDone(true);
    setLoading(false);
  }

  return (
    <Box py={20} position="relative" overflow="hidden">
      <Box position="absolute" inset={0}
        bgGradient="radial(ellipse at 50% 100%, rgba(124,58,237,0.07) 0%, transparent 60%)" />
      <Container maxW="xl" position="relative" textAlign="center">
        <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Stack spacing={5} align="center">
            <Text fontSize="xs" fontWeight="bold" color="rgba(167,139,250,0.8)"
              letterSpacing="widest" textTransform="uppercase">Stay in the loop</Text>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" letterSpacing="-0.02em">
              New opportunities, every week
            </Heading>
            <Text color="rgba(255,255,255,0.35)" fontSize="sm" maxW="sm">
              Get a weekly digest of the best gigs, internships, and research roles — straight to your inbox.
            </Text>
            {done ? (
              <Flex align="center" gap={3} px={6} py={4}
                bg="rgba(34,197,94,0.1)" border="1px solid rgba(34,197,94,0.25)" borderRadius="xl">
                <Text fontSize="lg">🎉</Text>
                <Text color="green.300" fontSize="sm" fontWeight="medium">You're on the list! We'll be in touch.</Text>
              </Flex>
            ) : (
              <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "420px" }}>
                <Flex gap={2}>
                  <Input
                    type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                    color="white" _placeholder={{ color: "gray.600" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                    borderRadius="xl" fontSize="sm" required
                  />
                  <Button type="submit" isLoading={loading} px={6} flexShrink={0}
                    bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                    _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                    transition="all 0.2s" borderRadius="xl" fontSize="sm" fontWeight="semibold">
                    Subscribe
                  </Button>
                </Flex>
              </form>
            )}
            <Text color="rgba(255,255,255,0.15)" fontSize="xs">No spam. Unsubscribe anytime.</Text>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const [liveData, setLiveData] = useState<{
    opportunities: any[]; users: any[];
    totalOpportunities: number; totalUsers: number; totalPayments: number;
  }>({ opportunities: [], users: [], totalOpportunities: 0, totalUsers: 0, totalPayments: 0 });

  useEffect(() => {
    fetch("/api/public/stats").then(r => r.json()).then(setLiveData).catch(() => {});
  }, []);

  return (
    <Box minH="100vh" bg="#050510" color="white" overflow="hidden">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <MotionBox
        initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        position="fixed" top={0} left={0} right={0} zIndex={100}
        bg="rgba(5,5,16,0.75)" backdropFilter="blur(24px) saturate(180%)"
        borderBottom="1px solid rgba(255,255,255,0.06)">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={2.5}>
            <Box w={8} h={8} borderRadius="lg" bgGradient="linear(135deg, #7c3aed, #2563eb)"
              display="flex" alignItems="center" justifyContent="center" fontSize="sm"
              shadow="0 0 20px rgba(124,58,237,0.5)">🎓</Box>
            <Heading size="sm" letterSpacing="tight"
              bgGradient="linear(to-r, white, rgba(255,255,255,0.7))" bgClip="text">
              OpportunityBoard
            </Heading>
          </HStack>
          <HStack gap={7} display={{ base: "none", md: "flex" }}>
            {["Browse", "How it works", "FAQ"].map((item) => (
              <Text key={item} fontSize="sm" color="rgba(255,255,255,0.45)" cursor="pointer"
                _hover={{ color: "white" }} transition="color 0.2s" fontWeight="medium">{item}</Text>
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
              <Button size="sm" px={5} bg="white" color="#050510"
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
                fontSize={{ base: "4xl", md: "6xl" }} fontWeight="black" lineHeight="1.05" letterSpacing="-0.03em" color="white">
                Find your next
              </MotionHeading>
              <RollingTicker />
              <MotionHeading
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
                fontSize={{ base: "4xl", md: "6xl" }} fontWeight="black" lineHeight="1.05" letterSpacing="-0.03em"
                color="rgba(255,255,255,0.35)">
                Get paid in crypto.
              </MotionHeading>
            </Stack>

            <MotionText
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
              fontSize={{ base: "md", md: "lg" }} color="rgba(255,255,255,0.45)" maxW="xl" lineHeight="relaxed">
              The global student opportunity platform. Post gigs, discover internships,
              and receive cross-border crypto payments — no bank required.
            </MotionText>

            <MotionFlex
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
              gap={3} flexWrap="wrap" justify="center">
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

            {/* Animated user social proof */}
            <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7 }}>
              <Flex direction="column" align="center" gap={3}>
                <Flex align="center" justify="center" position="relative">
                  <Box position="absolute" w="180px" h="48px" borderRadius="full"
                    bg="rgba(124,58,237,0.18)" filter="blur(18px)" />
                  <Flex position="relative">
                    {(liveData.users.length > 0 ? liveData.users.slice(0, 6) : Array(6).fill(null)).map((u, i) => (
                      <MotionBox key={i}
                        initial={{ opacity: 0, scale: 0.4, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                        style={{ marginLeft: i === 0 ? 0 : -12, zIndex: 10 - i }}
                        whileHover={{ scale: 1.2, zIndex: 20 }}>
                        <Avatar size="md" name={u?.name || "?"} src={u?.image || undefined}
                          bg={["purple.600","blue.600","pink.600","teal.600","orange.600","indigo.600"][i % 6]}
                          color="white" border="2.5px solid #050510"
                          boxShadow="0 0 0 1px rgba(124,58,237,0.4)" />
                      </MotionBox>
                    ))}
                    {liveData.totalUsers > 6 && (
                      <MotionBox
                        initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.15, type: "spring", stiffness: 300 }}
                        style={{ marginLeft: -12, zIndex: 1 }}>
                        <Box w="44px" h="44px" borderRadius="full"
                          bg="rgba(124,58,237,0.25)" border="2.5px solid #050510"
                          boxShadow="0 0 0 1px rgba(124,58,237,0.4)"
                          display="flex" alignItems="center" justifyContent="center">
                          <Text fontSize="10px" fontWeight="bold" color="purple.300">
                            +{liveData.totalUsers - 6}
                          </Text>
                        </Box>
                      </MotionBox>
                    )}
                  </Flex>
                </Flex>
                <Flex align="center" gap={2}>
                  <Box w={1.5} h={1.5} borderRadius="full" bg="green.400"
                    style={{ animation: "pulse 2s infinite" }} />
                  <Text fontSize="sm" color="rgba(255,255,255,0.45)">
                    <Text as="span" color="white" fontWeight="bold">
                      {liveData.totalUsers > 0 ? liveData.totalUsers.toLocaleString() : "—"}
                    </Text>
                    {" "}students already on the platform
                  </Text>
                </Flex>
              </Flex>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <Box py={14} borderY="1px solid rgba(255,255,255,0.05)" bg="rgba(255,255,255,0.015)">
        <Container maxW="3xl">
          <SimpleGrid columns={{ base: 2, md: 3 }} gap={6} textAlign="center">
            {[
              { value: liveData.totalUsers, label: "Students" },
              { value: liveData.totalOpportunities, label: "Active Opportunities" },
              { value: liveData.totalPayments, label: "Payments Made" },
            ].map((s, i) => (
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

      {/* ── How it works ────────────────────────────────────────────── */}
      <Box py={28}>
        <Container maxW="5xl">
          <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} textAlign="center" mb={16}>
            <Text fontSize="xs" fontWeight="bold" color="rgba(167,139,250,0.8)" letterSpacing="widest" textTransform="uppercase" mb={4}>
              How it works
            </Text>
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" letterSpacing="-0.02em">
              Up and running in minutes
            </Heading>
          </MotionBox>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={10} position="relative">
            {[
              { step: "01", title: "Create your profile", desc: "Sign up, add your university, major, and crypto wallet address to receive payments.", icon: "👤", color: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)" },
              { step: "02", title: "Post or apply", desc: "Post an opportunity with one-click AI enhancement, or browse and apply to gigs, internships, and research roles.", icon: "📋", color: "rgba(37,99,235,0.12)", border: "rgba(37,99,235,0.3)" },
              { step: "03", title: "Get paid in crypto", desc: "Accept an applicant and send ETH, USDC, or MATIC directly to their wallet — instant, borderless, no fees.", icon: "⚡", color: "rgba(5,150,105,0.12)", border: "rgba(5,150,105,0.3)" },
            ].map((item, i) => (
              <MotionBox key={item.step}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Flex direction="column" align="center" textAlign="center" gap={5}>
                  <Box position="relative">
                    <Box w={20} h={20} borderRadius="2xl" bg={item.color} border={`1px solid ${item.border}`}
                      display="flex" alignItems="center" justifyContent="center" fontSize="2xl">
                      {item.icon}
                    </Box>
                    <Box position="absolute" top={-2} right={-2} w={7} h={7} borderRadius="full"
                      bg="rgba(124,58,237,0.9)" border="2px solid #050510"
                      display="flex" alignItems="center" justifyContent="center">
                      <Text fontSize="10px" fontWeight="black" color="white">{item.step}</Text>
                    </Box>
                  </Box>
                  <Stack spacing={2}>
                    <Heading size="sm" color="white">{item.title}</Heading>
                    <Text color="rgba(255,255,255,0.4)" fontSize="sm" lineHeight="relaxed">{item.desc}</Text>
                  </Stack>
                </Flex>
              </MotionBox>
            ))}
          </SimpleGrid>
          <Flex justify="center" mt={12}>
            <Link href="/register">
              <Button size="md" px={8}
                bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                transition="all 0.2s" borderRadius="xl">
                Get started free →
              </Button>
            </Link>
          </Flex>
        </Container>
      </Box>

      {/* ── Features ────────────────────────────────────────────────── */}
      <Box py={28} bg="rgba(255,255,255,0.01)" borderY="1px solid rgba(255,255,255,0.04)">
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
                  _hover={{ borderColor: "rgba(255,255,255,0.14)", bg: "rgba(255,255,255,0.04)" }}>
                  <Box position="absolute" top={0} left={0} right={0} h="1px" bgGradient={f.gradient} opacity={0.6} />
                  <Box w={10} h={10} borderRadius="xl" bgGradient={f.gradient}
                    display="flex" alignItems="center" justifyContent="center" fontSize="lg" mb={4} shadow="lg">
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

      {/* ── Browse by category ───────────────────────────────────────── */}
      <Box py={20}>
        <Container maxW="4xl">
          <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} textAlign="center" mb={12}>
            <Text fontSize="xs" fontWeight="bold" color="rgba(167,139,250,0.8)" letterSpacing="widest" textTransform="uppercase" mb={4}>
              Browse by category
            </Text>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" letterSpacing="-0.02em">
              Find exactly what you're looking for
            </Heading>
          </MotionBox>
          <Flex justify="center" flexWrap="wrap" gap={3}>
            {CATEGORIES.map((cat, i) => (
              <MotionBox key={cat.type}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05 }}>
                <Link href={`/opportunities?type=${cat.type}`}>
                  <Flex align="center" gap={3} px={6} py={3}
                    bg={cat.bg} border={`1px solid ${cat.border}`}
                    borderRadius="xl" cursor="pointer" transition="all 0.2s"
                    _hover={{ opacity: 0.85 }}>
                    <Text fontSize="xl">{cat.icon}</Text>
                    <Text fontWeight="semibold" fontSize="sm" color={cat.text}>{cat.label}</Text>
                  </Flex>
                </Link>
              </MotionBox>
            ))}
          </Flex>
        </Container>
      </Box>

      {/* ── Live on the Platform ─────────────────────────────────── */}
      {(liveData.opportunities.length > 0 || liveData.users.length > 0) && (
        <Box py={24} bg="rgba(255,255,255,0.01)" borderY="1px solid rgba(255,255,255,0.04)">
          <Container maxW="6xl">
            <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} textAlign="center" mb={14}>
              <Flex align="center" justify="center" gap={2} mb={4}>
                <Box w={2} h={2} borderRadius="full" bg="green.400"
                  sx={{ animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }} />
                <Text fontSize="xs" fontWeight="bold" color="green.400" letterSpacing="widest" textTransform="uppercase">
                  Live on the Platform
                </Text>
              </Flex>
              <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" letterSpacing="-0.02em" color="white">
                Real students, real opportunities
              </Heading>
              <Text color="rgba(255,255,255,0.4)" mt={3} fontSize="sm">
                Posted right now by students like you
              </Text>
            </MotionBox>

            {liveData.users.length > 0 && (
              <Box mb={14}>
                <Text color="rgba(255,255,255,0.3)" fontSize="xs" fontWeight="bold" textTransform="uppercase"
                  letterSpacing="widest" mb={5} textAlign="center">Recently Joined</Text>
                <Flex justify="center" flexWrap="wrap" gap={3}>
                  {liveData.users.map((u) => (
                    <Link href={`/profile/${u.id}`} key={u.id}>
                      <Flex align="center" gap={2} px={3} py={2}
                        bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.07)"
                        borderRadius="full" cursor="pointer"
                        _hover={{ bg: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.3)" }}
                        transition="all 0.2s">
                        <Avatar size="xs" name={u.name || "?"} src={u.image || undefined} bg="purple.700" />
                        <Text fontSize="sm" color="gray.300" fontWeight="medium">{u.name}</Text>
                        {u.university && (
                          <Text fontSize="xs" color="gray.600" display={{ base: "none", md: "block" }}>· {u.university}</Text>
                        )}
                      </Flex>
                    </Link>
                  ))}
                </Flex>
              </Box>
            )}

            {liveData.opportunities.length > 0 && (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                {liveData.opportunities.map((opp, i) => (
                  <MotionBox key={opp.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                    <Link href={`/opportunities/${opp.id}`}>
                      <Box bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)"
                        borderRadius="2xl" p={5} cursor="pointer" h="full"
                        _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.4)", transform: "translateY(-2px)" }}
                        transition="all 0.2s">
                        <Flex justify="space-between" align="flex-start" mb={3}>
                          <Badge colorScheme={typeColor[opp.type] || "gray"} borderRadius="full" px={2} fontSize="xs">{opp.type}</Badge>
                          {opp.paymentType === "CRYPTO" && (
                            <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="xs">Crypto</Badge>
                          )}
                        </Flex>
                        <Text fontWeight="semibold" color="white" fontSize="sm" noOfLines={2} mb={2}>{opp.title}</Text>
                        {opp.compensationAmount && (
                          <Text color="purple.300" fontSize="sm" fontWeight="bold" mb={3}>
                            {opp.compensationAmount} {opp.compensationCurrency}
                          </Text>
                        )}
                        <Flex align="center" gap={2} mt="auto">
                          <Avatar size="xs" name={opp.author?.name || "?"} src={opp.author?.image || undefined} bg="blue.700" />
                          <Box>
                            <Text color="gray.400" fontSize="xs" fontWeight="medium">{opp.author?.name}</Text>
                            {opp.author?.university && (
                              <Text color="gray.600" fontSize="xs" noOfLines={1}>{opp.author.university}</Text>
                            )}
                          </Box>
                          <Text color="gray.700" fontSize="xs" ml="auto">{opp.isRemote ? "Remote" : opp.location}</Text>
                        </Flex>
                      </Box>
                    </Link>
                  </MotionBox>
                ))}
              </SimpleGrid>
            )}

            <Flex justify="center" mt={10}>
              <Link href="/opportunities">
                <Button variant="outline" borderColor="rgba(255,255,255,0.15)" color="gray.300"
                  _hover={{ bg: "rgba(255,255,255,0.06)", borderColor: "purple.500", color: "white" }}
                  borderRadius="xl" px={8}>
                  View all opportunities →
                </Button>
              </Link>
            </Flex>
          </Container>
        </Box>
      )}

      {/* ── Tech stack trust strip ───────────────────────────────────── */}
      <Box py={14} borderY="1px solid rgba(255,255,255,0.04)">
        <Container maxW="5xl">
          <Text textAlign="center" fontSize="xs" color="rgba(255,255,255,0.18)" fontWeight="medium"
            letterSpacing="widest" textTransform="uppercase" mb={10}>Built with</Text>
          <Flex justify="center" align="center" flexWrap="wrap" gap={{ base: 8, md: 14 }}>
            {[
              { name: "Ethereum", desc: "Crypto payments" },
              { name: "Polygon", desc: "Low-fee chain" },
              { name: "Neon DB", desc: "Serverless Postgres" },
            ].map((tech) => (
              <MotionBox key={tech.name}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} whileHover={{ y: -2 }}>
                <Flex direction="column" align="center" gap={1}>
                  <Text fontWeight="bold" fontSize="sm" color="rgba(255,255,255,0.45)">{tech.name}</Text>
                  <Text fontSize="10px" color="rgba(255,255,255,0.2)">{tech.desc}</Text>
                </Flex>
              </MotionBox>
            ))}
          </Flex>
        </Container>
      </Box>

      {/* ── Supported crypto ─────────────────────────────────────────── */}
      <Box py={14} bg="rgba(255,255,255,0.008)">
        <Container maxW="3xl" textAlign="center">
          <Text fontSize="xs" color="rgba(255,255,255,0.2)" fontWeight="medium" letterSpacing="widest"
            textTransform="uppercase" mb={7}>Accepted cryptocurrencies</Text>
          <Flex justify="center" flexWrap="wrap" gap={3}>
            {[
              { symbol: "ETH", name: "Ethereum", color: "#627EEA" },
              { symbol: "USDC", name: "USD Coin", color: "#2775CA" },
              { symbol: "MATIC", name: "Polygon", color: "#8247E5" },
              { symbol: "BNB", name: "BNB Chain", color: "#F3BA2F" },
            ].map((coin) => (
              <MotionBox key={coin.symbol}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} whileHover={{ scale: 1.05 }}>
                <Flex align="center" gap={2} px={5} py={2.5}
                  bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.07)"
                  borderRadius="full" transition="all 0.2s"
                  _hover={{ borderColor: "rgba(255,255,255,0.15)", bg: "rgba(255,255,255,0.07)" }}>
                  <Box w={2.5} h={2.5} borderRadius="full" bg={coin.color} flexShrink={0} />
                  <Text fontWeight="bold" fontSize="sm" color="white">{coin.symbol}</Text>
                  <Text fontSize="xs" color="rgba(255,255,255,0.3)">{coin.name}</Text>
                </Flex>
              </MotionBox>
            ))}
          </Flex>
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
                  <Box w={9} h={9} borderRadius="full" bg={t.color}
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="xs" fontWeight="bold" flexShrink={0}>{t.avatar}</Box>
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

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <Box py={24}>
        <Container maxW="3xl">
          <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} textAlign="center" mb={14}>
            <Text fontSize="xs" fontWeight="bold" color="rgba(167,139,250,0.8)" letterSpacing="widest" textTransform="uppercase" mb={4}>
              FAQ
            </Text>
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" letterSpacing="-0.02em">
              Common questions
            </Heading>
          </MotionBox>
          <Stack spacing={3}>
            {FAQS.map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} index={i} />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <Box borderY="1px solid rgba(255,255,255,0.05)" bg="rgba(255,255,255,0.01)">
        <NewsletterSection />
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
                Join students already earning and growing on OpportunityBoard.
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
