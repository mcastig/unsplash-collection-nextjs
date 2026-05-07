import { NextResponse } from "next/server";
import { searchPhotos } from "@/lib/unsplash";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

const MAX_QUERY_LENGTH = 200;

export async function GET(req: Request) {
  if (!checkRateLimit(getClientIp(req), 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").slice(0, MAX_QUERY_LENGTH);
  const page = parseInt(searchParams.get("page") || "1", 10);
  if (!q.trim())
    return NextResponse.json({ total: 0, total_pages: 0, results: [] });
  try {
    const data = await searchPhotos(q, page, 20);
    return NextResponse.json(data);
  } catch (error) {
    logError(error, "GET /api/unsplash/search");
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
