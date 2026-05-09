/**
 * @jest-environment node
 */
import { GET } from "./route";
import { checkRateLimit } from "@/lib/rateLimit";

jest.mock("@/lib/unsplash", () => ({
  searchPhotos: jest.fn(),
}));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockReturnValue(true),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

import { searchPhotos } from "@/lib/unsplash";
const mockSearchPhotos = searchPhotos as jest.MockedFunction<
  typeof searchPhotos
>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

function makeRequest(query: string, page?: string): Request {
  const url = new URL("http://localhost/api/unsplash/search");
  if (query) url.searchParams.set("q", query);
  if (page) url.searchParams.set("page", page);
  return new Request(url.toString());
}

describe("GET /api/unsplash/search", () => {
  it("returns empty result when query is blank", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ total: 0, total_pages: 0, results: [] });
    expect(mockSearchPhotos).not.toHaveBeenCalled();
  });

  it("returns search results from unsplash", async () => {
    const data = { total: 1, total_pages: 1, results: [{ id: "x" }] };
    mockSearchPhotos.mockResolvedValueOnce(data as never);
    const res = await GET(makeRequest("nature", "2"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(data);
    expect(mockSearchPhotos).toHaveBeenCalledWith("nature", 2, 20);
  });

  it("returns 500 when unsplash throws", async () => {
    mockSearchPhotos.mockRejectedValueOnce(new Error("api down"));
    const res = await GET(makeRequest("trees"));
    expect(res.status).toBe(500);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce(false);
    const res = await GET(makeRequest("nature"));
    expect(res.status).toBe(429);
  });
});
