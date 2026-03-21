import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getIP } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(`forgot:${getIP(req)}`, 3, 60 * 60 * 1000); // 3 per hour
    if (!allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid leaking which emails are registered
    if (!user) return NextResponse.json({ success: true });

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({ data: { email, token, expiresAt } });

    await sendPasswordResetEmail({ to: email, name: user.name || "there", token });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
