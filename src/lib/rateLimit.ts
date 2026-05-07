// In-memory rate limiter — sufficient for single-instance deployments.
// For multi-instance / serverless at scale, replace with an Upstash Redis-backed limiter.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  // Skip rate limiting in test environments
  if (process.env.NODE_ENV === "test") return true;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"
  );
}
