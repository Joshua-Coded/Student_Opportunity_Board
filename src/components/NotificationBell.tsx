"use client";

import {
  Box, Button, Flex, Stack, Text, Popover, PopoverTrigger,
  PopoverContent, PopoverBody, Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
        if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, [session]);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  if (!session) return null;

  return (
    <Popover isOpen={open} onClose={() => setOpen(false)} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <Button size="sm" variant="ghost" color="gray.400"
            _hover={{ color: "white", bg: "rgba(255,255,255,0.06)" }}
            borderRadius="lg" px={2} onClick={handleOpen}>
            🔔
          </Button>
          {unreadCount > 0 && (
            <Badge position="absolute" top="-4px" right="-4px"
              bg="red.500" color="white" borderRadius="full"
              fontSize="9px" minW="16px" h="16px"
              display="flex" alignItems="center" justifyContent="center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent bg="#0d0d1a" border="1px solid rgba(255,255,255,0.1)"
        borderRadius="xl" w="320px" shadow="2xl" _focus={{ outline: "none" }}>
        <PopoverBody p={0}>
          <Box px={4} py={3} borderBottom="1px solid rgba(255,255,255,0.07)">
            <Text color="white" fontWeight="semibold" fontSize="sm">Notifications</Text>
          </Box>
          {notifications.length === 0 ? (
            <Box px={4} py={8} textAlign="center">
              <Text fontSize="2xl" mb={2}>🔕</Text>
              <Text color="gray.600" fontSize="sm">No notifications yet</Text>
            </Box>
          ) : (
            <Stack spacing={0} maxH="360px" overflowY="auto">
              {notifications.map((n) => (
                <Box key={n.id}
                  px={4} py={3}
                  bg={n.read ? "transparent" : "rgba(124,58,237,0.06)"}
                  borderBottom="1px solid rgba(255,255,255,0.04)"
                  _hover={{ bg: "rgba(255,255,255,0.03)" }}
                  transition="background 0.15s">
                  {n.link ? (
                    <Link href={n.link} onClick={() => setOpen(false)}>
                      <Text color="white" fontSize="xs" fontWeight="semibold" mb={0.5}>{n.title}</Text>
                      <Text color="gray.500" fontSize="xs" lineHeight="relaxed">{n.message}</Text>
                      <Text color="gray.700" fontSize="10px" mt={1}>
                        {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </Link>
                  ) : (
                    <>
                      <Text color="white" fontSize="xs" fontWeight="semibold" mb={0.5}>{n.title}</Text>
                      <Text color="gray.500" fontSize="xs" lineHeight="relaxed">{n.message}</Text>
                      <Text color="gray.700" fontSize="10px" mt={1}>
                        {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
