import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM collections WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.created_at,
        COUNT(ci.id)::int AS image_count,
        (SELECT row_to_json(ci2) FROM collection_images ci2
         WHERE ci2.collection_id = c.id ORDER BY ci2.created_at DESC LIMIT 1) AS cover_image
      FROM collections c
      LEFT JOIN collection_images ci ON ci.collection_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}
