import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/claude";
import { z } from "zod";

const schema = z.object({
  opportunityId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const [opportunity, user] = await Promise.all([
      prisma.opportunity.findUnique({
        where: { id: parsed.data.opportunityId },
        select: { title: true, type: true, description: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, university: true, major: true },
      }),
    ]);

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const coverLetter = await generateCoverLetter({
      opportunityTitle: opportunity.title,
      opportunityType: opportunity.type,
      opportunityDescription: opportunity.description,
      applicantName: user?.name || "Student",
      applicantUniversity: user?.university || undefined,
      applicantMajor: user?.major || undefined,
    });

    if (!coverLetter) {
      return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
    }

    return NextResponse.json({ coverLetter });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
