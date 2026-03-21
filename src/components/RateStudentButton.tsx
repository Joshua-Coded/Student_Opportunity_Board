"use client";

import {
  Box, Button, Flex, Modal, ModalBody, ModalContent, ModalHeader,
  ModalOverlay, Stack, Text, Textarea, useDisclosure, useToast,
} from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  rateeId: string;
  rateeName: string;
  opportunityId: string;
  gigTitle: string;
  onSuccess?: () => void;
}

export default function RateStudentButton({ rateeId, rateeName, opportunityId, gigTitle, onSuccess }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!stars) { toast({ title: "Pick a star rating", status: "warning", duration: 2000 }); return; }
    setLoading(true);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rateeId, opportunityId, stars, comment }),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "Rating submitted!", status: "success", duration: 2000 });
      onClose();
      onSuccess?.();
    } else {
      const data = await res.json();
      toast({ title: data.error || "Failed to submit", status: "error", duration: 3000 });
    }
  }

  return (
    <>
      <Button size="xs" onClick={onOpen}
        bg="rgba(234,179,8,0.1)" color="yellow.300"
        border="1px solid rgba(234,179,8,0.25)"
        _hover={{ bg: "rgba(234,179,8,0.2)" }} borderRadius="lg">
        ⭐ Rate
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(8px)" />
        <ModalContent bg="#0d0d1a" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" mx={4}>
          <ModalHeader color="white" fontSize="md">Rate {rateeName}</ModalHeader>
          <ModalBody pb={6}>
            <Stack spacing={5}>
              <Box bg="rgba(139,92,246,0.06)" border="1px solid rgba(139,92,246,0.15)" borderRadius="lg" px={3} py={2}>
                <Text color="gray.500" fontSize="xs">Gig</Text>
                <Text color="white" fontSize="sm" fontWeight="medium">{gigTitle}</Text>
              </Box>

              <Stack spacing={2}>
                <Text color="gray.400" fontSize="sm">How was the experience?</Text>
                <Flex gap={2}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Text key={s} fontSize="2xl" cursor="pointer"
                      opacity={(hovered || stars) >= s ? 1 : 0.3}
                      transition="all 0.1s"
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setStars(s)}>
                      ⭐
                    </Text>
                  ))}
                </Flex>
                {stars > 0 && (
                  <Text color="purple.300" fontSize="xs">
                    {["", "Poor", "Fair", "Good", "Great", "Excellent!"][stars]}
                  </Text>
                )}
              </Stack>

              <Stack spacing={1}>
                <Text color="gray.400" fontSize="sm">Comment <Text as="span" color="gray.600">(optional)</Text></Text>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience working with this student..."
                  bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)"
                  color="white" _placeholder={{ color: "gray.600" }}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #7c3aed" }}
                  borderRadius="xl" rows={3} resize="none" maxLength={300} />
                <Text color="gray.700" fontSize="xs" textAlign="right">{comment.length}/300</Text>
              </Stack>

              <Flex gap={3}>
                <Button flex={1} variant="ghost" color="gray.500" onClick={onClose} borderRadius="xl">Cancel</Button>
                <Button flex={1} onClick={handleSubmit} isLoading={loading}
                  bgGradient="linear(to-r, purple.500, blue.500)" color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }}
                  borderRadius="xl">Submit Rating</Button>
              </Flex>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
