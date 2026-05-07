import { NextResponse } from "next/server";
import pool from "@/lib/db";
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
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.created_at,
        COUNT(ci.id)::int AS image_count,
        (SELECT row_to_json(ci2) FROM collection_images ci2
         WHERE ci2.collection_id = c.id ORDER BY ci2.created_at DESC LIMIT 1) AS cover_image
      FROM collections c
      LEFT JOIN collection_images ci ON ci.collection_id = c.id
      WHERE c.id = $1
      GROUP BY c.id`,
      [id],
    );
    if (!rows[0])
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    logError(error, "GET /api/collections/[id]");
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkRateLimit(getClientIp(req), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { id } = await params;
    await pool.query("DELETE FROM collections WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "DELETE /api/collections/[id]");
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 },
    );
  }
}
