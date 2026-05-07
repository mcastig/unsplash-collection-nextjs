/**
 * @jest-environment node
 */

// Rate limiter skips in NODE_ENV=test, so we test via a temporary override.
// We reset modules to get a fresh store for each scenario.

describe("rateLimit", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetModules();
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
    });
  });

  it("allows requests within limit", () => {
    const { checkRateLimit } = require("@/lib/rateLimit");
    expect(checkRateLimit("ip-a", 3, 60_000)).toBe(true);
    expect(checkRateLimit("ip-a", 3, 60_000)).toBe(true);
    expect(checkRateLimit("ip-a", 3, 60_000)).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const { checkRateLimit } = require("@/lib/rateLimit");
    checkRateLimit("ip-b", 2, 60_000);
    checkRateLimit("ip-b", 2, 60_000);
    expect(checkRateLimit("ip-b", 2, 60_000)).toBe(false);
  });

  it("resets the counter after the window expires", () => {
    jest.useFakeTimers();
    const { checkRateLimit } = require("@/lib/rateLimit");
    checkRateLimit("ip-c", 1, 1_000);
    expect(checkRateLimit("ip-c", 1, 1_000)).toBe(false);
    jest.advanceTimersByTime(1_001);
    expect(checkRateLimit("ip-c", 1, 1_000)).toBe(true);
    jest.useRealTimers();
  });

  it("skips rate limiting in test environment", () => {
    jest.resetModules();
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "test",
      writable: true,
    });
    const { checkRateLimit } = require("@/lib/rateLimit");
    for (let i = 0; i < 200; i++) {
      expect(checkRateLimit("ip-test", 1, 60_000)).toBe(true);
    }
  });

  it("getClientIp returns x-forwarded-for header when present", () => {
    const { getClientIp } = require("@/lib/rateLimit");
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("getClientIp falls back to 127.0.0.1 when header is absent", () => {
    const { getClientIp } = require("@/lib/rateLimit");
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
