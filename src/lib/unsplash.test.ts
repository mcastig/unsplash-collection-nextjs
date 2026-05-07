import { searchPhotos, getPhoto, triggerDownload } from "./unsplash";

describe("lib/unsplash", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  describe("searchPhotos", () => {
    it("fetches from the /search/photos endpoint", async () => {
      const data = { results: [], total: 0, total_pages: 0 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => data,
      });
      const result = await searchPhotos("nature");
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/search/photos");
      expect(calledUrl).toContain("query=nature");
      expect(result).toEqual(data);
    });

    it("uses default page=1 and per_page=20", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [], total: 0, total_pages: 0 }),
      });
      await searchPhotos("cats");
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("page=1");
      expect(calledUrl).toContain("per_page=20");
    });

    it("accepts custom page and perPage", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [], total: 0, total_pages: 0 }),
      });
      await searchPhotos("dogs", 3, 5);
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("page=3");
      expect(calledUrl).toContain("per_page=5");
    });

    it("throws when response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      await expect(searchPhotos("x")).rejects.toThrow(
        "Unsplash API error: 401",
      );
    });
  });

  describe("getPhoto", () => {
    it("fetches a single photo by id", async () => {
      const photo = { id: "abc123" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => photo,
      });
      const result = await getPhoto("abc123");
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/photos/abc123");
      expect(result).toEqual(photo);
    });

    it("throws when response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      await expect(getPhoto("missing")).rejects.toThrow(
        "Unsplash API error: 404",
      );
    });

    it("throws on invalid photo id containing path traversal characters", async () => {
      await expect(getPhoto("../secrets")).rejects.toThrow("Invalid photo ID");
    });

    it("throws on empty photo id", async () => {
      await expect(getPhoto("")).rejects.toThrow("Invalid photo ID");
    });
  });

  describe("searchPhotos query truncation", () => {
    it("truncates queries longer than 200 characters", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [], total: 0, total_pages: 0 }),
      });
      const longQuery = "a".repeat(300);
      await searchPhotos(longQuery);
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      const params = new URL(calledUrl).searchParams;
      expect(params.get("query")!.length).toBe(200);
    });
  });

  describe("triggerDownload", () => {
    it("calls fetch with the download URL and client_id param", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      await triggerDownload(
        "https://api.unsplash.com/photos/abc/download?ixid=xyz",
      );
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("client_id");
    });
  });
});
