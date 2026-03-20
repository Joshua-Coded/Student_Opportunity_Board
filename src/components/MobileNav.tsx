"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/dashboard", icon: "⊞" },
  { label: "Browse", href: "/opportunities", icon: "◎" },
  { label: "Post", href: "/opportunities/new", icon: "＋" },
  { label: "Apps", href: "/dashboard/applications", icon: "◫" },
  { label: "Profile", href: "/dashboard/profile", icon: "◯" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <Box
      display={{ base: "flex", md: "none" }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={100}
      bg="rgba(5,5,16,0.97)"
      borderTop="1px solid rgba(255,255,255,0.08)"
      backdropFilter="blur(20px)"
      px={2}
      pb="env(safe-area-inset-bottom)"
    >
      <Flex w="full" justify="space-around" align="center">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link href={item.href} key={item.href}>
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={3}
                px={3}
                gap={1}
                cursor="pointer"
                position="relative"
              >
                {active && (
                  <Box
                    position="absolute"
                    top={0}
                    left="50%"
                    transform="translateX(-50%)"
                    w="24px"
                    h="2px"
                    bg="purple.400"
                    borderRadius="full"
                  />
                )}
                <Text
                  fontSize="18px"
                  color={active ? "purple.300" : "gray.600"}
                  lineHeight={1}
                >
                  {item.icon}
                </Text>
                <Text
                  fontSize="10px"
                  fontWeight={active ? "semibold" : "normal"}
                  color={active ? "purple.300" : "gray.600"}
                  letterSpacing="wide"
                >
                  {item.label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
}
