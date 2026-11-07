import "dotenv/config";
import { listCategoriesWithCounts, listProducts } from "../server/db";
const cats = await listCategoriesWithCounts();
console.log("cats:", JSON.stringify(cats.slice(0,3)));
const prods = await listProducts({ pageSize: 3 });
console.log("products total:", prods.total, "items:", prods.items.length);
process.exit(0);
