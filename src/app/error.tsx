"use client";

import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center" color="white">
      <Stack align="center" spacing={6} textAlign="center">
        <Text fontSize="5xl">⚠️</Text>
        <Stack spacing={2}>
          <Heading size="lg">Something went wrong</Heading>
          <Text color="gray.500" maxW="sm">An unexpected error occurred. Please try again.</Text>
        </Stack>
        <Button onClick={reset} bgGradient="linear(to-r, purple.500, blue.500)" color="white"
          _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }} borderRadius="xl" px={8}>
          Try again
        </Button>
      </Stack>
    </Box>
  );
}
