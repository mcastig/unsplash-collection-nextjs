import { NextResponse } from "next/server";
import { getPhoto } from "@/lib/unsplash";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkRateLimit(getClientIp(req), 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { id } = await params;
    const data = await getPhoto(id);
    return NextResponse.json(data);
  } catch (error) {
    logError(error, "GET /api/unsplash/photos/[id]");
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 },
    );
  }
}
