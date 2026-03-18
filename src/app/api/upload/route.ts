import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSignedUploadParams } from "@/lib/cloudinary";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = generateSignedUploadParams(session.user.id);
    return NextResponse.json(params);
  } catch {
    return NextResponse.json({ error: "Failed to generate upload signature" }, { status: 500 });
  }
}
