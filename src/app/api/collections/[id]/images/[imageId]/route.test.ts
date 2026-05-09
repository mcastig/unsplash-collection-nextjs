/**
 * @jest-environment node
 */
import { DELETE } from "./route";
import pool from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

jest.mock("@/lib/db", () => ({ query: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockReturnValue(true),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

const mockPool = pool as jest.Mocked<typeof pool>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const makeParams = (id: string, imageId: string) => ({
  params: Promise.resolve({ id, imageId }),
});

describe("DELETE /api/collections/[id]/images/[imageId]", () => {
  it("removes image from collection and returns success", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] } as never);
    const res = await DELETE(
      new Request("http://localhost"),
      makeParams("3", "imgABC"),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM collection_images"),
      ["3", "imgABC"],
    );
  });

  it("returns 500 on db error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("fail") as never);
    const res = await DELETE(
      new Request("http://localhost"),
      makeParams("3", "imgABC"),
    );
    expect(res.status).toBe(500);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce(false);
    const res = await DELETE(
      new Request("http://localhost"),
      makeParams("3", "imgABC"),
    );
    expect(res.status).toBe(429);
  });
});
