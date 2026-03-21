import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://student-opportunity-board-smzb.vercel.app";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const opp = await prisma.opportunity.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      type: true,
      paymentType: true,
      compensationAmount: true,
      compensationCurrency: true,
      isRemote: true,
      location: true,
      author: { select: { name: true, university: true } },
    },
  });

  if (!opp) {
    return { title: "Opportunity Not Found | OpportunityBoard" };
  }

  const pay = opp.compensationAmount
    ? `${opp.compensationAmount} ${opp.compensationCurrency} · `
    : "";
  const location = opp.isRemote ? "Remote" : opp.location || "";
  const description = `${pay}${location} · Posted by ${opp.author?.name || "Anonymous"}${opp.author?.university ? ` at ${opp.author.university}` : ""}. ${opp.description.slice(0, 140)}...`;

  return {
    title: `${opp.title} | OpportunityBoard`,
    description,
    openGraph: {
      title: opp.title,
      description,
      url: `${APP_URL}/opportunities/${params.id}`,
      siteName: "OpportunityBoard",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: opp.title,
      description,
    },
  };
}

export default function OpportunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
