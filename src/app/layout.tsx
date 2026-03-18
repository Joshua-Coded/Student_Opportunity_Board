"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";

const system = createSystem(defaultConfig);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#050510" }}>
        <SessionProvider>
          <ChakraProvider value={system}>
            {children}
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
