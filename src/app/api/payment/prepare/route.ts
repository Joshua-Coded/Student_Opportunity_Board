// API route: prepare an ETH payment transaction for MetaMask signing
// The frontend calls this → gets tx params → passes to MetaMask

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const RPC_URL =
  process.env.RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/fJ8QpNHpso79z1xgPtVo0";

const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, amount_eth, note } = body as {
      from: string;
      to: string;
      amount_eth: string;
      note?: string;
    };

    if (!from || !to || !amount_eth) {
      return NextResponse.json(
        { error: "Missing required fields: from, to, amount_eth" },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
      return NextResponse.json({ error: "Invalid from or to address" }, { status: 400 });
    }

    const value = ethers.parseEther(amount_eth);
    const feeData = await provider.getFeeData();
    const gasEstimate = await provider.estimateGas({ from, to, value });
    const nonce = await provider.getTransactionCount(from, "latest");
    const network = await provider.getNetwork();

    const txParams = {
      from,
      to,
      value: "0x" + value.toString(16),
      gas: "0x" + gasEstimate.toString(16),
      maxFeePerGas: feeData.maxFeePerGas
        ? "0x" + feeData.maxFeePerGas.toString(16)
        : undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        ? "0x" + feeData.maxPriorityFeePerGas.toString(16)
        : undefined,
      nonce: "0x" + nonce.toString(16),
      chainId: "0x" + network.chainId.toString(16),
    };

    const estimatedFeeEth = ethers.formatEther(
      gasEstimate * (feeData.gasPrice ?? 0n)
    );

    return NextResponse.json({
      txParams,
      summary: {
        from,
        to,
        amount_eth,
        estimated_fee_eth: estimatedFeeEth,
        note: note ?? null,
        network: network.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
