import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const { rows } = await pool.query(
      "INSERT INTO collections (name) VALUES ($1) RETURNING *",
      [name.trim()],
    );
    return NextResponse.json(
      { ...rows[0], image_count: 0, cover_image: null },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 },
    );
  }
}
