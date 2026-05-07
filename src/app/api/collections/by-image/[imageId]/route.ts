import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  if (!checkRateLimit(getClientIp(req), 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { imageId } = await params;
    const { rows } = await pool.query(
      `SELECT c.id AS "collectionId", c.name AS "collectionName", row_to_json(ci) AS entry
       FROM collection_images ci
       JOIN collections c ON c.id = ci.collection_id
       WHERE ci.image_id = $1
       ORDER BY ci.created_at DESC`,
      [imageId],
    );
    return NextResponse.json(rows);
  } catch (error) {
    logError(error, "GET /api/collections/by-image/[imageId]");
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
