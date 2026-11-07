import "dotenv/config";
import pg from "pg";
import { hashSync } from "bcryptjs";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const hash = hashSync("admin12345", 10);
const r = await p.query(
  `insert into users (email, password_hash, name, role) values ($1,$2,$3,'admin')
   on conflict (email) do update set password_hash=excluded.password_hash, role='admin', name=excluded.name
   returning id, email, role`,
  ["admin@markethub.test", hash, "MarketHub Admin"],
);
console.log("admin:", JSON.stringify(r.rows));
await p.end();
