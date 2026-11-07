const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r3 = await c.query(`select count(*)::int total, count(*) filter (where url like '%unsplash%')::int unsplash from product_images`);
  const r2 = await c.query(`select p.name, count(pi.id)::int imgs from products p join product_images pi on pi.product_id=p.id group by p.id,p.name having count(pi.id) < 2 limit 5`);
  const r4 = await c.query(`select count(distinct p.id)::int with_real from products p join product_images pi on pi.product_id=p.id where pi.url not like '%unsplash%'`);
  console.log("images:", r3.rows[0].total, "| unsplash:", r3.rows[0].unsplash, "| products with <2 imgs:", r2.rowCount, "| products with real images:", r4.rows[0].with_real);
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
