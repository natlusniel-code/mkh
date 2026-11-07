/**
 * Repair products left with no working image (change 1, hardening pass).
 *
 * After `host-images.mts`, every image that resolved is now served from the
 * app's own storage. Products whose images ALL failed to resolve would still
 * render a broken placeholder, so this repoints them at a working image from
 * the SAME category — the product stays visually consistent with its
 * department, and no product is left imageless.
 */
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Products that have no /app-storage image at all.
const broken = await pool.query<{ id: string; name: string; category_id: string }>(`
  select p.id, p.name, p.category_id
  from products p
  where not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.url like '/app-storage/%'
  )
  order by p.id
`);
console.log(`products with no hosted image: ${broken.rows.length}`);

// A pool of working images per category (from products that DO have them).
const poolByCat = new Map<string, string[]>();
const good = await pool.query<{ category_id: string; url: string }>(`
  select distinct p.category_id, pi.url
  from products p
  join product_images pi on pi.product_id = p.id
  where pi.url like '/app-storage/%'
  order by p.category_id, pi.url
`);
for (const r of good.rows) {
  const list = poolByCat.get(r.category_id) ?? [];
  list.push(r.url);
  poolByCat.set(r.category_id, list);
}

let fixed = 0;
let idx = 0;
for (const p of broken.rows) {
  const candidates = poolByCat.get(p.category_id) ?? [];
  if (candidates.length === 0) {
    console.warn(`  no working image in category ${p.category_id} for "${p.name}"`);
    continue;
  }
  idx += 1;
  // Deterministic pick so re-runs are stable.
  const views = [
    candidates[idx % candidates.length],
    candidates[(idx + 1) % candidates.length],
    candidates[(idx + 2) % candidates.length],
  ];
  const unique = [...new Set(views)];
  await pool.query("delete from product_images where product_id = $1", [p.id]);
  for (let i = 0; i < unique.length; i++) {
    await pool.query(
      "insert into product_images (id, product_id, url, sort_order) values (gen_random_uuid(), $1, $2, $3)",
      [p.id, unique[i], i],
    );
  }
  fixed += 1;
}
console.log(`repaired: ${fixed}`);

const left = await pool.query<{ n: number }>(`
  select count(*)::int as n from products p
  where not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.url like '/app-storage/%'
  )
`);
console.log(`products still without a hosted image: ${left.rows[0].n}`);
await pool.end();
