// Vercel serverless function entry.
//
// Vercel looks for functions under `api/`. This re-exports the Hono app built
// in `server/vercel.ts`, so every request (rewritten by vercel.json) is served
// by the app itself — the tRPC API, the storage proxy, and the built SPA.
export { default } from "../server/vercel";
