import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enhanceOpportunityListing } from "@/lib/claude";
import { z } from "zod";

const enhanceSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.string(),
  skills: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = enhanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
    }

    const result = await enhanceOpportunityListing(parsed.data);
    if (!result) {
      return NextResponse.json({ error: "AI enhancement failed" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    const msg = err?.message || "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
