"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ChakraProvider value={defaultSystem}>
            {children}
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
