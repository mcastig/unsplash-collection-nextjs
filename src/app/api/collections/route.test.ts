/**
 * @jest-environment node
 */
import { GET, POST } from "./route";
import pool from "@/lib/db";

jest.mock("@/lib/db", () => ({ query: jest.fn() }));

const mockPool = pool as jest.Mocked<typeof pool>;

function makeRequest(body?: object): Request {
  return new Request("http://localhost/api/collections", {
    method: body !== undefined ? "POST" : "GET",
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/collections", () => {
  it("returns rows from db", async () => {
    const rows = [{ id: 1, name: "Nature", image_count: 2 }];
    mockPool.query.mockResolvedValueOnce({ rows } as never);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });

  it("returns 500 on db error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("db error") as never);
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });
});

describe("POST /api/collections", () => {
  it("creates a collection and returns 201", async () => {
    const row = { id: 2, name: "Urban", created_at: "2024-01-01" };
    mockPool.query.mockResolvedValueOnce({ rows: [row] } as never);
    const res = await POST(makeRequest({ name: "Urban" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Urban");
    expect(body.image_count).toBe(0);
    expect(body.cover_image).toBeNull();
  });

  it("returns 400 when name is empty", async () => {
    const res = await POST(makeRequest({ name: "  " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name exceeds max length", async () => {
    const res = await POST(makeRequest({ name: "a".repeat(101) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on db error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("fail") as never);
    const res = await POST(makeRequest({ name: "Test" }));
    expect(res.status).toBe(500);
  });
});
