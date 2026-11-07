import "dotenv/config";
import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const a = await p.query("select count(*)::int c from categories");
const b = await p.query("select id,bank_name,account_name,account_number from payment_settings");
const c = await p.query("select count(*)::int c from products");
console.log("categories:", a.rows[0].c, "products:", c.rows[0].c);
console.log(b.rows);
await p.end();
