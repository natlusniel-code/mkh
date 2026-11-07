import "dotenv/config";
import { sql, eq } from "drizzle-orm";
import { db } from "../server/_core/db";
import { categories, products } from "../drizzle/schema";

// A: cardCols-style (works in listProducts)
const a = db.select({ id: products.id, image: sql<string|null>`(select pi.url from product_images pi where pi.product_id = ${products.id} order by pi.sort_order asc limit 1)` }).from(products).limit(1);
console.log("A:", a.toSQL().sql.replace(/\s+/g," "));

// B: join + group by
const b = db.select({ id: categories.id, n: sql<number>`count(${products.id})::int` }).from(categories).leftJoin(products, eq(products.categoryId, categories.id)).groupBy(categories.id);
console.log("B:", b.toSQL().sql.replace(/\s+/g," "));
const br = await b;
console.log("B rows:", JSON.stringify(br.slice(0,3)));
process.exit(0);
