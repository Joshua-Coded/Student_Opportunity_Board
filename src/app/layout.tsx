"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const system = createSystem(defaultConfig);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>OpportunityBoard — Find gigs. Get paid in crypto.</title>
        <meta name="description" content="A student-first platform for discovering paid gigs, internships, and campus opportunities with cross-border crypto payments." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </head>
      <body>
        <SessionProvider>
          <ChakraProvider value={system}>
            {children}
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
