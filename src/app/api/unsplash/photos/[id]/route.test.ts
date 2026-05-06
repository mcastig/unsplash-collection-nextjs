/**
 * @jest-environment node
 */
import { GET } from './route';

jest.mock('@/lib/unsplash', () => ({
  getPhoto: jest.fn(),
}));

import { getPhoto } from '@/lib/unsplash';
const mockGetPhoto = getPhoto as jest.MockedFunction<typeof getPhoto>;

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/unsplash/photos/[id]', () => {
  it('returns photo data from unsplash', async () => {
    const photo = { id: 'abc', urls: { small: '/s.jpg' } };
    mockGetPhoto.mockResolvedValueOnce(photo as never);
    const res = await GET(new Request('http://localhost'), makeParams('abc'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(photo);
    expect(mockGetPhoto).toHaveBeenCalledWith('abc');
  });

  it('returns 500 when getPhoto throws', async () => {
    mockGetPhoto.mockRejectedValueOnce(new Error('not found'));
    const res = await GET(new Request('http://localhost'), makeParams('missing'));
    expect(res.status).toBe(500);
  });
});
