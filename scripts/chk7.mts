import "dotenv/config";
import { listProducts, getCartLines, listUsersAdmin } from "../server/db";
const p = await listProducts({ pageSize: 3 });
console.log("product images:", JSON.stringify(p.items.map(i => ({ n: i.name, img: i.image }))));
const u = await listUsersAdmin({ pageSize: 3 });
console.log("users:", JSON.stringify(u.items.map(i => ({ e: i.email, oc: i.orderCount, ts: i.totalSpent }))));
process.exit(0);
