import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: true }); // Don't leak existence

    if (user.emailVerified) return NextResponse.json({ error: "Email already verified" }, { status: 400 });

    // Delete old tokens and create a fresh one
    await prisma.emailVerificationToken.deleteMany({ where: { email } });
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({ data: { email, token, expiresAt } });

    await sendVerificationEmail({ to: email, name: user.name || "there", token });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
