import "dotenv/config";
import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await p.query("select id, name, slug, sort_order from categories order by sort_order");
console.log(JSON.stringify(r.rows, null, 1));
await p.end();
