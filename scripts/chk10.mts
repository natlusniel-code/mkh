import "dotenv/config";
import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await p.query(`select o.order_number, u.email from orders o join users u on u.id=o.user_id order by o.created_at desc limit 6`);
console.log(JSON.stringify(r.rows));
await p.end();
