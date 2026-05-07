describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", { value: originalEnv, writable: true });
  });

  it("logs to console.error in non-production", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.resetModules();
    Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });
    const { logError } = require("@/lib/logger");
    logError(new Error("boom"), "test-context");
    expect(spy).toHaveBeenCalledWith("[test-context]", expect.any(Error));
    spy.mockRestore();
  });

  it("does not log to console.error in production", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.resetModules();
    Object.defineProperty(process.env, "NODE_ENV", { value: "production", writable: true });
    const { logError } = require("@/lib/logger");
    logError(new Error("boom"), "test-context");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
