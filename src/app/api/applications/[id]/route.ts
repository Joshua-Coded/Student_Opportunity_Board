import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendApplicationStatusEmail } from "@/lib/email";

const statusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]),
});

// PATCH — update application status (opportunity owner only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { opportunity: true },
    });
    if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (application.opportunity.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      include: {
        applicant: { select: { name: true, email: true } },
        opportunity: {
          select: { id: true, title: true, author: { select: { name: true, email: true } } },
        },
      },
    });

    // Notify applicant on meaningful status changes
    const notifyStatuses = ["ACCEPTED", "REJECTED", "REVIEWED"] as const;
    if (notifyStatuses.includes(parsed.data.status as any) && updated.applicant?.email) {
      sendApplicationStatusEmail({
        to: updated.applicant.email,
        applicantName: updated.applicant.name || "there",
        opportunityTitle: updated.opportunity.title,
        opportunityId: updated.opportunity.id,
        status: parsed.data.status as "ACCEPTED" | "REJECTED" | "REVIEWED",
        posterName: updated.opportunity.author?.name || undefined,
        posterEmail: updated.opportunity.author?.email || undefined,
      }).catch((err) => console.error("[email] status change:", err));

      // In-app notification to applicant
      const statusLabels: Record<string, { title: string; message: string }> = {
        ACCEPTED: { title: "Application accepted! 🎉", message: `Your application for "${updated.opportunity.title}" was accepted.` },
        REJECTED: { title: "Application update", message: `Your application for "${updated.opportunity.title}" was not selected.` },
        REVIEWED: { title: "Application reviewed 👀", message: `Your application for "${updated.opportunity.title}" has been reviewed.` },
      };
      const label = statusLabels[parsed.data.status];
      if (label) {
        prisma.notification.create({
          data: {
            userId: updated.applicantId,
            type: `APPLICATION_${parsed.data.status}`,
            title: label.title,
            message: label.message,
            link: `/opportunities/${updated.opportunity.id}`,
          },
        }).catch(() => {});
      }
    }

    // In-app notification to opportunity owner when new application submitted (handled in POST /api/applications)

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — withdraw application (applicant only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({ where: { id: params.id } });
    if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (application.applicantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.application.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
