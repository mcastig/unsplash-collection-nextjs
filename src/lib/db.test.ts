describe("lib/db", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("creates pool with ssl:false for localhost DATABASE_URL", () => {
    const MockPool = jest.fn();
    jest.doMock("pg", () => ({ Pool: MockPool }));
    process.env.DATABASE_URL = "postgresql://user@localhost:5432/testdb";
    require("@/lib/db");
    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: false }),
    );
  });

  it("creates pool with ssl config for remote DATABASE_URL", () => {
    const MockPool = jest.fn();
    jest.doMock("pg", () => ({ Pool: MockPool }));
    process.env.DATABASE_URL = "postgresql://user@db.neon.tech/neondb";
    require("@/lib/db");
    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: { rejectUnauthorized: false } }),
    );
  });

  it("creates pool with ssl config when DATABASE_URL is undefined", () => {
    const MockPool = jest.fn();
    jest.doMock("pg", () => ({ Pool: MockPool }));
    delete process.env.DATABASE_URL;
    require("@/lib/db");
    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: { rejectUnauthorized: false } }),
    );
  });
});
