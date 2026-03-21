import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } });
  return user?.isAdmin ? session : null;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [users, opportunities, payments, applications, ratings] = await Promise.all([
      prisma.user.count(),
      prisma.opportunity.count(),
      prisma.payment.count({ where: { status: "CONFIRMED" } }),
      prisma.application.count(),
      prisma.rating.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, university: true, emailVerified: true, isAdmin: true, createdAt: true, _count: { select: { opportunities: true, applications: true } } },
    });

    const recentOpps = await prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, type: true, status: true, paymentType: true, createdAt: true, author: { select: { id: true, name: true, email: true } } },
    });

    const recentPayments = await prisma.payment.findMany({
      where: { status: "CONFIRMED" },
      orderBy: { confirmedAt: "desc" },
      take: 10,
      select: { id: true, cryptoAmount: true, cryptoCurrency: true, txHash: true, confirmedAt: true, payer: { select: { name: true, email: true } }, opportunity: { select: { title: true } } },
    });

    return NextResponse.json({ stats: { users, opportunities, payments, applications, ratings }, recentUsers, recentOpps, recentPayments });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
