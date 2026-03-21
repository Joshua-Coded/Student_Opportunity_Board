import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } });
  return user?.isAdmin ? session : null;
}

// Flag or close an opportunity
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, status: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete an opportunity
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.opportunity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
