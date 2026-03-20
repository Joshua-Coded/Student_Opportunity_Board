import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [opportunities, users] = await Promise.all([
      prisma.opportunity.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          type: true,
          paymentType: true,
          compensationAmount: true,
          compensationCurrency: true,
          isRemote: true,
          location: true,
          createdAt: true,
          author: { select: { name: true, university: true, image: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          university: true,
          image: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({ opportunities, users });
  } catch {
    return NextResponse.json({ opportunities: [], users: [] });
  }
}
