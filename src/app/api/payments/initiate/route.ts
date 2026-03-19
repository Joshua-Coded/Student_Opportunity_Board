import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const initiateSchema = z.object({
  opportunityId: z.string(),
  applicantId: z.string(), // the accepted worker being paid
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

    const { opportunityId, applicantId, amount, currency, chain } = parsed.data;

    // Only the opportunity poster (author) can make payments
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { authorId: true, title: true, paymentType: true },
    });
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    if (opportunity.authorId !== session.user.id) {
      return NextResponse.json({ error: "Only the job poster can make payments" }, { status: 403 });
    }
    if (opportunity.paymentType !== "CRYPTO") {
      return NextResponse.json({ error: "This opportunity does not use crypto payments" }, { status: 400 });
    }

    // Verify the applicant has an accepted application for this opportunity
    const application = await prisma.application.findUnique({
      where: { opportunityId_applicantId: { opportunityId, applicantId } },
      select: { status: true },
    });
    if (!application || application.status !== "ACCEPTED") {
      return NextResponse.json({ error: "Applicant must be accepted before payment" }, { status: 400 });
    }

    // Get the applicant's wallet address (where payment is sent TO)
    const applicant = await prisma.user.findUnique({
      where: { id: applicantId },
      select: { walletAddress: true, name: true },
    });
    if (!applicant?.walletAddress) {
      return NextResponse.json(
        { error: `${applicant?.name || "The applicant"} hasn't set up a receiving wallet address yet.` },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        opportunityId,
        payerId: session.user.id,
        cryptoAmount: amount,
        cryptoCurrency: currency,
        networkChain: chain,
        toWalletAddress: applicant.walletAddress,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      toWalletAddress: payment.toWalletAddress,
      recipientName: applicant.name,
      amount: payment.cryptoAmount,
      currency: payment.cryptoCurrency,
      chain: payment.networkChain,
      status: payment.status,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
