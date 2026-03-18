import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        university: true,
        major: true,
        graduationYear: true,
        createdAt: true,
        opportunities: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            title: true,
            type: true,
            paymentType: true,
            isRemote: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        _count: { select: { opportunities: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
