import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendNewApplicationEmail } from "@/lib/email";

const applySchema = z.object({
  opportunityId: z.string(),
  coverLetter: z.string().min(30, "Cover letter must be at least 30 characters"),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

// POST — submit application
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { opportunityId, coverLetter, portfolioUrl } = parsed.data;

    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    if (opportunity.authorId === session.user.id) {
      return NextResponse.json({ error: "You cannot apply to your own opportunity" }, { status: 400 });
    }
    if (opportunity.status !== "ACTIVE") {
      return NextResponse.json({ error: "This opportunity is no longer active" }, { status: 400 });
    }

    const existing = await prisma.application.findUnique({
      where: { opportunityId_applicantId: { opportunityId, applicantId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already applied to this opportunity" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        opportunityId,
        applicantId: session.user.id,
        coverLetter,
        portfolioUrl: portfolioUrl || null,
      },
      include: {
        applicant: { select: { name: true, email: true, university: true } },
        opportunity: {
          select: { title: true, id: true, author: { select: { name: true, email: true } } },
        },
      },
    });

    // Notify the opportunity poster
    if (application.opportunity.author?.email) {
      sendNewApplicationEmail({
        to: application.opportunity.author.email,
        posterName: application.opportunity.author.name || "there",
        applicantName: application.applicant.name || "A student",
        opportunityTitle: application.opportunity.title,
        opportunityId: application.opportunity.id,
        applicationId: application.id,
      }).catch((err) => console.error("[email] new application:", err));
    }

    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — list applications (my sent or received)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "sent"; // "sent" or "received"

    if (mode === "sent") {
      const applications = await prisma.application.findMany({
        where: { applicantId: session.user.id },
        include: {
          opportunity: {
            select: { id: true, title: true, type: true, paymentType: true, author: { select: { id: true, name: true, university: true, image: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(applications);
    }

    // received — applications on my opportunities
    const applications = await prisma.application.findMany({
      where: { opportunity: { authorId: session.user.id } },
      include: {
        applicant: { select: { id: true, name: true, email: true, university: true, major: true, bio: true, image: true, walletAddress: true } },
        opportunity: { select: { id: true, title: true, type: true, paymentType: true, compensationAmount: true, compensationCurrency: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
