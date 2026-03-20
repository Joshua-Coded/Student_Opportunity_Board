import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { confirmPayment, getPaymentById } from "@/lib/crypto-payments";
import { z } from "zod";

const verifySchema = z.object({
  paymentId: z.string(),
  fromWalletAddress: z.string().min(10, "Invalid wallet address"),
  txHash: z.string().min(10, "Invalid transaction hash").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[payments/verify] received:", JSON.stringify(body));
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      console.log("[payments/verify] validation errors:", JSON.stringify(parsed.error.flatten().fieldErrors));
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { paymentId, fromWalletAddress, txHash } = parsed.data;

    const payment = await getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    if (payment.payerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (payment.status === "CONFIRMED") {
      return NextResponse.json({ error: "Payment already confirmed" }, { status: 409 });
    }

    const confirmed = await confirmPayment(paymentId, fromWalletAddress, txHash ?? "");

    return NextResponse.json({
      paymentId: confirmed.id,
      txHash: confirmed.txHash,
      status: confirmed.status,
      confirmedAt: confirmed.confirmedAt,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");
    if (!paymentId) {
      return NextResponse.json({ error: "paymentId required" }, { status: 400 });
    }

    const payment = await getPaymentById(paymentId);
    if (!payment || payment.payerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ status: payment.status, txHash: payment.txHash });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
