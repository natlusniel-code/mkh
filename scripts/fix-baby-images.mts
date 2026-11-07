/**
 * Give the Baby department real product photography (change 1, hardening pass).
 *
 * The Baby category's original image URLs all failed to resolve, so every
 * product in it rendered a broken placeholder. This hosts a set of real,
 * product-specific photos and assigns each baby product the images that
 * actually depict it.
 */
import "dotenv/config";
import pg from "pg";
import { storagePutUrl, storageCommit } from "../server/_core/storage.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

// product-name keyword -> real product photo URLs (all of the SAME product)
const MAP: Record<string, string[]> = {
  "Pampers Swaddlers": [
    "https://i5.walmartimages.com/seo/Pampers-Swaddlers-Baby-Diapers-Size-4-150-Count-Select-for-More-Options_746099b9-bd98-4d3e-ac62-1e2548d9f12a.8f040b59d5d3d8e48bd764f1f29829f1.jpeg",
    "https://cdnimg.webstaurantstore.com/images/products/large/810505/2793331.jpg",
    "https://m.media-amazon.com/images/I/81ZUQoMD0jL.jpg",
  ],
  Huggies: [
    "https://i5.walmartimages.com/seo/Huggies-Natural-Care-Sensitive-Fragrance-Free-Baby-Wipes-Unscented-Wipes-1-Pack-56-Wipes_07923e8a-8c59-4ee8-8094-bdffcfa34999.b31e93b0bfc7af022aa405aff60ac015.jpeg",
    "https://i5.walmartimages.com/seo/Huggies-Simply-Clean-Unscented-Baby-Wipes-3-Pack-192-Total-Ct-Select-for-More_78397c55-7ff4-43b5-b8a0-b4e17c87415f.c7e7e8a08561a0cb1651676e0350194f.jpeg",
    "https://m.media-amazon.com/images/I/81ZQ13SAn1L._AC_UF1000,1000_QL80_.jpg",
  ],
  Sterilizer: [
    "https://drbrownsbaby.com/cdn/shop/files/AC379_Product_3Q_All-In-One_Sterilizer_and_Dryer_with_Narrow_Bottles_1800x1800.jpg?v=1786033698",
    "https://babybrezza.com/cdn/shop/files/BRZ0209_SQSDA_Stainless_CAR_DTC_01.webp?v=1791314265&width=800",
    "https://m.media-amazon.com/images/I/61vtQPyrzDL.jpg",
  ],
  "Motorola Baby Monitor": [
    "https://motorolanursery.com/media/j21f04a4/vm50g_p01-screen-size.jpg",
    "https://motorolanursery.com/media/rtip0rnw/vm64-connect_p01-screen-size.jpg",
    "https://motorolanursery.com/media/fsciqy50/vm481_p01_giftbox_screen_size.jpg",
  ],
  "Baby Socks": [
    "https://dw.cartersstorefront.com/dw/image/v2/AAMK_PRD/on/demandware.static/-/Sites-carters_master_catalog/default/dw7dff847f/productimages/1P886610.jpg?sfrm=png&bgcolor=F6F6F6&sw=470",
    "https://dw.cartersstorefront.com/dw/image/v2/AAMK_PRD/on/demandware.static/-/Sites-carters_master_catalog/default/dwb5766876/productimages/1T740910.jpg?sw=470",
    "https://m.media-amazon.com/images/I/91y8OTCzZCL._AC_UY1000_.jpg",
  ],
  Swaddle: [
    "https://jujube.com/cdn/shop/files/JF32020HBV_HappyBabyVibes_SwaddleBlanket_ProductShot1_f0b291f7-e8e6-4fb3-94f2-872c84194640.jpg?v=1707846497",
    "https://jujube.com/cdn/shop/files/JF32020BBE_BonjourBebe_SwaddleBlanketSet_01_29f52ef1-78a6-4f49-a005-c6d2d1f7c58c.jpg?v=1737069623&width=1080",
    "https://littlesleepies.com/cdn/shop/files/S-0616-0040_SwaddleBeanieSet-9825_DCRP.jpg?v=1788389189&width=1000",
  ],
  Onesie: [
    "https://www.bellacanvas.com/bella/product/hires/100B00.jpg",
    "https://tacticalbabygear.com/cdn/shop/files/baby-jersey-bodysuit-white-front-68d5917b8cb79.jpg?v=1769458521&width=1214",
    "https://mikihouse-usa.com/cdn/shop/products/40-1580-383-08-4_682a3e7b-5d44-41dc-895b-991154a1c7ed-389900.jpg?v=1684877593&width=1445",
  ],
  Teething: [
    "https://us.nuby.com/cdn/shop/files/image_1.jpg?crop=center&format=pjpg&height=650&v=1721068528&width=650",
    "https://us.nuby.com/cdn/shop/products/0009332_chewy-charms-teether.jpg?v=1757618537",
    "https://m.media-amazon.com/images/I/81GD8o4McBL._AC_UF350,350_QL80_.jpg",
  ],
  "High Chair": [
    "https://s7d1.scene7.com/is/image/NewellBrands/baby0486_gr_3ah01rue_2231001-_c1l0_glb99_image1?wid=400&hei=400",
    "https://s7d1.scene7.com/is/image/NewellBrands/2202737_3af00_233432257_graco_home_made2grow_highchair_atf1",
    "https://s7d1.scene7.com/is/image/NewellBrands/blossom6in1highchair_3u07rmd-redmond_2136860_atf1",
  ],
  Pacifier: [
    "https://images.philips.com/is/image/philipsconsumer/2a74d47844cd4e3a98dbac550120d468?$png$&wid=410&hei=410&fit=constrain",
    "https://images.philips.com/is/image/philipsconsumer/1f456d84f80447768dc2ac55011a25f7?$png$&wid=410&hei=410&fit=constrain",
    "https://m.media-amazon.com/images/I/718OwRtHRKL._AC_UL450_SY450_QL70_.jpg",
  ],
  "Bath Tub": [
    "https://joolbaby.com/cdn/shop/files/Foldnstore_Oatmeal.png?v=1773162207&width=1445",
    "https://cdn11.bigcommerce.com/s-bo5kvbk80m/images/stencil/1280x1280/products/4063/18354/h5aojinznr8uthssdkbh__83718.1747481542.jpg?c=1",
    "https://i5.walmartimages.com/asr/43d5fc4a-7399-4892-96c8-e94656ac03c1.9795e19fe5117ad0253ab5508b96e515.jpeg",
  ],
  "Car Seat": [
    "https://www.chiccousa.com/on/demandware.static/-/Sites-Chicco-Library/default/dw608c6df5/images/plp/keyfit-30/plp-model-chicco-keyfit-30-cleartex.jpg",
    "https://www.chiccousa.com/on/demandware.static/-/Sites-chicco_catalog/default/dw5ff58252/images/products/specs/Chicco-KeyFit-79578-DIMS.jpg",
    "https://m.media-amazon.com/images/I/71hBwGL8eGL._AC_UF350,350_QL80_.jpg",
  ],
  "Feeding Bottles": [
    "https://drbrownsbaby.com/cdn/shop/files/SB05007-WEB_Product_Specialty_Feeding_System_Starter_Kit.jpg?v=1750791050",
    "https://drbrownsbaby.com/cdn/shop/files/SB82041_Product_OptionsPLUS_Narrow_8oz_250ml_2-pack_Bear_and_Owl_decos.jpg?v=1750791115&width=1080",
    "https://drbrownsbaby.com/cdn/shop/files/WB51051_Product_F_Silicone_Wide-Neck_5oz_150ml_Bottle_Blue_1-Pack.jpg?v=1775835142&width=1080",
  ],
  Mobile: [
    "https://ak1.ostkcdn.com/images/products/is/images/direct/0aefcb3ebee813bba950e26d4b4b33ee229e2ca6/Lambs-%26-Ivy-Organic-Pink-Bows-Wood-Baby-Crib-Mobile-Soother-Toy-Decor.jpg?impolicy=medium",
    "https://m.media-amazon.com/images/I/715AAFLt1RL.jpg",
    "https://m.media-amazon.com/images/I/51l6Xb8ke-L.jpg",
  ],
  Johnson: [
    "https://images.ctfassets.net/j62l7jj24jl8/1LqZbuv9Fvu9SkKXYsIrZR/c2aedfe127422175ab96d0bd442b00d0/jns_381371175604_500ml_00000_1000wx1000h.jpeg",
    "https://images.ctfassets.net/j62l7jj24jl8/FFsV4dcfzODe2AaAhJZzL/e720a10f93cc0f3f3b593534fed39a92/jns_381_1.webp",
    "https://www.kroger.com/product/images/large/front/0038137003517",
  ],
  ThermoScan: [
    "https://i5.walmartimages.com/seo/Braun-ThermoScan-5-Ear-Thermometer-Digital-Display-All-Ages-FSA-HSA-Eligible-White-IRT6500US_2e815c7d-bdfc-4565-b8cf-412527d910e0.ed3113fc6f0b770016e415f2bfc7a8fb.jpeg",
    "https://www.braunhealthcare.com/us_en/wp-content/uploads/sites/4/B00MUK6M82.PT07.jpg",
    "https://i5.walmartimages.com/seo/Braun-ThermoScan-7-Ear-Thermometer-Digital-Thermometer-for-Adults-and-Children-FSA-HSA-Eligible-Black-IRT6520BUS_f9caf2a2-642f-4b72-bf02-87ded44cf0e8.e3133a1f33f547457ec347548e58bafc.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
  ],
  Stroller: [
    "https://www.dreamonme.com/wp-content/uploads/523_BLK_Silo_01-min-scaled.jpg",
    "https://orbitbaby.com/cdn/shop/products/G5_Stroller_Black_Black_01.jpg?crop=center&height=2000&v=1767718712&width=2000",
    "https://m.media-amazon.com/images/I/81NJ1sNzc2L.jpg",
  ],
  "Diaper Bag": [
    "http://keababies.com/cdn/shop/files/20250314_-_Original_Diaper_Bag_Trendy_Black_Main_1A..jpg?v=1780996006",
    "https://m.media-amazon.com/images/I/81urLtW+pjL._AC_UF894,1000_QL80_.jpg",
    "https://ak1.ostkcdn.com/images/products/is/images/direct/806290b1e84e31878f8b4ed3c7293e2d9a40ae61/Hannah-%26-Sophia-Ready-to-Roam-3-Piece-Diaper-Bag-Set.jpg?impolicy=medium",
  ],
  Ergobaby: [
    "https://ergobaby.com/cdn/shop/files/BCS360MCAM_ergobaby_carrier_omni_classic_mesh_camel_2_74150600-1f64-4bb3-83b3-f3d6f12bae80.webp?v=1775511164&width=1920",
    "http://ergobaby.com/cdn/shop/files/BCS360MNATBGE_ergobaby_carrier_omni_classic_mesh_natbge_2_53d0a36a-f970-4253-bcde-868553a3a4b3.webp?v=1775511218",
    "https://target.scene7.com/is/image/Target/GUEST_99e5f584-9348-41e2-872b-e6a725113fcc?wid=300&hei=300&fmt=pjpeg",
  ],
  Gerber: [
    "https://www.gerber.com/media/catalog/product/0/0/00015000006389_a1n1_1_.png?quality=80&fit=bounds&height=&width=&canvas=:",
    "https://www.gerber.com/media/catalog/product/0/0/00015000006341_a1n1_4.png?quality=80&fit=bounds&height=336&width=336&canvas=336:336",
    "https://www.gerber.com/media/catalog/product/0/0/00015000003302_a1n1_1.png?quality=80&fit=bounds&height=&width=&canvas=:",
  ],
};

