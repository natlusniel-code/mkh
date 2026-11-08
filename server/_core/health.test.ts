import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

// The regression suite for the Vercel outage.
//
// What happened: `_core/env.ts` called `required("DATABASE_URL")` and
// `required("JWT_SECRET")` at module top level, and `required()` throws when the
// variable is empty. `server/vercel.ts` imports routers → server/db.ts →
// _core/db → _core/env, so the throw happened during IMPORT — before any route
// existed. Every request answered `500 FUNCTION_INVOCATION_FAILED`, including
// `/api/health`, which needs neither a database nor auth. The client then called
// `.json()` on Vercel's plain-text error page and printed
// `Unexpected token 'A', "A server e"... is not valid JSON` to shoppers.
//
// These tests pin the two properties that make that impossible:
//   1. importing the config/db modules with NOTHING set must not throw;
//   2. /api/health must answer JSON and NAME the missing variables.

const PLATFORM = {
  DATABASE_URL: "postgresql://u:p@h/db",
  JWT_SECRET: "j",
  APP_SLUG: "demo",
};

const REQUIRED = ["DATABASE_URL", "JWT_SECRET"] as const;

function clearPlatformVars() {
  for (const name of REQUIRED) delete process.env[name];
}

async function loadEnv() {
  vi.resetModules();
  const mod = await import("./env");
  return mod.env;
}

beforeEach(() => {
  clearPlatformVars();
  vi.resetModules();
});

afterEach(() => {
  Object.assign(process.env, PLATFORM);
  vi.resetModules();
});

describe("env is import-safe (the outage's root cause)", () => {
  it("imports with no platform variables set at all", async () => {
    // The whole point: this must NOT throw. Before the fix it threw
    // "Missing required env var: DATABASE_URL" during import.
    await expect(import("./env")).resolves.toBeDefined();
  });

  it("imports the db module with no DATABASE_URL — no connection is built", async () => {
    // db.ts used to call makeTcp() at module load, which reads env.databaseUrl
    // and therefore threw on import. Importing must now be inert.
    await expect(import("./db")).resolves.toBeDefined();
  });

  it("names every missing required variable, and only those", async () => {
    const env = await loadEnv();
    expect(env.missingRequired().sort()).toEqual([...REQUIRED].sort());

    process.env.DATABASE_URL = PLATFORM.DATABASE_URL;
    const half = await loadEnv();
    expect(half.missingRequired()).toEqual(["JWT_SECRET"]);

    Object.assign(process.env, PLATFORM);
    const full = await loadEnv();
    expect(full.missingRequired()).toEqual([]);
  });

  it("throws only at the point of USE, naming the variable", async () => {
    const env = await loadEnv();
    // Reading the getter is what fails — not importing the module.
    expect(() => env.databaseUrl).toThrow(/DATABASE_URL/);
    expect(() => env.jwtSecret).toThrow(/JWT_SECRET/);

    process.env.DATABASE_URL = PLATFORM.DATABASE_URL;
    const withDb = await loadEnv();
    expect(withDb.databaseUrl).toBe(PLATFORM.DATABASE_URL);
  });
});

describe("/api/health", () => {
  async function healthResponse() {
    vi.resetModules();
    const { healthHandler } = await import("./health");
    const app = new Hono();
    app.get("/api/health", healthHandler);
    return app.request("/api/health");
  }

  it("answers JSON naming the missing variables, with 503", async () => {
    const res = await healthResponse();
    expect(res.status).toBe(503);
    // JSON, not a host error page — this is what stops the client from
    // reporting a parse error instead of the real problem.
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as { ok: boolean; missingEnv: string[] };
    expect(body.ok).toBe(false);
    expect(body.missingEnv.sort()).toEqual([...REQUIRED].sort());
  });

  it("never leaks a value — names only", async () => {
    process.env.DATABASE_URL = "postgresql://secret-user:secret-pass@host/db";
    const res = await healthResponse();
    const text = await res.text();
    expect(text).not.toContain("secret-pass");
    expect(text).not.toContain("secret-user");
  });

  it("reports ok with 200 once the variables are set", async () => {
    Object.assign(process.env, PLATFORM);
    const res = await healthResponse();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; missingEnv: string[] };
    expect(body.ok).toBe(true);
    expect(body.missingEnv).toEqual([]);
  });
});
