import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all opportunities where this user has an accepted application
    const acceptedApplications = await prisma.application.findMany({
      where: { applicantId: session.user.id, status: "ACCEPTED" },
      select: { opportunityId: true },
    });

    if (acceptedApplications.length === 0) {
      return NextResponse.json([]);
    }

    const opportunityIds = acceptedApplications.map((a) => a.opportunityId);

    // Find payments on those opportunities not made by the user themselves
    const payments = await prisma.payment.findMany({
      where: {
        opportunityId: { in: opportunityIds },
        payerId: { not: session.user.id },
      },
      include: {
        opportunity: { select: { id: true, title: true } },
        payer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
