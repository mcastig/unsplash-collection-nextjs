import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    const { id, imageId } = await params;
    await pool.query(
      'DELETE FROM collection_images WHERE collection_id = $1 AND image_id = $2',
      [id, imageId]
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 });
  }
}
