/**
 * @jest-environment node
 */
import { GET, DELETE } from './route';
import pool from '@/lib/db';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));

const mockPool = pool as jest.Mocked<typeof pool>;

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/collections/[id]', () => {
  it('returns collection when found', async () => {
    const row = { id: 1, name: 'Nature', image_count: 3, cover_image: null };
    mockPool.query.mockResolvedValueOnce({ rows: [row] } as never);
    const res = await GET(new Request('http://localhost'), makeParams('1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(row);
  });

  it('returns 404 when not found', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] } as never);
    const res = await GET(new Request('http://localhost'), makeParams('99'));
    expect(res.status).toBe(404);
  });

  it('returns 500 on db error', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('fail'));
    const res = await GET(new Request('http://localhost'), makeParams('1'));
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/collections/[id]', () => {
  it('deletes and returns success', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] } as never);
    const res = await DELETE(new Request('http://localhost'), makeParams('1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM collections'),
      ['1']
    );
  });

  it('returns 500 on db error', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('fail'));
    const res = await DELETE(new Request('http://localhost'), makeParams('1'));
    expect(res.status).toBe(500);
  });
});
