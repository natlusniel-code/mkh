import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  bigint,
  integer,
  boolean,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM TABLE — managed by the scaffold. The Agent MUST NOT redefine or drop
// the auth columns here; it only ADDS business tables below (DESIGN §5.1).
//
// `password_hash` is LOCAL-auth-only. It is deliberately confined to this table
// and to server/_core/auth.ts — it never appears in SessionUser or any tRPC
// output. A future SsoAuthProvider would leave it null and link identities via
// an external-subject column; business tables keep FK'ing users.id regardless,
// so switching auth providers needs no business-schema change.
// ─────────────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // null for SSO-linked users (future)
  name: text("name"),
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// SYSTEM TABLE — managed by the scaffold, written by server/_core/storage.ts.
// The Agent MUST NOT redefine, rename or drop it: `_core` inserts into it, so a
// rename breaks `_core`. Rows are created by storageCommit() AFTER the upload
// landed, with size/contentType read back from object storage — never from the
// client — so a row cannot point at an object that does not exist AT COMMIT TIME.
//
// That guarantee can still go stale: the platform's owner-facing storage panel
// can delete the underlying object directly. It has no access to this app's
// database, so it cannot (and does not) delete the matching row here. A row
// existing is therefore NOT a guarantee its object still exists — treat a 404
// from `/app-storage/<key>` as an expected, handle-able case in the UI, not a
// bug. `/app-storage/<key>` is also unauthenticated (no session check), so the
// URL itself is the read capability — never store something there that must
// not leak to anyone who obtains the link.
export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Path relative to this app's storage prefix; served at /app-storage/<key>.
    key: text("key").notNull().unique(),
    // Nullable on purpose: a public "contact form with attachment" has no
    // logged-in uploader. set null (not cascade) on user delete — this table is
    // the app's ONLY index of its objects, so deleting the row would
    // permanently lose the ability to find the file.
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(), // original filename, for display
    size: bigint("size", { mode: "number" }).notNull(), // bigint: integer caps at ~2.1GB
    contentType: text("content_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("files_owner_idx").on(t.ownerId), index("files_created_idx").on(t.createdAt)],
);

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS TABLES — MarketHub
// ─────────────────────────────────────────────────────────────────────────────

/** Customer profile, 1:1 with `users`. Holds the fields the auth table does not. */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name"),
    phone: text("phone"), // normalized: digits only, e.g. 08012345678
    suspended: boolean("suspended").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("profiles_user_idx").on(t.userId),
    uniqueIndex("profiles_phone_idx").on(t.phone),
  ],
);

/** Saved delivery addresses. Owner-scoped. */
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Home"),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    state: text("state").notNull(),
    city: text("city").notNull(),
    street: text("street").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

/** Product categories. Reference data — seeded via migration. */
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    image: text("image"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

/** Products. Public read; admin write. */
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    subcategory: text("subcategory"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(), // NGN
    discountPrice: numeric("discount_price", { precision: 12, scale: 2 }),
    stock: integer("stock").notNull().default(0),
    status: text("status").notNull().default("active"), // active | draft | archived
    featured: boolean("featured").notNull().default(false),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
    ratingCount: integer("rating_count").notNull().default(0),
    soldCount: integer("sold_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_status_idx").on(t.status),
    index("products_featured_idx").on(t.featured),
    index("products_created_idx").on(t.createdAt),
  ],
);

/** Product gallery images, ordered. */
export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

/** Product variants (size / colour). */
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // size | color
    value: text("value").notNull(),
    priceDelta: numeric("price_delta", { precision: 12, scale: 2 }).notNull().default("0"),
    stock: integer("stock").notNull().default(0),
  },
  (t) => [index("product_variants_product_idx").on(t.productId)],
);

/** Cart. One per logged-in user, or one per guest token. */
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestToken: text("guest_token"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("carts_user_idx").on(t.userId),
    uniqueIndex("carts_guest_idx").on(t.guestToken),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    qty: integer("qty").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cart_items_cart_idx").on(t.cartId)],
);

/** Orders. Owner-scoped when logged in; guest orders carry a snapshot. */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    guestName: text("guest_name"),
    guestPhone: text("guest_phone"),
    guestEmail: text("guest_email"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    status: text("status").notNull().default("pending_payment"),
    paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | awaiting | paid | rejected
    addressSnapshot: text("address_snapshot").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.orderNumber),
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    image: text("image"),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    qty: integer("qty").notNull(),
    variant: text("variant"),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/** Manual bank-transfer payment submissions, verified by an admin. */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    reference: text("reference").notNull(),
    note: text("note"),
    status: text("status").notNull().default("awaiting"), // awaiting | approved | rejected
    adminNote: text("admin_note"),
    verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("payments_order_idx").on(t.orderId),
    index("payments_status_idx").on(t.status),
    index("payments_created_idx").on(t.createdAt),
  ],
);

/** Singleton row (id = 'default') holding the bank details shown in the modal. */
export const paymentSettings = pgTable("payment_settings", {
  id: text("id").primaryKey().default("default"),
  bankName: text("bank_name").notNull().default("Smartcash"),
  accountName: text("account_name").notNull().default("MarketHub Cart Checkout"),
  accountNumber: text("account_number").notNull().default("9111356510"),
  instructions: text("instructions").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reviews_product_idx").on(t.productId),
    uniqueIndex("reviews_product_user_idx").on(t.productId, t.userId),
  ],
);

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("wishlists_user_product_idx").on(t.userId, t.productId)],
);

/** In-app notifications. audience 'customer' → userId; 'admin' → userId null. */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    audience: text("audience").notNull().default("customer"), // customer | admin
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    link: text("link"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("notifications_user_idx").on(t.userId),
    index("notifications_audience_idx").on(t.audience),
    index("notifications_created_idx").on(t.createdAt),
  ],
);
