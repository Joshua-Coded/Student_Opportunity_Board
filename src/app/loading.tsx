import { Box } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center">
      <Box
        w={10} h={10} borderRadius="full"
        border="2px solid" borderColor="purple.500"
        borderTopColor="transparent"
        style={{ animation: "spin 0.7s linear infinite" }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}
