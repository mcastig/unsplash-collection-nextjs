import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { rows } = await pool.query(
      "SELECT * FROM collection_images WHERE collection_id = $1 ORDER BY created_at DESC",
      [id],
    );
    return NextResponse.json(rows);
  } catch {
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
  try {
    const { id } = await params;
    const body = await req.json();
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
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
