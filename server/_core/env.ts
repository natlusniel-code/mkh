// Central, validated env access. Platform SDK only — business code should not
// read process.env directly.
//
// ── WHY NOTHING HERE IS READ AT MODULE LOAD ──────────────────────────────────
// This file used to call `required("DATABASE_URL")` and `required("JWT_SECRET")`
// at module top level, and `required()` THROWS when the variable is empty. That
// made one unset variable a total outage: `server/vercel.ts` imports
// `./routers` → `server/db.ts` → `_core/db` → `_core/env`, so the throw happened
// during import, before a single route existed. On Vercel that surfaced as
// `500 FUNCTION_INVOCATION_FAILED` on EVERY request — including `/api/health`,
// which needs no database and no auth at all — and the client then tried to
// `.json()` Vercel's plain-text error page, printing
// `Unexpected token 'A', "A server e"... is not valid JSON` to shoppers.
//
// The rule this file now follows: a missing variable must fail AT THE POINT OF
// USE, with a message naming the variable, and must never prevent the process
// from starting. `env.databaseUrl` / `env.jwtSecret` are therefore GETTERS, and
// `missingRequired()` lets a health check report what is absent without
// throwing. See `_core/db.ts` for the matching lazy driver.
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const isProd = process.env.NODE_ENV === "production";

// Variables the platform itself injects. User config must not claim these
// names, and must not be read through the two accessors below either —
// platform values have their own typed fields (env.databaseUrl / env.jwtSecret
// / …). This list must match core/webapp_builder/scaffold.py's
// RESERVED_ENV_KEYS on the backend exactly — tests/test_webapp_builder_docs.py
// asserts the two are identical.
const RESERVED_ENV_KEYS = new Set([
  "DATABASE_URL", "DB_DRIVER", "DB_POOL_MAX", "JWT_SECRET", "AUTH_PROVIDER",
  "APP_SLUG", "APP_STORAGE_PRESIGN_URL", "APP_STORAGE_TOKEN",
  "NODE_ENV", "PORT", "API_PORT",
]);

// The scope is part of the instruction, not decoration: dev and prod hold
// SEPARATE values for the same key, so "add it in Settings" without saying
// WHICH column sends a user to fill the one they already filled. `isProd` is
// exactly the distinction the settings panel draws (spec §7.1).
const SETTINGS_HINT =
  `Add it in Settings → Environment variables (${isProd ? "prod" : "dev"})`;

function userVar(name: string): string | undefined {
  if (RESERVED_ENV_KEYS.has(name)) {
    throw new Error(
      `${name} is a platform variable — read it from env.* instead of env.config/env.secret`,
    );
  }
  return process.env[name];
}

/**
 * The platform variables this app cannot run without, in the order a human
 * should set them. `health()` reports these by NAME (never by value) so a
 * misconfigured deployment says what is wrong instead of returning an opaque
 * 500 — which is exactly the diagnosis that was missing when the Vercel
 * function died on every request.
 */
const REQUIRED_PLATFORM_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;

export const env = {
  isProd,

  // ── Platform values: GETTERS, never module-level reads (see the header) ──
  /** Postgres DSN. Throws at the point of use if unset. */
  get databaseUrl(): string {
    return required("DATABASE_URL");
  },
  /** Session signing secret. Throws at the point of use if unset. */
  get jwtSecret(): string {
    return required("JWT_SECRET");
  },

  // DB driver select (see db.ts). "tcp" = node-postgres pool (default, portable,
  // right for a resident process); "http" = Neon serverless HTTP (Neon DSN +
  // scale-to-zero only). Absent ⇒ "tcp" so the template works on any Postgres.
  //
  // On a SERVERLESS host (Vercel) set DB_DRIVER=http: a TCP pool is built once
  // per frozen container and cannot be relied on between invocations.
  dbDriver: (process.env.DB_DRIVER ?? "tcp") as "tcp" | "http",
  // Max TCP connections this app's pool may hold. Only the "tcp" driver has a
  // pool; "http" opens a connection per request and ignores this.
  //
  // 5, not node-postgres' default of 10: that default suits an app that owns its
  // database server. On the platform every app gets its own database on ONE
  // SHARED cluster, so the number that matters is (apps under active iteration
  // x max), and a handful of idle-but-open pools can exhaust the cluster's
  // connection slots long before any single app needs ten.
  //
  // `|| 5` also catches a non-numeric value: `Number("八")` is NaN, and a pool
  // built with max: NaN is a subtle production fault rather than a startup error.
  dbPoolMax: Math.max(1, Number(process.env.DB_POOL_MAX) || 5),
  // The default MUST stay "local": apps created before the none mode existed
  // have no AUTH_PROVIDER in their .env and must keep email/password accounts.
  authProvider: (process.env.AUTH_PROVIDER ?? "local") as "none" | "local" | "sso",
  appSlug: process.env.APP_SLUG ?? "app",
  port: Number(process.env.PORT ?? 3000),
  apiPort: Number(process.env.API_PORT ?? 3001),
  storage: {
    presignUrl: process.env.APP_STORAGE_PRESIGN_URL ?? "",
    token: process.env.APP_STORAGE_TOKEN ?? "",
  },

  /**
   * Names of the required platform variables that are currently UNSET.
   * Empty array ⇒ the deployment is configured. NAMES ONLY — this is safe to
   * return from an unauthenticated health endpoint, and it is the whole point:
   * a broken deploy should say `["DATABASE_URL"]`, not `FUNCTION_INVOCATION_FAILED`.
   */
  missingRequired(): string[] {
    return REQUIRED_PLATFORM_VARS.filter((name) => !process.env[name]);
  },

  /**
   * A user-supplied, PLAINTEXT configuration value set in the settings panel.
   * Pass `fallback` when a sensible default exists.
   *
   * Call this where you use the value, not at module top level — a top-level
   * call would let one unset variable take down the whole app, including
   * every page that does not need it.
   */
  config(name: string, fallback?: string): string {
    const v = userVar(name);
    if (v === undefined || v === "") {
      if (fallback !== undefined) return fallback;
      throw new Error(`Missing configuration: ${name}. ${SETTINGS_HINT}.`);
    }
    return v;
  },

  /**
   * A user-supplied SECRET set in the settings panel.
   *
   * Deliberately no `fallback` parameter: a secret with a default is
   * self-contradictory — falling back to a fake key would only turn "no key
   * configured" into "the third party returned 401", moving the failure as
   * far from its cause as possible.
   */
  secret(name: string): string {
    const v = userVar(name);
    if (!v) {
      throw new Error(`Missing secret: ${name}. ${SETTINGS_HINT}.`);
    }
    return v;
  },
};
