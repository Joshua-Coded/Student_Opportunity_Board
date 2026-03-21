"use client";

import { Button } from "@chakra-ui/react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  return (
    <Button
      size="xs"
      variant="outline"
      borderColor="whiteAlpha.300"
      color="whiteAlpha.700"
      _hover={{ borderColor: "purple.400", color: "purple.300" }}
      onClick={() => setLocale(locale === "en" ? "fr" : "en")}
      fontWeight="semibold"
      px={3}
      borderRadius="full"
    >
      {locale === "en" ? "FR" : "EN"}
    </Button>
  );
}
