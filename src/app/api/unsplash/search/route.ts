import { NextResponse } from "next/server";
import { searchPhotos } from "@/lib/unsplash";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  if (!q.trim())
    return NextResponse.json({ total: 0, total_pages: 0, results: [] });
  try {
    const data = await searchPhotos(q, page, 20);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
