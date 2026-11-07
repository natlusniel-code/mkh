/**
 * MarketHub catalogue seed — 200 products across the 10 categories.
 *
 * Idempotent: re-running replaces the seeded catalogue (products, their images,
 * variants and reviews) without touching orders, users or payment settings.
 *
 *   npx tsx scripts/seed.mts
 */
import "dotenv/config";
import pg from "pg";
import { hashSync } from "bcryptjs";
import { formatNaira } from "../shared/markethub";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// ── deterministic RNG (mulberry32) so every run produces the same catalogue ──
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261107);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const chance = (p: number) => rand() < p;

// ── image pools (all verified hotlinkable, HTTP 200) ─────────────────────────
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

const IMG: Record<string, string[]> = {
  electronics: [
    "1505740420928-5e560c06d30e",
    "1523275335684-37898b6baf30",
    "1546868871-7041f2a55e12",
    "1572569511254-d8f925fe2cbb",
    "1585790050230-5dd28404ccb9",
    "1526170375885-4d8ecf77b99f",
    "1502920917128-1aa500764cbd",
    "1518770660439-4636190af475",
    "1550009158-9ebf69173e03",
    "1519389950473-47ba0277781c",
  ],
  "phones-accessories": [
    "1592899677977-9c10ca588bbd",
    "1512499617640-c74ae3a79d37",
    "1580910051074-3eb694886505",
    "1601784551446-20c9e07cdbdb",
    "1585060544812-6b45742d762f",
    "1517336714731-489689fd1ca8",
    "1498050108023-c5249f4df085",
    "1461749280684-dccba630e2f6",
    "1555949963-aa79dcee981c",
    "1496181133206-80ce9b88a853",
  ],
  "computers-accessories": [
    "1517336714731-489689fd1ca8",
    "1498050108023-c5249f4df085",
    "1461749280684-dccba630e2f6",
    "1555949963-aa79dcee981c",
    "1518770660439-4636190af475",
    "1550009158-9ebf69173e03",
    "1496181133206-80ce9b88a853",
    "1519389950473-47ba0277781c",
    "1526170375885-4d8ecf77b99f",
    "1502920917128-1aa500764cbd",
  ],
  fashion: [
    "1503602642458-232111445657",
    "1525966222134-fcfa99b8ae77",
    "1549298916-b41d501d3772",
    "1460353581641-37baddab0fa2",
    "1606107557195-0e29a4b5b4aa",
    "1595341888016-a392ef81b7de",
    "1548036328-c9fa89d128fa",
    "1590874103328-eac38a683ce7",
    "1584917865442-de89df76afd3",
    "1553062407-98eeb64c6a62",
    "1491637639811-60e2756cc1c7",
    "1521572163474-6864f9cf17ab",
    "1503341504253-dff4815485f1",
    "1490481651871-ab68de25d43d",
    "1483985988355-763728e1935b",
    "1445205170230-053b83016050",
    "1487222477894-8943e31ef7b2",
    "1479064555552-3ef4979f8908",
    "1434389677669-e08b4cac3105",
    "1523381210434-271e8be1f52b",
  ],
  "shoes-bags": [
    "1560343090-f0409e92791a",
    "1542291026-7eec264c27ff",
    "1585386959984-a4155224a1ad",
    "1600185365483-26d7a4cc7519",
    "1595950653106-6c9ebd614d3a",
    "1608231387042-66d1773070a5",
    "1496747611176-843222e1e57c",
    "1515886657613-9f3515b0c78f",
    "1539109136881-3be0616acf4b",
    "1596462502278-27bfdc403348",
    "1522335789203-aabd1fc54bc9",
    "1570172619644-dfd03ed5d881",
    "1512496015851-a90fb38ba796",
    "1620916566398-39f1143ab7be",
    "1631730359585-38a4935cbec4",
    "1612817288484-6f916006741a",
    "1598440947619-2c35fc9aa908",
    "1608248543803-ba4f8c70ae0b",
    "1541643600914-78b084683601",
    "1571781926291-c477ebfd024b",
  ],
  "beauty-personal-care": [
    "1556228578-8c89e6adf883",
    "1583947215259-38e31be8751f",
    "1556228720-195a672e8a03",
    "1541643600914-78b084683601",
    "1571781926291-c477ebfd024b",
    "1596462502278-27bfdc403348",
    "1522335789203-aabd1fc54bc9",
    "1570172619644-dfd03ed5d881",
    "1512496015851-a90fb38ba796",
    "1620916566398-39f1143ab7be",
    "1631730359585-38a4935cbec4",
    "1612817288484-6f916006741a",
    "1598440947619-2c35fc9aa908",
    "1608248543803-ba4f8c70ae0b",
    "1556228578-8c89e6adf883",
    "1583947215259-38e31be8751f",
    "1556228720-195a672e8a03",
    "1596462502278-27bfdc403348",
    "1522335789203-aabd1fc54bc9",
    "1570172619644-dfd03ed5d881",
  ],
  "home-kitchen": [
    "1556909212-d5b604d0c90d",
    "1584622650111-993a426fbf0a",
    "1556909114-f6e7ad7d3136",
    "1556911220-bff31c812dba",
    "1600585154340-be6161a56a0c",
    "1583847268964-b28dc8f51f92",
    "1522708323590-d24dbb6b0267",
    "1493663284031-b7e3aefcae8e",
    "1567016432779-094069958ea5",
    "1584622781564-1d987f7333c1",
    "1616486338812-3dadae4b4ace",
    "1616627561950-9f746e330187",
    "1556909212-d5b604d0c90d",
    "1584622650111-993a426fbf0a",
    "1556909114-f6e7ad7d3136",
    "1556911220-bff31c812dba",
    "1600585154340-be6161a56a0c",
    "1583847268964-b28dc8f51f92",
    "1522708323590-d24dbb6b0267",
    "1493663284031-b7e3aefcae8e",
  ],
  groceries: [
    "1542838132-92c53300491e",
    "1543168256-418811576931",
    "1550989460-0adf9ea622e2",
    "1607349913338-fca6f7fc42d0",
    "1584473457409-ae5c91d7d8b1",
    "1506617564039-2f3b650b7010",
    "1518843875459-f738682238a6",
    "1560806887-1e4cd0b6cbd6",
    "1583258292688-d0213dc5a3a8",
    "1542838132-92c53300491e",
    "1543168256-418811576931",
    "1550989460-0adf9ea622e2",
    "1607349913338-fca6f7fc42d0",
    "1584473457409-ae5c91d7d8b1",
    "1506617564039-2f3b650b7010",
    "1518843875459-f738682238a6",
    "1560806887-1e4cd0b6cbd6",
    "1583258292688-d0213dc5a3a8",
    "1542838132-92c53300491e",
    "1543168256-418811576931",
  ],
  "sports-fitness": [
    "1517836357463-d25dfeac3438",
    "1534438327276-14e5300c3a48",
    "1571019613454-1cb2f99b2d8b",
    "1583454110551-21f2fa2afe61",
    "1549060279-7e168fcee0c2",
    "1518611012118-696072aa579a",
    "1593079831268-3381b0db4a77",
    "1526506118085-60ce8714f8c5",
    "1461896836934-ffe607ba8211",
    "1552674605-db6ffd4facb5",
    "1517836357463-d25dfeac3438",
    "1534438327276-14e5300c3a48",
    "1571019613454-1cb2f99b2d8b",
    "1583454110551-21f2fa2afe61",
    "1549060279-7e168fcee0c2",
    "1518611012118-696072aa579a",
    "1593079831268-3381b0db4a77",
    "1526506118085-60ce8714f8c5",
    "1461896836934-ffe607ba8211",
    "1552674605-db6ffd4facb5",
  ],
  "baby-products": [
    "1515488042361-ee00e0ddd4e4",
    "1522771930-78848d9293e8",
    "1544126592-807ade215a0b",
    "1555252333-9f8e92e65df9",
    "1596461404969-9ae70f2830c1",
    "1607453998774-d533f65dac99",
    "1618842676088-c4d48a6a7c9d",
    "1515488042361-ee00e0ddd4e4",
    "1522771930-78848d9293e8",
    "1544126592-807ade215a0b",
    "1555252333-9f8e92e65df9",
    "1596461404969-9ae70f2830c1",
    "1607453998774-d533f65dac99",
    "1618842676088-c4d48a6a7c9d",
    "1515488042361-ee00e0ddd4e4",
    "1522771930-78848d9293e8",
    "1544126592-807ade215a0b",
    "1555252333-9f8e92e65df9",
    "1596461404969-9ae70f2830c1",
    "1607453998774-d533f65dac99",
  ],
};

