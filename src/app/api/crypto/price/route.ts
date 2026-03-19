import { NextRequest, NextResponse } from "next/server";

const COIN_IDS: Record<string, string> = {
  ETH: "ethereum",
  MATIC: "matic-network",
  USDC: "usd-coin",
  BTC: "bitcoin",
};

// Cache prices for 60s to avoid hammering CoinGecko free tier
const cache: Record<string, { usd: number; ts: number }> = {};
const CACHE_TTL = 60_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "ETH").toUpperCase();
  const coinId = COIN_IDS[symbol];

  if (!coinId) {
    return NextResponse.json({ error: `Unsupported symbol: ${symbol}` }, { status: 400 });
  }

  const cached = cache[symbol];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ symbol, usd: cached.usd, cached: true });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) throw new Error("CoinGecko API error");

    const data = await res.json();
    const usd: number = data[coinId]?.usd;

    if (!usd) throw new Error("Price not found");

    cache[symbol] = { usd, ts: Date.now() };
    return NextResponse.json({ symbol, usd });
  } catch {
    // Return cached value if available even if stale
    if (cached) return NextResponse.json({ symbol, usd: cached.usd, stale: true });
    return NextResponse.json({ error: "Could not fetch price" }, { status: 503 });
  }
}
