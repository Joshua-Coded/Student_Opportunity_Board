import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ratingSchema = z.object({
  rateeId: z.string(),
  opportunityId: z.string(),
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

    const { rateeId, opportunityId, stars, comment } = parsed.data;

    if (rateeId === session.user.id) return NextResponse.json({ error: "Cannot rate yourself" }, { status: 400 });

    // Verify the rater owns the opportunity and a confirmed payment exists
    const payment = await prisma.payment.findFirst({
      where: { opportunityId, payerId: session.user.id, status: "CONFIRMED" },
    });
    if (!payment) return NextResponse.json({ error: "No confirmed payment found for this gig" }, { status: 403 });

    const rating = await prisma.rating.upsert({
      where: { raterId_opportunityId: { raterId: session.user.id, opportunityId } },
      create: { raterId: session.user.id, rateeId, opportunityId, stars, comment },
      update: { stars, comment },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const ratings = await prisma.rating.findMany({
      where: { rateeId: userId },
      include: {
        rater: { select: { id: true, name: true, image: true } },
        opportunity: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
      : null;

    return NextResponse.json({ ratings, average: avg, count: ratings.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
