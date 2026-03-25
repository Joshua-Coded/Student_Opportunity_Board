import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [opportunities, users, totalOpportunities, totalUsers, totalPayments, totalApplications, recentApplications] = await Promise.all([
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
      prisma.opportunity.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.payment.count({ where: { status: "CONFIRMED" } }),
      prisma.application.count(),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          createdAt: true,
          opportunity: { select: { title: true, type: true, location: true, isRemote: true } },
          applicant: { select: { name: true, university: true } },
        },
      }),
    ]);

    // Build activity feed from real events
    type ActivityItem = {
      type: "application" | "signup" | "opportunity";
      message: string;
      sub: string;
      time: Date;
      icon: string;
    };

    const activity: ActivityItem[] = [];

    for (const app of recentApplications) {
      const name = app.applicant.name?.split(" ")[0] || "Someone";
      activity.push({
        type: "application",
        message: `${name} applied to ${app.opportunity.title}`,
        sub: app.applicant.university || app.opportunity.type,
        time: app.createdAt,
        icon: "📩",
      });
    }

    for (const user of users.slice(0, 6)) {
      activity.push({
        type: "signup",
        message: `${user.name?.split(" ")[0] || "A student"} just joined`,
        sub: user.university || "New member",
        time: user.createdAt,
        icon: "🎓",
      });
    }

    for (const opp of opportunities.slice(0, 6)) {
      activity.push({
        type: "opportunity",
        message: `New ${opp.type.toLowerCase()} posted`,
        sub: opp.title,
        time: opp.createdAt,
        icon: "⚡",
      });
    }

    activity.sort((a, b) => b.time.getTime() - a.time.getTime());

    return NextResponse.json({
      opportunities,
      users,
      totalOpportunities,
      totalUsers,
      totalPayments,
      totalApplications,
      activity: activity.slice(0, 20),
    });
  } catch {
    return NextResponse.json({
      opportunities: [],
      users: [],
      totalOpportunities: 0,
      totalUsers: 0,
      totalPayments: 0,
      totalApplications: 0,
      activity: [],
    });
  }
}
