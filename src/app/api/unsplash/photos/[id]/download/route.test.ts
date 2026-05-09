/**
 * @jest-environment node
 */
import { GET } from "./route";
import { checkRateLimit } from "@/lib/rateLimit";

jest.mock("@/lib/unsplash", () => ({
  getPhoto: jest.fn(),
  triggerDownload: jest.fn(),
}));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockReturnValue(true),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

import { getPhoto, triggerDownload } from "@/lib/unsplash";
const mockGetPhoto = getPhoto as jest.MockedFunction<typeof getPhoto>;
const mockTriggerDownload = triggerDownload as jest.MockedFunction<
  typeof triggerDownload
>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/unsplash/photos/[id]/download", () => {
  beforeEach(() => {
    mockGetPhoto.mockReset();
    mockTriggerDownload.mockReset();
  });

  it("triggers download and returns { success: true }", async () => {
    const photo = {
      id: "abc",
      links: {
        download_location:
          "https://api.unsplash.com/photos/abc/download?ixid=xyz",
      },
    };
    mockGetPhoto.mockResolvedValueOnce(photo as never);
    mockTriggerDownload.mockResolvedValueOnce(undefined);
    const res = await GET(new Request("http://localhost"), makeParams("abc"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockTriggerDownload).toHaveBeenCalledWith(
      photo.links.download_location,
    );
  });

  it("returns 500 when getPhoto throws", async () => {
    mockGetPhoto.mockRejectedValueOnce(new Error("not found"));
    const res = await GET(
      new Request("http://localhost"),
      makeParams("missing"),
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed" });
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValueOnce(false);
    const res = await GET(new Request("http://localhost"), makeParams("abc"));
    expect(res.status).toBe(429);
  });
});
