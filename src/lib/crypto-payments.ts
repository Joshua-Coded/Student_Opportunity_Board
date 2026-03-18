import { prisma } from "./prisma";
import crypto from "crypto";

export function getReceivingWallet(chain: string): string {
  if (chain === "polygon") {
    return process.env.PAYMENT_RECEIVING_WALLET_POLYGON || "";
  }
  return process.env.PAYMENT_RECEIVING_WALLET_ETH || "";
}

export async function initiatePayment({
  opportunityId,
  payerId,
  amount,
  currency,
  chain,
}: {
  opportunityId: string;
  payerId: string;
  amount: number;
  currency: string;
  chain: string;
}) {
  const toWalletAddress = getReceivingWallet(chain);

  return prisma.payment.create({
    data: {
      opportunityId,
      payerId,
      cryptoAmount: amount,
      cryptoCurrency: currency,
      networkChain: chain,
      toWalletAddress,
      status: "PENDING",
    },
  });
}

// Simulates blockchain confirmation — replace with real RPC/webhook in production
export async function confirmPayment(paymentId: string, fromWallet: string) {
  const fakeTxHash = "0x" + crypto.randomBytes(32).toString("hex");
  const fakeBlockNumber = BigInt(
    Math.floor(Math.random() * 1_000_000) + 19_000_000
  );

  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "CONFIRMED",
      txHash: fakeTxHash,
      blockNumber: fakeBlockNumber,
      fromWalletAddress: fromWallet,
      confirmedAt: new Date(),
    },
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: { opportunity: true, payer: true },
  });
}
