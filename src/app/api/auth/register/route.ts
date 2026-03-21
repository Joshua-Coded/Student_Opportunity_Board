import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(`register:${getIP(req)}`, 5, 60 * 60 * 1000); // 5 per hour
    if (!allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name, university, major } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: { email: ["Email already in use"] } },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, university, major },
      select: { id: true, email: true, name: true },
    });

    // Create verification token and send email
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await prisma.emailVerificationToken.create({ data: { email, token, expiresAt } });
    try {
      await sendVerificationEmail({ to: email, name: name || "there", token });
    } catch (err) {
      console.error("[email] verification send failed:", err);
      // Don't block registration if email fails — user can request resend later
    }

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
