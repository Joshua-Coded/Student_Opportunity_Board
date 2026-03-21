import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!record) return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
    if (record.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Verification link has expired. Please register again." }, { status: 400 });
    }

    await prisma.user.update({ where: { email: record.email }, data: { emailVerified: true } });
    await prisma.emailVerificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
