import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/saved — list saved opportunity IDs for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedOpportunity.findMany({
    where: { userId: session.user.id },
    include: {
      opportunity: {
        include: { author: { select: { id: true, name: true, university: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(saved);
}

// POST /api/saved — toggle save/unsave
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { opportunityId } = await req.json();
  if (!opportunityId) return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });

  const existing = await prisma.savedOpportunity.findUnique({
    where: { userId_opportunityId: { userId: session.user.id, opportunityId } },
  });

  if (existing) {
    await prisma.savedOpportunity.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedOpportunity.create({ data: { userId: session.user.id, opportunityId } });
    return NextResponse.json({ saved: true });
  }
}
