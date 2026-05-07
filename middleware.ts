import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest): NextResponse {
  if (!MUTATING_METHODS.has(req.method)) return NextResponse.next();

  const origin = req.headers.get("origin");
  // Allow server-to-server calls (no Origin header)
  if (!origin) return NextResponse.next();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const allowed = new Set([appUrl]);

  if (process.env.NODE_ENV === "development") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  if (!allowed.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
