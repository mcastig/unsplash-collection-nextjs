import { NextResponse } from "next/server";
import { getPhoto, triggerDownload } from "@/lib/unsplash";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkRateLimit(getClientIp(req), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { id } = await params;
    const photo = await getPhoto(id);
    await triggerDownload(photo.links.download_location);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "GET /api/unsplash/photos/[id]/download");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
