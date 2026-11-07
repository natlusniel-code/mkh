import "dotenv/config";
import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const o = await p.query("select order_number, payment_status from orders order by created_at desc limit 5");
console.log(JSON.stringify(o.rows));
await p.end();
