/**
 * Self-host the reachable product images (change 1, hardening pass).
 *
 * Hotlinking third-party product photos is fragile: many hosts 404 or block
 * hotlinking, which is what produced the broken-image placeholders on the
 * storefront. This script downloads every image that actually resolves, PUTs
 * it to the app's own platform storage, commits it, and rewrites
 * `product_images.url` to the stable `/app-storage/<key>` path.
 *
 * Images that do not resolve are left alone here; `fix-broken-images.mts`
 * then repoints those products at a working image from the same category.
 */
import "dotenv/config";
import pg from "pg";
import { storagePutUrl, storageCommit } from "../server/_core/storage.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

function extFor(contentType: string, url: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("avif")) return "avif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const m = url.split("?")[0].match(/\.(png|jpe?g|webp|gif|avif)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function fetchImage(url: string): Promise<{ buf: Buffer; ct: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "image/*,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1500) return null; // placeholder / error page
    return { buf, ct };
  } catch {
    return null;
  }
}

const { rows } = await pool.query<{ url: string; n: string }>(
  "select url, count(*)::text as n from product_images group by url order by url",
);
console.log(`distinct image urls: ${rows.length}`);

let ok = 0;
let failed = 0;
let i = 0;

// Modest concurrency: 1 CPU / 2 GB sandbox.
const CONCURRENCY = 6;
const queue = [...rows];

async function worker() {
  for (;;) {
    const row = queue.shift();
    if (!row) return;
    i += 1;
    const got = await fetchImage(row.url);
    if (!got) {
      failed += 1;
      continue;
    }
    try {
      const ext = extFor(got.ct, row.url);
      const key = `products/${String(i).padStart(4, "0")}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const { uploadUrl, publicPath } = await storagePutUrl(key, got.ct);
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": got.ct },
        body: got.buf,
      });
      if (!put.ok) {
        failed += 1;
        continue;
      }
      await storageCommit(key, { name: key.split("/").pop() });
      await pool.query("update product_images set url = $1 where url = $2", [publicPath, row.url]);
      ok += 1;
      if (ok % 25 === 0) console.log(`  hosted ${ok}…`);
    } catch (e) {
      failed += 1;
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`hosted=${ok} failed=${failed}`);
await pool.end();
