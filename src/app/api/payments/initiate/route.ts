import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initiatePayment, getReceivingWallet } from "@/lib/crypto-payments";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const initiateSchema = z.object({
  opportunityId: z.string(),
  amount: z.number().positive(),
  currency: z.enum(["ETH", "USDC", "MATIC"]),
  chain: z.enum(["ethereum", "polygon"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = initiateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { opportunityId, amount, currency, chain } = parsed.data;

    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    if (opportunity.paymentType !== "CRYPTO") {
      return NextResponse.json({ error: "This opportunity does not accept crypto payments" }, { status: 400 });
    }

    const payment = await initiatePayment({
      opportunityId,
      payerId: session.user.id,
      amount,
      currency,
      chain,
    });

    return NextResponse.json({
      paymentId: payment.id,
      toWalletAddress: payment.toWalletAddress,
      amount: payment.cryptoAmount,
      currency: payment.cryptoCurrency,
      chain: payment.networkChain,
      status: payment.status,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
