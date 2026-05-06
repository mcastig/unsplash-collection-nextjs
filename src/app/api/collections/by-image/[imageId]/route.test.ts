/**
 * @jest-environment node
 */
import { GET } from './route';
import pool from '@/lib/db';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));

const mockPool = pool as jest.Mocked<typeof pool>;

const makeParams = (imageId: string) => ({
  params: Promise.resolve({ imageId }),
});

describe('GET /api/collections/by-image/[imageId]', () => {
  it('returns collections containing the image', async () => {
    const rows = [{ collectionId: 1, collectionName: 'Nature', entry: {} }];
    mockPool.query.mockResolvedValueOnce({ rows } as never);
    const res = await GET(new Request('http://localhost'), makeParams('photo1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE ci.image_id = $1'),
      ['photo1']
    );
  });

  it('returns empty array when image is in no collections', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] } as never);
    const res = await GET(new Request('http://localhost'), makeParams('orphan'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('returns 500 on db error', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('fail'));
    const res = await GET(new Request('http://localhost'), makeParams('photo1'));
    expect(res.status).toBe(500);
  });
});
