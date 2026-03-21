"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const theme = extendTheme({
  config: { initialColorMode: "dark", useSystemColorMode: false },
  styles: {
    global: {
      body: { bg: "#050510", color: "white" },
    },
  },
  colors: {
    brand: {
      50: "#f5f3ff",
      100: "#ede9fe",
      500: "#7c3aed",
      600: "#6d28d9",
      700: "#5b21b6",
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: "purple" },
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>OpportunityBoard — Find gigs. Get paid in crypto.</title>
        <meta name="description" content="A student-first platform for discovering paid gigs, internships, and campus opportunities with cross-border crypto payments — no bank required." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="student jobs, student gigs, crypto payments, internships, remote work, student opportunities, MetaMask, web3 jobs" />
        <meta property="og:title" content="OpportunityBoard — Find gigs. Get paid in crypto." />
        <meta property="og:description" content="The global student opportunity platform. Post gigs, find work, and get paid in crypto — no bank required." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://student-opportunity-board-smzb.vercel.app" />
        <meta property="og:site_name" content="OpportunityBoard" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="OpportunityBoard — Find gigs. Get paid in crypto." />
        <meta name="twitter:description" content="The global student opportunity platform. Post gigs, find work, and get paid in crypto — no bank required." />
        <link rel="canonical" href="https://student-opportunity-board-smzb.vercel.app" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </head>
      <body>
        <SessionProvider>
          <ChakraProvider theme={theme}>
            {children}
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
