import "dotenv/config";
import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const q = `select c.id, c.name, (select count(*)::int from products p where p.category_id = c.id and p.status = 'active') as productCount from categories c order by c.sort_order limit 3`;
const r = await p.query(q);
console.log("raw:", JSON.stringify(r.rows));
// now the drizzle-rendered form
const q2 = `select "categories"."id", (select count(*)::int from products p where p.category_id = "categories"."id" and p.status = 'active') as "productCount" from "categories" order by "categories"."sort_order" limit 3`;
const r2 = await p.query(q2);
console.log("drizzle-form:", JSON.stringify(r2.rows));
await p.end();
