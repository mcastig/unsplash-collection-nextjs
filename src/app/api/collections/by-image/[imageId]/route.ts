import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ imageId: string }> }) {
  try {
    const { imageId } = await params;
    const { rows } = await pool.query(
      `SELECT c.id AS "collectionId", c.name AS "collectionName", row_to_json(ci) AS entry
       FROM collection_images ci
       JOIN collections c ON c.id = ci.collection_id
       WHERE ci.image_id = $1
       ORDER BY ci.created_at DESC`,
      [imageId]
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
