import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box minH="100vh" bg="#050510" display="flex" alignItems="center" justifyContent="center" color="white">
      <Box position="absolute" top="30%" left="35%" w="400px" h="400px"
        borderRadius="full" bg="purple.600" opacity={0.05} filter="blur(80px)" pointerEvents="none" />
      <Stack align="center" spacing={6} textAlign="center" position="relative">
        <Text fontSize="7xl" fontWeight="black" bgGradient="linear(to-r, purple.400, blue.400)"
          bgClip="text" lineHeight="1">404</Text>
        <Stack spacing={2}>
          <Heading size="lg">Page not found</Heading>
          <Text color="gray.500" maxW="sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </Text>
        </Stack>
        <Flex gap={3} flexWrap="wrap" justify="center">
          <Link href="/">
            <Button bgGradient="linear(to-r, purple.500, blue.500)" color="white"
              _hover={{ bgGradient: "linear(to-r, purple.400, blue.400)" }}
              borderRadius="xl" px={6}>Go Home</Button>
          </Link>
          <Link href="/opportunities">
            <Button variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400"
              _hover={{ bg: "rgba(255,255,255,0.05)" }} borderRadius="xl" px={6}>Browse Opportunities</Button>
          </Link>
        </Flex>
      </Stack>
    </Box>
  );
}
