import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

const MAX_NAME_LENGTH = 100;

export async function GET(req: Request) {
  if (!checkRateLimit(getClientIp(req), 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.created_at,
        COUNT(ci.id)::int AS image_count,
        (SELECT row_to_json(ci2) FROM collection_images ci2
         WHERE ci2.collection_id = c.id ORDER BY ci2.created_at DESC LIMIT 1) AS cover_image
      FROM collections c
      LEFT JOIN collection_images ci ON ci.collection_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    logError(error, "GET /api/collections");
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!checkRateLimit(getClientIp(req), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const body = await req.json().catch(() => null);
    const name = body?.name;
    if (
      !name ||
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > MAX_NAME_LENGTH
    ) {
      return NextResponse.json(
        { error: `Name must be 1–${MAX_NAME_LENGTH} characters` },
        { status: 400 },
      );
    }
    const { rows } = await pool.query(
      "INSERT INTO collections (name) VALUES ($1) RETURNING *",
      [name.trim()],
    );
    return NextResponse.json(
      { ...rows[0], image_count: 0, cover_image: null },
      { status: 201 },
    );
  } catch (error) {
    logError(error, "POST /api/collections");
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 },
    );
  }
}
