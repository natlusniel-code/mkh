import "dotenv/config";
// Vercel serverless entry point — API ONLY.
//
// Routing lives in vercel.json: `/api/*`, `/trpc/*` and `/app-storage/*` are
// rewritten to this function, and EVERYTHING ELSE is served from the static
// build (`dist/public`) with an index.html fallback.
//
// That split is deliberate. The SPA is a static asset, so a deep link such as
// `/admin`, `/cart` or `/products/<slug>` must NOT depend on this function being
// alive. When the function was the catch-all, one missing environment variable
// turned every hard refresh into Vercel's `500 FUNCTION_INVOCATION_FAILED` page
// — while `/` still worked, because Vercel serves a matching static file before
// invoking the function. That asymmetry (home fine, every inner URL dead) is the
// signature of this bug.
//
// The function itself is now import-safe: `_core/env.ts` reads nothing at module
// load and `_core/db.ts` builds its driver on first use, so a missing variable
// can no longer kill the process before a route exists.
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { serveAppStorage } from "./_core/storage";
import { getJob } from "./_core/jobs";
import { healthHandler } from "./_core/health";

const app = new Hono();

// Liveness + configuration report. Always JSON — reports missing env var NAMES.
app.get("/api/health", healthHandler);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => createContext(c),
  }),
);

// Scoped per-app file storage: 307 -> short-lived signed S3 URL.
app.all("/app-storage/*", (c) => serveAppStorage(c));

// Platform-signed scheduled-job callback.
app.post("/api/_jobs/:name", async (c) => {
  const signature = c.req.header("x-platform-signature");
  if (!signature) {
    return c.text("unauthorized (job callback signature required)", 401);
  }
  const handler = getJob(c.req.param("name"));
  if (!handler) return c.text("no such job", 404);
  try {
    await handler();
    return c.json({ ok: true });
  } catch (err) {
    console.error(`[jobs] "${c.req.param("name")}" failed`, err);
    return c.text("job failed", 500);
  }
});

// Anything else that reaches the function is an unknown API path. Answer JSON,
// not HTML: a client that parses the body then gets a real message instead of a
// parse error.
app.all("*", (c) => c.json({ ok: false, error: "Not found" }, 404));

export default handle(app);
