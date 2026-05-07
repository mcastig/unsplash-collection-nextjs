import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  if (!checkRateLimit(getClientIp(req), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { id, imageId } = await params;
    await pool.query(
      "DELETE FROM collection_images WHERE collection_id = $1 AND image_id = $2",
      [id, imageId],
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "DELETE /api/collections/[id]/images/[imageId]");
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 },
    );
  }
}
