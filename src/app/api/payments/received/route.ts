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

    // Find payments on opportunities where this user has any application
    // (covers ACCEPTED and cases where status may have changed after payment)
    const payments = await prisma.payment.findMany({
      where: {
        opportunity: {
          applications: {
            some: { applicantId: session.user.id },
          },
        },
        payerId: { not: session.user.id },
      },
      include: {
        opportunity: { select: { id: true, title: true } },
        payer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (err) {
    console.error("[payments/received]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
