import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../server/_core/db";
import { categories, products } from "../drizzle/schema";
const q = db
  .select({
    id: categories.id,
    productCount: sql<number>`(
      select count(*)::int from products p
      where p.category_id = ${categories.id} and p.status = 'active'
    )`,
  })
  .from(categories);
console.log("SQL:", q.toSQL().sql);
console.log("PARAMS:", JSON.stringify(q.toSQL().params));
const rows = await q;
console.log("rows:", JSON.stringify(rows.slice(0,3)));
process.exit(0);
