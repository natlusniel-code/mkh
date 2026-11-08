import type { Context } from "hono";
import { env } from "./env";

/**
 * Liveness + configuration report.
 *
 * This endpoint exists because of a real outage: the Vercel function died during
 * import on every request (one unset variable, read at module top level), so the
 * only thing a caller could see was Vercel's plain-text
 * `500 FUNCTION_INVOCATION_FAILED` — which the browser then reported as
 * `Unexpected token 'A', "A server e"... is not valid JSON`. Nothing said WHICH
 * variable was missing.
 *
 * So: always JSON, never a bare 500, and when the deployment is misconfigured it
 * names the missing variables. NAMES ONLY — never values. This route is
 * unauthenticated, so it must stay safe to expose: a variable name is not a
 * secret, and knowing it is the difference between a one-minute fix and an hour
 * of guessing.
 *
 * 200 = configured. 503 = a required platform variable is unset.
 */
export function healthHandler(c: Context) {
  const missing = env.missingRequired();
  const ok = missing.length === 0;
  return c.json(
    {
      ok,
      service: "markethub",
      dbDriver: env.dbDriver,
      missingEnv: missing,
      ...(ok
        ? {}
        : {
            hint:
              "Set these in your host's environment variables (Vercel → Settings → Environment Variables, for Production AND Preview) and redeploy.",
          }),
    },
    ok ? 200 : 503,
  );
}