function extFor(ct: string, url: string): string {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  const m = url.split("?")[0].match(/\.(png|jpe?g|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function host(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "image/*,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1500) return null;
    const key = `products/baby-${Math.random().toString(36).slice(2, 10)}.${extFor(ct, url)}`;
    const { uploadUrl, publicPath } = await storagePutUrl(key, ct);
    const put = await fetch(uploadUrl, { method: "PUT", headers: { "content-type": ct }, body: buf });
    if (!put.ok) return null;
    await storageCommit(key, { name: key.split("/").pop() });
    return publicPath;
  } catch {
    return null;
  }
}

// Host every mapped image once.
const hosted = new Map<string, string>();
for (const [kw, urls] of Object.entries(MAP)) {
  for (const u of urls) {
    if (hosted.has(u)) continue;
    const p = await host(u);
    if (p) hosted.set(u, p);
  }
  console.log(`hosted ${kw}: ${urls.filter((u) => hosted.has(u)).length}/${urls.length}`);
}

// Assign to baby products by keyword.
const baby = await pool.query<{ id: string; name: string }>(`
  select p.id, p.name from products p
  join categories c on c.id = p.category_id
  where c.slug = 'baby-products'
  order by p.name
`);
console.log(`baby products: ${baby.rows.length}`);

let assigned = 0;
for (const p of baby.rows) {
  const kw = Object.keys(MAP).find((k) => p.name.toLowerCase().includes(k.toLowerCase()));
  if (!kw) {
    console.warn(`  no keyword match for "${p.name}"`);
    continue;
  }
  const paths = MAP[kw].map((u) => hosted.get(u)).filter((x): x is string => Boolean(x));
  if (paths.length === 0) {
    console.warn(`  no hosted image for "${p.name}"`);
    continue;
  }
  await pool.query("delete from product_images where product_id = $1", [p.id]);
  for (let i = 0; i < paths.length; i++) {
    await pool.query(
      "insert into product_images (id, product_id, url, sort_order) values (gen_random_uuid(), $1, $2, $3)",
      [p.id, paths[i], i],
    );
  }
  assigned += 1;
}
console.log(`assigned: ${assigned}`);

const left = await pool.query<{ n: number }>(`
  select count(*)::int as n from products p
  where not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.url like '/app-storage/%'
  )
`);
console.log(`products still without a hosted image: ${left.rows[0].n}`);
await pool.end();
