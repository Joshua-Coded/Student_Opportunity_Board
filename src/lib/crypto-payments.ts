import { prisma } from "./prisma";

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

export async function confirmPayment(paymentId: string, fromWallet: string, txHash: string) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "CONFIRMED",
      txHash,
      fromWalletAddress: fromWallet,
      confirmedAt: new Date(),
    },
    include: { opportunity: true, payer: true },
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: { opportunity: true, payer: true },
  });
}