// ── per-category catalogue definition ────────────────────────────────────────
type CatDef = {
  slug: string;
  nouns: string[];
  subcategories: string[];
  price: [number, number];
  variants?: "size" | "shoe" | "color";
};

const CATALOG: CatDef[] = [
  {
    slug: "electronics",
    nouns: [
      "4K Smart TV", "Bluetooth Speaker", "Wireless Headphones", "Soundbar", "DSLR Camera",
      "Action Camera", "Home Theatre System", "Noise-Cancelling Earbuds", "Smart Watch", "Power Bank",
      "LED Projector", "Gaming Console", "Camera Drone", "Streaming Stick", "Portable Radio",
      "Vinyl Turntable", "HD Webcam", "Ring Light", "Camera Tripod", "Condenser Microphone",
    ],
    subcategories: ["Audio", "Video", "Cameras", "Wearables", "Gaming"],
    price: [25000, 950000],
  },
  {
    slug: "phones-accessories",
    nouns: [
      "Smartphone", "Phone Case", "Fast Charger", "USB-C Cable", "Wireless Charger",
      "Phone Holder", "Screen Protector", "Power Bank", "Selfie Stick", "Bluetooth Headset",
      "Car Charger", "Phone Gimbal", "SIM Adapter", "OTG Cable", "Phone Tripod",
      "Battery Case", "Charging Dock", "Cable Organizer", "Phone Ring Grip", "Signal Booster",
    ],
    subcategories: ["Smartphones", "Chargers", "Cases", "Audio", "Accessories"],
    price: [3500, 850000],
    variants: "color",
  },
  {
    slug: "computers-accessories",
    nouns: [
      "Laptop", "Monitor", "Mechanical Keyboard", "Wireless Mouse", "External SSD",
      "USB Hub", "Laptop Stand", "Graphics Tablet", "HD Webcam", "Docking Station",
      "RAM Module", "Cooling Pad", "Laptop Sleeve", "HDMI Cable", "Laser Printer",
      "Wi-Fi Router", "Network Switch", "Surge Protector", "Desk Lamp", "Ergonomic Chair",
    ],
    subcategories: ["Laptops", "Monitors", "Peripherals", "Storage", "Networking"],
    price: [8000, 1200000],
  },
  {
    slug: "fashion",
    nouns: [
      "T-Shirt", "Denim Jacket", "Slim-Fit Jeans", "Hoodie", "Polo Shirt",
      "Maxi Dress", "Ankara Gown", "Chinos", "Blazer", "Cardigan",
      "Jumpsuit", "Pleated Skirt", "Chino Shorts", "Knit Sweater", "Trench Coat",
      "Tank Top", "Cargo Pants", "Kaftan", "Leggings", "Silk Scarf",
    ],
    subcategories: ["Men", "Women", "Unisex", "Traditional", "Outerwear"],
    price: [4500, 85000],
    variants: "size",
  },
  {
    slug: "shoes-bags",
    nouns: [
      "Running Shoes", "Leather Sneakers", "Ankle Boots", "Loafers", "Sandals",
      "Block Heels", "Backpack", "Tote Bag", "Crossbody Bag", "Laptop Bag",
      "Duffel Bag", "Clutch Purse", "Leather Wallet", "Belt Bag", "Travel Suitcase",
      "Slippers", "Oxford Shoes", "Espadrilles", "Messenger Bag", "Gym Bag",
    ],
    subcategories: ["Shoes", "Bags", "Luggage", "Wallets", "Accessories"],
    price: [6000, 120000],
    variants: "shoe",
  },
  {
    slug: "beauty-personal-care",
    nouns: [
      "Face Serum", "Moisturizer", "Sunscreen SPF50", "Body Lotion", "Shampoo",
      "Conditioner", "Hair Oil", "Beard Trimmer", "Electric Shaver", "Eau de Parfum",
      "Body Mist", "Lip Balm", "Clay Face Mask", "Facial Cleanser", "Toner",
      "Nail Care Kit", "Makeup Brush Set", "Hair Dryer", "Hair Straightener", "Bath Gift Set",
    ],
    subcategories: ["Skincare", "Haircare", "Fragrance", "Grooming", "Makeup"],
    price: [1500, 65000],
  },
  {
    slug: "home-kitchen",
    nouns: [
      "Non-Stick Cookware Set", "Blender", "Air Fryer", "Electric Kettle", "Microwave Oven",
      "Rice Cooker", "Dinner Set", "Bedding Set", "Throw Pillow", "Wall Clock",
      "Storage Baskets", "Vacuum Cleaner", "Standing Fan", "Water Dispenser", "Cutlery Set",
      "Coffee Maker", "Toaster", "Pressure Cooker", "Bath Towel Set", "Table Lamp",
    ],
    subcategories: ["Cookware", "Appliances", "Bedding", "Decor", "Storage"],
    price: [3500, 350000],
  },
  {
    slug: "groceries",
    nouns: [
      "Basmati Rice 5kg", "Vegetable Oil 5L", "Wheat Flour 2kg", "Granulated Sugar 1kg", "Tomato Paste",
      "Spaghetti Pack", "Breakfast Cereal", "Instant Noodles", "Ground Coffee", "Green Tea",
      "Bottled Water Pack", "Fruit Juice", "Peanut Butter", "Pure Honey Jar", "Canned Beans",
      "Semovita 2kg", "Dried Fish", "Seasoning Cubes", "Chocolate Bar", "Biscuit Pack",
    ],
    subcategories: ["Pantry", "Beverages", "Snacks", "Breakfast", "Cooking"],
    price: [800, 25000],
  },
  {
    slug: "sports-fitness",
    nouns: [
      "Yoga Mat", "Dumbbell Set", "Resistance Bands", "Skipping Rope", "Football",
      "Basketball", "Tennis Racket", "Cycling Helmet", "Running Shorts", "Sports Bra",
      "Gym Gloves", "Insulated Water Bottle", "Foam Roller", "Kettlebell", "Boxing Gloves",
      "Fitness Tracker", "Treadmill", "Exercise Bike", "Protein Shaker", "Ankle Weights",
    ],
    subcategories: ["Equipment", "Apparel", "Outdoor", "Recovery", "Accessories"],
    price: [2500, 450000],
  },
  {
    slug: "baby-products",
    nouns: [
      "Baby Diapers Pack", "Baby Wipes", "Feeding Bottle", "Baby Stroller", "Car Seat",
      "Baby Monitor", "Baby Bath Tub", "Onesie Set", "Baby Blanket", "Pacifier Set",
      "Baby Carrier", "High Chair", "Baby Lotion", "Baby Food Jar", "Teething Ring",
      "Nursery Mobile", "Diaper Bag", "Baby Socks", "Bottle Sterilizer", "Baby Thermometer",
    ],
    subcategories: ["Feeding", "Nursery", "Clothing", "Care", "Travel"],
    price: [1200, 180000],
  },
];

