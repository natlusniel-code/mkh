import "dotenv/config";
import { salesSeries, recentActivity, dashboardStats } from "../server/db";
const s = await salesSeries(14);
console.log("series:", JSON.stringify(s));
const a = await recentActivity(10);
console.log("activity count:", a.length, JSON.stringify(a.slice(0,2)));
const d = await dashboardStats();
console.log("stats:", JSON.stringify(d));
process.exit(0);
