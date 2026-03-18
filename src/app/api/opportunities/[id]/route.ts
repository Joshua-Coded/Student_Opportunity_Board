import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { opportunitySchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, image: true, university: true, bio: true } },
        _count: { select: { payments: true, applications: true } },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const opportunity = await prisma.opportunity.findUnique({ where: { id: params.id } });
    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (opportunity.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = opportunitySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const updated = await prisma.opportunity.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const opportunity = await prisma.opportunity.findUnique({ where: { id: params.id } });
    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (opportunity.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.opportunity.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
