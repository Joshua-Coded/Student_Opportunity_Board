import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { university: { not: null } },
      select: { university: true },
      distinct: ["university"],
      orderBy: { university: "asc" },
    });

    const universities = users
      .map((u) => u.university)
      .filter(Boolean) as string[];

    return NextResponse.json(universities);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
