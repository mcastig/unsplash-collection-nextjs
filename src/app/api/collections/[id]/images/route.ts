import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

function isValidUrl(value: unknown): boolean {
  if (!value || typeof value !== "string") return true;
  if (!value.startsWith("http")) return true; // allow relative paths and empty strings
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

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
      "SELECT * FROM collection_images WHERE collection_id = $1 ORDER BY created_at DESC",
      [id],
    );
    return NextResponse.json(rows);
  } catch (error) {
    logError(error, "GET /api/collections/[id]/images");
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkRateLimit(getClientIp(req), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    const requiredStrings = ["image_id", "image_url", "photographer_name", "photographer_username"];
    for (const field of requiredStrings) {
      if (!body?.[field] || typeof body[field] !== "string") {
        return NextResponse.json(
          { error: `Missing or invalid field: ${field}` },
          { status: 400 },
        );
      }
    }

    const urlFields = ["image_url", "image_thumb_url", "image_small_url", "photographer_avatar"];
    for (const field of urlFields) {
      if (body[field] && !isValidUrl(body[field])) {
        return NextResponse.json(
          { error: `Invalid URL for field: ${field}` },
          { status: 400 },
        );
      }
    }

    const {
      image_id,
      image_url,
      image_thumb_url,
      image_small_url,
      photographer_name,
      photographer_username,
      photographer_avatar,
      published_at,
    } = body;

    const { rows } = await pool.query(
      `INSERT INTO collection_images
        (collection_id, image_id, image_url, image_thumb_url, image_small_url,
        photographer_name, photographer_username, photographer_avatar, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (collection_id, image_id) DO NOTHING
       RETURNING *`,
      [
        id,
        image_id,
        image_url,
        image_thumb_url,
        image_small_url,
        photographer_name,
        photographer_username,
        photographer_avatar,
        published_at || null,
      ],
    );
    if (!rows[0])
      return NextResponse.json(
        { error: "Image already in collection" },
        { status: 409 },
      );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    logError(error, "POST /api/collections/[id]/images");
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 },
    );
  }
}
