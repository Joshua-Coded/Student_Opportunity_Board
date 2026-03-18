import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { opportunitySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const paymentType = searchParams.get("paymentType");
    const remote = searchParams.get("remote");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 12;

    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: "ACTIVE",
        ...(type ? { type: type as any } : {}),
        ...(paymentType ? { paymentType: paymentType as any } : {}),
        ...(remote === "true" ? { isRemote: true } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { skills: { has: search } },
                { tags: { has: search } },
              ],
            }
          : {}),
      },
      include: {
        author: { select: { id: true, name: true, image: true, university: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.opportunity.count({
      where: { status: "ACTIVE" },
    });

    return NextResponse.json({ opportunities, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = opportunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: { ...parsed.data, authorId: session.user.id },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
