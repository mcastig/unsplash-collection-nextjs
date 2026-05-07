/**
 * @jest-environment node
 */
import { GET, POST } from './route';
import pool from '@/lib/db';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));

const mockPool = pool as jest.Mocked<typeof pool>;

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

const imageBody = {
  image_id: 'img1',
  image_url: '/full.jpg',
  image_thumb_url: '/thumb.jpg',
  image_small_url: '/small.jpg',
  photographer_name: 'Alice',
  photographer_username: 'alice',
  photographer_avatar: '/avatar.jpg',
  published_at: '2024-01-01',
};

describe('GET /api/collections/[id]/images', () => {
  it('returns images for collection', async () => {
    const rows = [{ id: 1, image_id: 'img1', collection_id: 5 }];
    mockPool.query.mockResolvedValueOnce({ rows } as never);
    const res = await GET(new Request('http://localhost'), makeParams('5'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });

  it('returns 500 on db error', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('fail'));
    const res = await GET(new Request('http://localhost'), makeParams('5'));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/collections/[id]/images', () => {
  it('inserts image and returns 201', async () => {
    const row = { id: 10, collection_id: 5, ...imageBody };
    mockPool.query.mockResolvedValueOnce({ rows: [row] } as never);
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imageBody),
    });
    const res = await POST(req, makeParams('5'));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ image_id: 'img1' });
  });

  it('returns 409 when image already in collection (no row returned)', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] } as never);
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imageBody),
    });
    const res = await POST(req, makeParams('5'));
    expect(res.status).toBe(409);
  });

  it('returns 500 on db error', async () => {
    mockPool.query.mockRejectedValueOnce(new Error('fail'));
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imageBody),
    });
    const res = await POST(req, makeParams('5'));
    expect(res.status).toBe(500);
  });

  it('passes null for published_at when it is falsy', async () => {
    mockPool.query.mockClear();
    const bodyWithoutPublishedAt = { ...imageBody, published_at: '' };
    const row = { id: 11, collection_id: 5, ...bodyWithoutPublishedAt };
    mockPool.query.mockResolvedValueOnce({ rows: [row] } as never);
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithoutPublishedAt),
    });
    const res = await POST(req, makeParams('5'));
    expect(res.status).toBe(201);
    const calledArgs = mockPool.query.mock.calls[0][1] as unknown[];
    expect(calledArgs[8]).toBeNull();
  });
});
