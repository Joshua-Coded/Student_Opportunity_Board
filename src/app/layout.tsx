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
        <meta name="description" content="A student-first platform for discovering paid gigs, internships, and campus opportunities with cross-border crypto payments." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