const ADJECTIVES = [
  "Premium", "Classic", "Deluxe", "Everyday", "Pro", "Ultra", "Compact", "Elegant", "Smart", "Essential",
  "Signature", "Advanced", "Portable", "Luxury", "Modern", "Durable", "Sleek", "Comfort", "Elite", "Value",
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const money = (n: number) => n.toFixed(2);

// ── build the 200-product payload ────────────────────────────────────────────
type ProductRow = {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  subcategory: string;
  price: string;
  discount_price: string | null;
  stock: number;
  status: string;
  featured: boolean;
  rating: string;
  rating_count: number;
  sold_count: number;
};

type ImageRow = { product_id: string; url: string; sort_order: number };
type VariantRow = { product_id: string; type: string; value: string; price_delta: string; stock: number };

const SIZE_VALUES = ["S", "M", "L", "XL"];
const SHOE_VALUES = ["38", "39", "40", "41", "42", "43"];
const COLOR_VALUES = ["Black", "White", "Blue"];

async function main() {
  const client = await pool.connect();
  try {
    const catRows = await client.query<{ id: string; slug: string }>("select id, slug from categories");
    const catId = new Map(catRows.rows.map((r) => [r.slug, r.id]));
    for (const c of CATALOG) {
      if (!catId.has(c.slug)) throw new Error(`Missing category: ${c.slug} — run migrations first.`);
    }

    // ── 1. clear the previous catalogue (cascades images/variants/reviews) ──
    // Orders/payments are cleared first so re-running does not stack demo orders.
    await client.query("delete from notifications");
    await client.query("delete from payments");
    await client.query("delete from orders");
    await client.query("delete from products");

    // ── 2. products ─────────────────────────────────────────────────────────
    const products: ProductRow[] = [];
    const usedSlugs = new Set<string>();

    for (const cat of CATALOG) {
      for (let i = 0; i < 20; i++) {
        const noun = cat.nouns[i];
        const adj = ADJECTIVES[(i * 7 + cat.slug.length) % ADJECTIVES.length];
        const name = `${adj} ${noun}`;
        let slug = slugify(name);
        let n = 2;
        while (usedSlugs.has(slug)) slug = `${slugify(name)}-${n++}`;
        usedSlugs.add(slug);

        const [lo, hi] = cat.price;
        // log-ish spread so cheap and expensive items both appear
        const price = Math.round((lo + (hi - lo) * Math.pow(rand(), 1.6)) / 50) * 50;
        const hasDiscount = chance(0.38);
        const discountPrice = hasDiscount ? Math.round((price * (0.6 + rand() * 0.25)) / 50) * 50 : null;

        const stock = chance(0.08) ? 0 : int(3, 140);
        const featured = chance(0.16);
        const soldCount = int(0, 320);

        const sub = cat.subcategories[i % cat.subcategories.length];
        const description =
          `${name} — a ${sub.toLowerCase()} pick from our ${cat.slug.replace(/-/g, " ")} range. ` +
          `Built for everyday use with dependable quality, backed by nationwide delivery and a 7-day return window. ` +
          `Ships from our Lagos warehouse; pay by bank transfer and our team verifies your payment.`;

        products.push({
          name,
          slug,
          description,
          category_id: catId.get(cat.slug)!,
          subcategory: sub,
          price: money(price),
          discount_price: discountPrice != null ? money(discountPrice) : null,
          stock,
          status: "active",
          featured,
          rating: "0",
          rating_count: 0,
          sold_count: soldCount,
        });
      }
    }

    const inserted = await client.query<{ id: string; slug: string }>(
      `insert into products
         (name, slug, description, category_id, subcategory, price, discount_price, stock, status, featured, rating, rating_count, sold_count)
       select x.name, x.slug, x.description, x.category_id::uuid, x.subcategory,
              x.price::numeric, x.discount_price::numeric, x.stock, x.status, x.featured,
              x.rating::numeric, x.rating_count, x.sold_count
       from jsonb_to_recordset($1::jsonb) as x(
         name text, slug text, description text, category_id text, subcategory text,
         price text, discount_price text, stock int, status text, featured boolean,
         rating text, rating_count int, sold_count int
       )
       returning id, slug`,
      [JSON.stringify(products)],
    );
    const idBySlug = new Map(inserted.rows.map((r) => [r.slug, r.id]));

    // ── 3. images + variants ────────────────────────────────────────────────
    const images: ImageRow[] = [];
    const variants: VariantRow[] = [];

    for (const cat of CATALOG) {
      const pool = IMG[cat.slug];
      for (let i = 0; i < 20; i++) {
        const noun = cat.nouns[i];
        const adj = ADJECTIVES[(i * 7 + cat.slug.length) % ADJECTIVES.length];
        const slug = slugify(`${adj} ${noun}`);
        const pid = idBySlug.get(slug);
        if (!pid) continue;

        const count = int(2, 4);
        const start = (i * 3) % pool.length;
        for (let k = 0; k < count; k++) {
          images.push({ product_id: pid, url: U(pool[(start + k) % pool.length]), sort_order: k });
        }

        if (cat.variants === "size") {
          for (const v of SIZE_VALUES) variants.push({ product_id: pid, type: "size", value: v, price_delta: "0", stock: int(2, 40) });
        } else if (cat.variants === "shoe") {
          for (const v of SHOE_VALUES) variants.push({ product_id: pid, type: "size", value: v, price_delta: "0", stock: int(2, 30) });
        } else if (cat.variants === "color") {
          for (const v of COLOR_VALUES) variants.push({ product_id: pid, type: "color", value: v, price_delta: "0", stock: int(2, 50) });
        }
      }
    }

    await client.query(
      `insert into product_images (product_id, url, sort_order)
       select x.product_id::uuid, x.url, x.sort_order
       from jsonb_to_recordset($1::jsonb) as x(product_id text, url text, sort_order int)`,
      [JSON.stringify(images)],
    );

    await client.query(
      `insert into product_variants (product_id, type, value, price_delta, stock)
       select x.product_id::uuid, x.type, x.value, x.price_delta::numeric, x.stock
       from jsonb_to_recordset($1::jsonb) as x(product_id text, type text, value text, price_delta text, stock int)`,
      [JSON.stringify(variants)],
    );

    // ── 4. demo reviewers (so ratings and reviews are real rows) ────────────
    const demoUsers = [
      { email: "ada.okafor@example.com", name: "Ada Okafor" },
      { email: "tunde.bello@example.com", name: "Tunde Bello" },
      { email: "chiamaka.eze@example.com", name: "Chiamaka Eze" },
      { email: "ibrahim.sule@example.com", name: "Ibrahim Sule" },
      { email: "grace.adeyemi@example.com", name: "Grace Adeyemi" },
      { email: "emeka.nwosu@example.com", name: "Emeka Nwosu" },
    ];
    const passwordHash = hashSync("password123", 10);
    const userRows = await client.query<{ id: string; email: string }>(
      `insert into users (email, password_hash, name, role)
       select x.email, $2, x.name, 'user'
       from jsonb_to_recordset($1::jsonb) as x(email text, name text)
       on conflict (email) do update set name = excluded.name
       returning id, email`,
      [JSON.stringify(demoUsers), passwordHash],
    );
    const userIds = userRows.rows.map((r) => r.id);

    // ── 5. reviews on ~45% of products ──────────────────────────────────────
    const REVIEW_TITLES = [
      "Exactly as described", "Great value for money", "Very happy with this", "Solid quality",
      "Would buy again", "Better than expected", "Fast delivery", "Good, but not perfect",
    ];
    const REVIEW_BODIES = [
      "Arrived quickly and works perfectly. Packaging was neat and the item matches the photos.",
      "Good quality for the price. I have used it daily for a few weeks with no issues.",
      "Does the job well. Delivery took a couple of days but the product is genuine.",
      "Impressed with the finish and build. Would recommend to anyone considering it.",
      "Decent product overall. Minor things I would change, but nothing serious.",
      "Second one I have bought. Consistent quality and the price is fair.",
    ];

    const reviews: { product_id: string; user_id: string; rating: number; title: string; body: string }[] = [];
    for (const p of inserted.rows) {
      if (!chance(0.45)) continue;
      const n = int(1, 3);
      const shuffled = [...userIds].sort(() => rand() - 0.5).slice(0, n);
      for (const uid of shuffled) {
        reviews.push({
          product_id: p.id,
          user_id: uid,
          rating: chance(0.75) ? int(4, 5) : int(3, 4),
          title: pick(REVIEW_TITLES),
          body: pick(REVIEW_BODIES),
        });
      }
    }

    if (reviews.length) {
      await client.query(
        `insert into reviews (product_id, user_id, rating, title, body)
         select x.product_id::uuid, x.user_id::uuid, x.rating, x.title, x.body
         from jsonb_to_recordset($1::jsonb) as x(product_id text, user_id text, rating int, title text, body text)
         on conflict (product_id, user_id) do nothing`,
        [JSON.stringify(reviews)],
      );
    }

    // ── 6. recompute aggregate ratings from the real review rows ────────────
    await client.query(
      `update products p
         set rating = r.avg, rating_count = r.n
       from (
         select product_id, round(avg(rating)::numeric, 2) as avg, count(*)::int as n
         from reviews group by product_id
       ) r
       where p.id = r.product_id`,
    );

    // ── 7. demo orders + payments (so the dashboard and admin queues are real) ─
    // Spread across the last 14 days so the revenue chart has a shape.
    const orderable = await client.query<{ id: string; name: string; price: string; discount_price: string | null; image: string | null }>(
      `select p.id, p.name, p.price, p.discount_price,
              (select pi.url from product_images pi where pi.product_id = p.id order by pi.sort_order asc limit 1) as image
       from products p where p.status = 'active' and p.stock > 0`,
    );
    const pool2 = orderable.rows;
    const buyers = userRows.rows;
    const STATUS_MIX: { status: string; payment: string }[] = [
      { status: "delivered", payment: "paid" },
      { status: "delivered", payment: "paid" },
      { status: "shipped", payment: "paid" },
      { status: "processing", payment: "paid" },
      { status: "paid", payment: "paid" },
      { status: "payment_verification", payment: "awaiting" },
      { status: "pending_payment", payment: "unpaid" },
      { status: "cancelled", payment: "rejected" },
    ];
    const STATES = ["Lagos", "FCT - Abuja", "Rivers", "Oyo", "Kano", "Enugu"];

    let orderSeq = 1000;
    const orderRows: {
      order_number: string; user_id: string; subtotal: string; delivery_fee: string; total: string;
      status: string; payment_status: string; address_snapshot: string; created_at: string;
      items: { product_id: string; name: string; image: string | null; unit_price: string; qty: number }[];
    }[] = [];

    for (let i = 0; i < 34; i++) {
      const buyer = buyers[i % buyers.length];
      const mix = STATUS_MIX[i % STATUS_MIX.length];
      const lineCount = int(1, 3);
      const items: typeof orderRows[number]["items"] = [];
      let subtotal = 0;
      const chosen = new Set<string>();
      for (let k = 0; k < lineCount; k++) {
        const p = pick(pool2);
        if (chosen.has(p.id)) continue;
        chosen.add(p.id);
        const unit = Number(p.discount_price ?? p.price);
        const qty = int(1, 3);
        subtotal += unit * qty;
        items.push({ product_id: p.id, name: p.name, image: p.image, unit_price: money(unit), qty });
      }
      if (!items.length) continue;
      const fee = subtotal >= 100000 ? 0 : 2500;
      const daysAgo = int(0, 13);
      const created = new Date(Date.now() - daysAgo * 86400000 - int(0, 20) * 3600000);
      orderRows.push({
        order_number: `MH-${orderSeq++}`,
        user_id: buyer.id,
        subtotal: money(subtotal),
        delivery_fee: money(fee),
        total: money(subtotal + fee),
        status: mix.status,
        payment_status: mix.payment,
        address_snapshot: `${buyer.email.split("@")[0].replace(/\./g, " ")} · 12 Example Street, ${pick(STATES)}`,
        created_at: created.toISOString(),
        items,
      });
    }

    const insertedOrders = await client.query<{ id: string; order_number: string }>(
      `insert into orders (order_number, user_id, subtotal, delivery_fee, total, status, payment_status, address_snapshot, created_at, updated_at)
       select x.order_number, x.user_id::uuid, x.subtotal::numeric, x.delivery_fee::numeric, x.total::numeric,
              x.status, x.payment_status, x.address_snapshot, x.created_at::timestamptz, x.created_at::timestamptz
       from jsonb_to_recordset($1::jsonb) as x(
         order_number text, user_id text, subtotal text, delivery_fee text, total text,
         status text, payment_status text, address_snapshot text, created_at text
       )
       returning id, order_number`,
      [JSON.stringify(orderRows.map(({ items, ...o }) => o))],
    );
    const orderIdByNumber = new Map(insertedOrders.rows.map((r) => [r.order_number, r.id]));

    const orderItems: { order_id: string; product_id: string; name: string; image: string | null; unit_price: string; qty: number }[] = [];
    const payments: { order_id: string; user_id: string; amount: string; reference: string; status: string; created_at: string }[] = [];
    for (const o of orderRows) {
      const oid = orderIdByNumber.get(o.order_number);
      if (!oid) continue;
      for (const it of o.items) orderItems.push({ order_id: oid, ...it });
      if (o.payment_status === "awaiting" || o.payment_status === "paid") {
        payments.push({
          order_id: oid,
          user_id: o.user_id,
          amount: o.total,
          reference: `TRF${int(100000000, 999999999)}`,
          status: o.payment_status === "paid" ? "approved" : "awaiting",
          created_at: o.created_at,
        });
      }
    }

    await client.query(
      `insert into order_items (order_id, product_id, name, image, unit_price, qty)
       select x.order_id::uuid, x.product_id::uuid, x.name, x.image, x.unit_price::numeric, x.qty
       from jsonb_to_recordset($1::jsonb) as x(order_id text, product_id text, name text, image text, unit_price text, qty int)`,
      [JSON.stringify(orderItems)],
    );

    if (payments.length) {
      await client.query(
        `insert into payments (order_id, user_id, amount, reference, status, created_at)
         select x.order_id::uuid, x.user_id::uuid, x.amount::numeric, x.reference, x.status, x.created_at::timestamptz
         from jsonb_to_recordset($1::jsonb) as x(order_id text, user_id text, amount text, reference text, status text, created_at text)`,
        [JSON.stringify(payments)],
      );
    }

    // ── 8. admin notifications (the dashboard "Recent activity" feed) ───────
    const notifs: { audience: string; type: string; title: string; body: string; link: string | null; read: boolean; created_at: string }[] = [];
    for (const o of orderRows.slice(0, 12)) {
      notifs.push({
        audience: "admin",
        type: "order",
        title: `New order ${o.order_number}`,
        body: `${formatNaira(Number(o.total))} · ${o.items.length} item${o.items.length > 1 ? "s" : ""}`,
        link: "/admin/orders",
        read: false,
        created_at: o.created_at,
      });
    }
    for (const p of payments.slice(0, 6)) {
      notifs.push({
        audience: "admin",
        type: "payment",
        title: `Payment submitted · ${p.reference}`,
        body: `${formatNaira(Number(p.amount))} awaiting verification`,
        link: "/admin/payments",
        read: false,
        created_at: p.created_at,
      });
    }
    if (notifs.length) {
      await client.query(
        `insert into notifications (audience, type, title, body, link, read, created_at)
         select x.audience, x.type, x.title, x.body, x.link, x.read, x.created_at::timestamptz
         from jsonb_to_recordset($1::jsonb) as x(audience text, type text, title text, body text, link text, read boolean, created_at text)`,
        [JSON.stringify(notifs)],
      );
    }

    // ── 9. summary ──────────────────────────────────────────────────────────
    const summary = await client.query<{ products: number; images: number; variants: number; reviews: number; featured: number; discounted: number; orders: number; payments: number; notifications: number }>(
      `select
         (select count(*)::int from products) as products,
         (select count(*)::int from product_images) as images,
         (select count(*)::int from product_variants) as variants,
         (select count(*)::int from reviews) as reviews,
         (select count(*)::int from products where featured) as featured,
         (select count(*)::int from products where discount_price is not null) as discounted,
         (select count(*)::int from orders) as orders,
         (select count(*)::int from payments) as payments,
         (select count(*)::int from notifications) as notifications`,
    );
    console.log("Seed complete:", summary.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
