"use client";

import {
  Box, Button, Container, Flex, Heading, Input, Stack, Text, Textarea, Badge,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import UploadImage from "@/components/UploadImage";

const TYPES = ["GIG", "INTERNSHIP", "PART_TIME", "FULL_TIME", "VOLUNTEER", "RESEARCH"];
const PAYMENT_TYPES = ["FREE", "CRYPTO", "NEGOTIABLE"];
const CHAINS = ["ethereum", "polygon"];

export default function NewOpportunityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", description: "", type: "GIG", paymentType: "FREE",
    compensationAmount: "", compensationCurrency: "ETH", cryptoNetworkChain: "ethereum",
    isRemote: true, location: "", skillInput: "", tagInput: "",
    skills: [] as string[], tags: [] as string[], images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill() {
    const v = form.skillInput.trim();
    if (v && !form.skills.includes(v)) set("skills", [...form.skills, v]);
    set("skillInput", "");
  }

  function addTag() {
    const v = form.tagInput.trim().toLowerCase();
    if (v && !form.tags.includes(v)) set("tags", [...form.tags, v]);
    set("tagInput", "");
  }

  async function handleEnhance() {
    if (!form.title || !form.description) return;
    setEnhancing(true);
    const res = await fetch("/api/ai/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, description: form.description, type: form.type, skills: form.skills }),
    });
    const data = await res.json();
    setEnhancing(false);
    if (res.ok) {
      set("title", data.improvedTitle || form.title);
      set("description", data.improvedDescription || form.description);
      if (data.suggestedTags) set("tags", Array.from(new Set([...form.tags, ...data.suggestedTags])));
      if (data.suggestedSkills) set("skills", Array.from(new Set([...form.skills, ...data.suggestedSkills])));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const payload: any = {
      title: form.title, description: form.description,
      type: form.type, paymentType: form.paymentType,
      isRemote: form.isRemote, location: form.location,
      skills: form.skills, tags: form.tags, images: form.images,
    };
    if (form.paymentType === "CRYPTO" && form.compensationAmount) {
      payload.compensationAmount = parseFloat(form.compensationAmount);
      payload.compensationCurrency = form.compensationCurrency;
      payload.cryptoNetworkChain = form.cryptoNetworkChain;
    }
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErrors(data.error || {}); return; }
    router.push(`/opportunities/${data.id}`);
  }

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", _placeholder: { color: "gray.600" },
    _focus: { borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" },
    borderRadius: "xl",
  };

  return (
    <Box minH="100vh" bg="#050510" color="white">
      <Box bg="rgba(5,5,16,0.85)" backdropFilter="blur(20px)"
        borderBottom="1px solid rgba(255,255,255,0.07)" px={{ base: 4, md: 6 }} py={4}>
        <Flex maxW="4xl" mx="auto" justify="space-between" align="center">
          <Link href="/"><Heading size="md" bgGradient="linear(to-r, purple.400, blue.400)" bgClip="text" cursor="pointer">OpportunityBoard</Heading></Link>
          <Link href="/opportunities"><Button variant="ghost" size="sm" color="gray.400">Cancel</Button></Link>
        </Flex>
      </Box>

      <Container maxW="3xl" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
        <Stack spacing={8}>
          <Stack spacing={1}>
            <Heading size={{ base: "lg", md: "xl" }}>Post an Opportunity</Heading>
            <Text color="gray.400">Fill in the details — or let Claude AI enhance it for you</Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              {/* Title */}
              <Stack spacing={1}>
                <Text color="gray.400" fontSize="sm">Title *</Text>
                <Input {...inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. UI Designer for FinTech Startup" required />
                {errors.title && <Text color="red.400" fontSize="xs">{errors.title[0]}</Text>}
              </Stack>

              {/* Type & Payment */}
              <Flex gap={4} flexWrap="wrap">
                <Stack spacing={1} flex={1}>
                  <Text color="gray.400" fontSize="sm">Type *</Text>
                  <Flex gap={2} flexWrap="wrap">
                    {TYPES.map((t) => (
                      <Button key={t} size="xs" onClick={() => set("type", t)}
                        bg={form.type === t ? "purple.600" : "rgba(255,255,255,0.05)"}
                        color={form.type === t ? "white" : "gray.400"}
                        border="1px solid" borderColor={form.type === t ? "purple.500" : "rgba(255,255,255,0.08)"}
                        _hover={{ bg: "purple.600", color: "white" }} borderRadius="full">
                        {t}
                      </Button>
                    ))}
                  </Flex>
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Text color="gray.400" fontSize="sm">Payment Type *</Text>
                  <Flex gap={2}>
                    {PAYMENT_TYPES.map((p) => (
                      <Button key={p} size="xs" onClick={() => set("paymentType", p)}
                        bg={form.paymentType === p ? "blue.700" : "rgba(255,255,255,0.05)"}
                        color={form.paymentType === p ? "white" : "gray.400"}
                        border="1px solid" borderColor={form.paymentType === p ? "blue.500" : "rgba(255,255,255,0.08)"}
                        _hover={{ bg: "blue.700", color: "white" }} borderRadius="full">
                        {p}
                      </Button>
                    ))}
                  </Flex>
                </Stack>
              </Flex>

              {/* Crypto fields */}
              {form.paymentType === "CRYPTO" && (
                <Flex gap={3} flexWrap="wrap">
                  <Stack spacing={1} flex={1}>
                    <Text color="gray.400" fontSize="sm">Amount</Text>
                    <Input {...inputStyle} type="number" step="0.0001" value={form.compensationAmount}
                      onChange={(e) => set("compensationAmount", e.target.value)} placeholder="0.05" />
                  </Stack>
                  <Stack spacing={1}>
                    <Text color="gray.400" fontSize="sm">Currency</Text>
                    <Flex gap={2}>
                      {["ETH", "USDC", "MATIC"].map((c) => (
                        <Button key={c} size="xs" onClick={() => set("compensationCurrency", c)}
                          bg={form.compensationCurrency === c ? "purple.600" : "rgba(255,255,255,0.05)"}
                          color={form.compensationCurrency === c ? "white" : "gray.400"}
                          border="1px solid" borderColor="rgba(255,255,255,0.08)"
                          _hover={{ bg: "purple.600" }} borderRadius="full">{c}</Button>
                      ))}
                    </Flex>
                  </Stack>
                  <Stack spacing={1}>
                    <Text color="gray.400" fontSize="sm">Chain</Text>
                    <Flex gap={2}>
                      {CHAINS.map((c) => (
                        <Button key={c} size="xs" onClick={() => set("cryptoNetworkChain", c)}
                          bg={form.cryptoNetworkChain === c ? "blue.700" : "rgba(255,255,255,0.05)"}
                          color={form.cryptoNetworkChain === c ? "white" : "gray.400"}
                          border="1px solid" borderColor="rgba(255,255,255,0.08)"
                          _hover={{ bg: "blue.700" }} borderRadius="full">{c}</Button>
                      ))}
                    </Flex>
                  </Stack>
                </Flex>
              )}

              {/* Description */}
              <Stack spacing={1}>
                <Flex justify="space-between" align="center">
                  <Text color="gray.400" fontSize="sm">Description *</Text>
                  <Button size="xs" onClick={handleEnhance} isLoading={enhancing}
                    bg="rgba(139,92,246,0.15)" color="purple.300"
                    border="1px solid rgba(139,92,246,0.3)"
                    _hover={{ bg: "rgba(139,92,246,0.25)" }} borderRadius="full">
                    ✨ Enhance with Claude AI
                  </Button>
                </Flex>
                <Textarea {...inputStyle} value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the opportunity, requirements, and what the student will gain..."
                  rows={6} required />
                {errors.description && <Text color="red.400" fontSize="xs">{errors.description[0]}</Text>}
              </Stack>

              {/* Location */}
              <Flex gap={4} align="center">
                <Button size="sm" onClick={() => set("isRemote", !form.isRemote)}
                  bg={form.isRemote ? "green.800" : "rgba(255,255,255,0.05)"}
                  color={form.isRemote ? "green.300" : "gray.400"}
                  border="1px solid" borderColor={form.isRemote ? "green.600" : "rgba(255,255,255,0.08)"}
                  borderRadius="full" fontSize="xs">
                  {form.isRemote ? "🌍 Remote" : "📍 On-site"}
                </Button>
                {!form.isRemote && (
                  <Input {...inputStyle} value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="City, Country" flex={1} />
                )}
              </Flex>

              {/* Skills */}
              <Stack spacing={2}>
                <Text color="gray.400" fontSize="sm">Skills Required</Text>
                <Flex gap={2}>
                  <Input {...inputStyle} value={form.skillInput}
                    onChange={(e) => set("skillInput", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React, Python..." flex={1} />
                  <Button onClick={addSkill} variant="outline" borderColor="rgba(255,255,255,0.1)"
                    color="gray.400" borderRadius="xl" size="sm">Add</Button>
                </Flex>
                {form.skills.length > 0 && (
                  <Flex gap={2} flexWrap="wrap">
                    {form.skills.map((s) => (
                      <Badge key={s} bg="rgba(59,130,246,0.15)" color="blue.300"
                        borderRadius="full" px={3} py={1} cursor="pointer"
                        onClick={() => set("skills", form.skills.filter((x) => x !== s))}>
                        {s} ×
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Stack>

              {/* Tags */}
              <Stack spacing={2}>
                <Text color="gray.400" fontSize="sm">Tags</Text>
                <Flex gap={2}>
                  <Input {...inputStyle} value={form.tagInput}
                    onChange={(e) => set("tagInput", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="e.g. web3, design..." flex={1} />
                  <Button onClick={addTag} variant="outline" borderColor="rgba(255,255,255,0.1)"
                    color="gray.400" borderRadius="xl" size="sm">Add</Button>
                </Flex>
                {form.tags.length > 0 && (
                  <Flex gap={2} flexWrap="wrap">
                    {form.tags.map((t) => (
                      <Badge key={t} bg="rgba(255,255,255,0.05)" color="gray.400"
                        borderRadius="full" px={3} py={1} cursor="pointer"
                        onClick={() => set("tags", form.tags.filter((x) => x !== t))}>
                        #{t} ×
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Stack>

              {/* Cover Image */}
              <Stack spacing={2}>
                <Text color="gray.400" fontSize="sm">Cover Image <Text as="span" color="gray.600" fontWeight="normal">(optional)</Text></Text>
                <UploadImage
                  label="Upload gig cover image"
                  currentUrl={form.images[0]}
                  onUpload={(url) => set("images", [url])}
                />
              </Stack>

              {errors.general && (
                <Box bg="red.900" border="1px solid" borderColor="red.700" borderRadius="lg" px={4} py={2}>
                  <Text color="red.300" fontSize="sm">{errors.general}</Text>
                </Box>
              )}

              <Button type="submit" isLoading={loading}
                bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)", transform: "translateY(-1px)" }}
                transition="all 0.2s" borderRadius="xl" py={6} fontSize="md">
                Post Opportunity
              </Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Box>
  );
}
