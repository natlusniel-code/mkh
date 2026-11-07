import "dotenv/config";
// Vercel serverless entry point.
//
// The app is a single Hono process (tRPC API + scoped storage proxy + job
// callbacks + the built SPA). On Vercel the same Hono app is exported as a
// serverless function via Hono's official Vercel adapter, so the deployed URL
// serves the SITE itself — not a repository listing.
//
// `vercel.json` rewrites every path to this function, and the function serves
// the built SPA from `dist/public` (produced by `pnpm build:web`).
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { trpcServer } from "@hono/trpc-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { serveAppStorage } from "./_core/storage";
import { getJob } from "./_core/jobs";

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true }));

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

// Serve the built SPA (vite build -> dist/public) with an index.html fallback
// so client-side routes deep-link correctly.
const PUBLIC_DIR = "dist/public";
app.use("/*", serveStatic({ root: `./${PUBLIC_DIR}` }));
app.get("*", async (c) => {
  try {
    const html = await readFile(path.resolve(PUBLIC_DIR, "index.html"), "utf-8");
    return c.html(html);
  } catch {
    return c.text("MarketHub: client build not found. Run `pnpm build:web`.", 500);
  }
});

export default handle(app);
