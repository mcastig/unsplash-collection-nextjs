export function logError(error: unknown, context: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
  }
  // TODO: forward to an error-tracking service (e.g. Sentry) in production
}
