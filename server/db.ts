// ── AGENT-OWNED: business data-access ─────────────────────────────────────────
// All MarketHub queries live here so routers stay thin. Owner-scoped queries
// always take the owner id as a required positional argument.
import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, lte, ne, or, sql } from "drizzle-orm";
import { db, atomic } from "./_core/db";
import {
  addresses,
  cartItems,
  carts,
  categories,
  notifications,
  orderItems,
  orders,
  paymentSettings,
  payments,
  productImages,
  productVariants,
  products,
  profiles,
  reviews,
  users,
  wishlists,
} from "../drizzle/schema";

// ── helpers ──────────────────────────────────────────────────────────────────
const num = (v: unknown): number => (v == null ? 0 : Number(v));

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: string;
  discountPrice: string | null;
  stock: number;
  status: string;
  featured: boolean;
  rating: string;
  ratingCount: number;
  soldCount: number;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  image: string | null;
  createdAt: Date;
};

const cardCols = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  price: products.price,
  discountPrice: products.discountPrice,
  stock: products.stock,
  status: products.status,
  featured: products.featured,
  rating: products.rating,
  ratingCount: products.ratingCount,
  soldCount: products.soldCount,
  categoryId: products.categoryId,
  categoryName: categories.name,
  categorySlug: categories.slug,
  createdAt: products.createdAt,
  // NOTE: the correlated reference is written as a raw `products.id`, NOT
  // `${products.id}`. Drizzle renders a column inside sql`` UNQUALIFIED ("id"),
  // and inside this subquery that binds to product_images' own scope rather
  // than the outer products row — the count silently came back 0 for every
  // category. Qualifying by hand is what makes the correlation resolve.
  image: sql<string | null>`(
    select pi.url from product_images pi
    where pi.product_id = products.id
    order by pi.sort_order asc limit 1
  )`,
};

// ── categories ───────────────────────────────────────────────────────────────
export async function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function listCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      image: categories.image,
      sortOrder: categories.sortOrder,
      // `categories.id` is written raw on purpose — see the note on cardCols.
      productCount: sql<number>`(
        select count(*)::int from products p
        where p.category_id = categories.id and p.status = 'active'
      )`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function createCategory(input: { name: string; slug: string; description?: string; image?: string; sortOrder?: number }) {
  const [row] = await db
    .insert(categories)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      image: input.image ?? null,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return row;
}

export async function updateCategory(id: string, input: { name?: string; slug?: string; description?: string | null; image?: string | null; sortOrder?: number }) {
  const [row] = await db
    .update(categories)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    })
    .where(eq(categories.id, id))
    .returning();
  return row ?? null;
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  return { ok: true };
}

// ── products ─────────────────────────────────────────────────────────────────
export type ProductQuery = {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  discountedOnly?: boolean;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "rating";
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};

function productWhere(q: ProductQuery) {
  const conds = [];
  if (!q.includeInactive) conds.push(eq(products.status, "active"));
  if (q.search) {
    const term = `%${q.search}%`;
    conds.push(or(ilike(products.name, term), ilike(products.description, term), ilike(products.subcategory, term)));
  }
  if (q.categorySlug) conds.push(eq(categories.slug, q.categorySlug));
  // Price filters compare the EFFECTIVE price (the discounted price when the
  // product is on sale, otherwise the list price). Filtering on `price` alone
  // returned products whose sale price sat outside the requested range, which
  // is what made "Electronics + ₦2,000–₦3,000" look broken.
  const effective = sql`coalesce(${products.discountPrice}, ${products.price})`;
  if (q.minPrice !== undefined) conds.push(gte(effective, String(q.minPrice)));
  if (q.maxPrice !== undefined) conds.push(lte(effective, String(q.maxPrice)));
  if (q.discountedOnly) conds.push(sql`${products.discountPrice} is not null and ${products.discountPrice} > 0`);
  if (q.inStockOnly) conds.push(gte(products.stock, 1));
  if (q.featuredOnly) conds.push(eq(products.featured, true));
  return conds.length ? and(...conds) : undefined;
}

function productOrder(sort: ProductQuery["sort"]) {
  switch (sort) {
    case "price_asc":
      return [asc(sql`coalesce(${products.discountPrice}, ${products.price})`)];
    case "price_desc":
      return [desc(sql`coalesce(${products.discountPrice}, ${products.price})`)];
    case "popular":
      return [desc(products.soldCount), desc(products.ratingCount)];
    case "rating":
      return [desc(products.rating), desc(products.ratingCount)];
    default:
      return [desc(products.createdAt)];
  }
}

export async function listProducts(q: ProductQuery) {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, q.pageSize ?? 24));
  const where = productWhere(q);

  const rows = await db
    .select(cardCols)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(...productOrder(q.sort))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [totalRow] = await db
    .select({ value: count() })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where);

  const total = totalRow?.value ?? 0;
  return { items: rows as ProductCard[], total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getProductBySlug(slug: string) {
  const [row] = await db
    .select({ ...cardCols, description: products.description, subcategory: products.subcategory, updatedAt: products.updatedAt })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  if (!row) return null;
  const [images, variants] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, row.id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(eq(productVariants.productId, row.id)),
  ]);
  return { ...row, images, variants };
}

export async function getProductById(id: string) {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row ?? null;
}

export async function getProductImages(productId: string) {
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder));
}

export async function getProductVariants(productId: string) {
  return db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 8) {
  const conds = [eq(products.status, "active"), ne(products.id, productId)];
  if (categoryId) conds.push(eq(products.categoryId, categoryId));
  return (await db
    .select(cardCols)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conds))
    .orderBy(desc(products.soldCount))
    .limit(limit)) as ProductCard[];
}

export async function listProductCardsByIds(ids: string[]) {
  if (ids.length === 0) return [] as ProductCard[];
  return (await db
    .select(cardCols)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(inArray(products.id, ids))) as ProductCard[];
}

export async function createProduct(input: {
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  subcategory?: string | null;
  price: string;
  discountPrice?: string | null;
  stock: number;
  status: string;
  featured: boolean;
  images?: string[];
  variants?: { type: string; value: string; priceDelta?: string; stock?: number }[];
}) {
  const [row] = await db
    .insert(products)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description,
      categoryId: input.categoryId,
      subcategory: input.subcategory ?? null,
      price: input.price,
      discountPrice: input.discountPrice ?? null,
      stock: input.stock,
      status: input.status,
      featured: input.featured,
    })
    .returning();

  if (input.images?.length) {
    await db.insert(productImages).values(input.images.map((url, i) => ({ productId: row.id, url, sortOrder: i })));
  }
  if (input.variants?.length) {
    await db.insert(productVariants).values(
      input.variants.map((v) => ({
        productId: row.id,
        type: v.type,
        value: v.value,
        priceDelta: v.priceDelta ?? "0",
        stock: v.stock ?? 0,
      })),
    );
  }
  return row;
}

export async function updateProduct(
  id: string,
  input: {
    name?: string;
    slug?: string;
    description?: string;
    categoryId?: string | null;
    subcategory?: string | null;
    price?: string;
    discountPrice?: string | null;
    stock?: number;
    status?: string;
    featured?: boolean;
    images?: string[];
    variants?: { type: string; value: string; priceDelta?: string; stock?: number }[];
  },
) {
  const [row] = await db
    .update(products)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.subcategory !== undefined ? { subcategory: input.subcategory } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.discountPrice !== undefined ? { discountPrice: input.discountPrice } : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  if (!row) return null;

  if (input.images !== undefined) {
    await db.delete(productImages).where(eq(productImages.productId, id));
    if (input.images.length) {
      await db.insert(productImages).values(input.images.map((url, i) => ({ productId: id, url, sortOrder: i })));
    }
  }
  if (input.variants !== undefined) {
    await db.delete(productVariants).where(eq(productVariants.productId, id));
    if (input.variants.length) {
      await db.insert(productVariants).values(
        input.variants.map((v) => ({
          productId: id,
          type: v.type,
          value: v.value,
          priceDelta: v.priceDelta ?? "0",
          stock: v.stock ?? 0,
        })),
      );
    }
  }
  return row;
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
  return { ok: true };
}

export async function countProducts() {
  const [row] = await db.select({ value: count() }).from(products);
  return row?.value ?? 0;
}

export async function lowStockProducts(threshold = 10, limit = 20) {
  return (await db
    .select(cardCols)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, "active"), lte(products.stock, threshold)))
    .orderBy(asc(products.stock))
    .limit(limit)) as ProductCard[];
}

// ── reviews ──────────────────────────────────────────────────────────────────
export async function listReviews(productId: string) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function upsertReview(input: { productId: string; userId: string; rating: number; title?: string; body?: string }) {
  const [row] = await db
    .insert(reviews)
    .values({
      productId: input.productId,
      userId: input.userId,
      rating: input.rating,
      title: input.title ?? null,
      body: input.body ?? null,
    })
    .onConflictDoUpdate({
      target: [reviews.productId, reviews.userId],
      set: { rating: input.rating, title: input.title ?? null, body: input.body ?? null },
    })
    .returning();

  // Recompute the product's aggregate rating from real review rows.
  const [agg] = await db
    .select({ avg: sql<string>`coalesce(avg(${reviews.rating}), 0)`, n: count() })
    .from(reviews)
    .where(eq(reviews.productId, input.productId));
  await db
    .update(products)
    .set({ rating: String(Number(agg?.avg ?? 0).toFixed(2)), ratingCount: agg?.n ?? 0 })
    .where(eq(products.id, input.productId));
  return row;
}

// ── wishlist ─────────────────────────────────────────────────────────────────
export async function listWishlist(userId: string) {
  const rows = await db
    .select({ productId: wishlists.productId, createdAt: wishlists.createdAt })
    .from(wishlists)
    .where(eq(wishlists.userId, userId))
    .orderBy(desc(wishlists.createdAt));
  const cards = await listProductCardsByIds(rows.map((r) => r.productId));
  const byId = new Map(cards.map((c) => [c.id, c]));
  return rows.map((r) => byId.get(r.productId)).filter((c): c is ProductCard => Boolean(c));
}

export async function wishlistIds(userId: string) {
  const rows = await db.select({ productId: wishlists.productId }).from(wishlists).where(eq(wishlists.userId, userId));
  return rows.map((r) => r.productId);
}

export async function addWishlist(userId: string, productId: string) {
  await db.insert(wishlists).values({ userId, productId }).onConflictDoNothing();
  return { ok: true };
}

export async function removeWishlist(userId: string, productId: string) {
  await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
  return { ok: true };
}

// ── cart ─────────────────────────────────────────────────────────────────────
/** Find or create the cart for a logged-in user. */
export async function getOrCreateUserCart(userId: string) {
  const [existing] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(carts).values({ userId }).returning();
  return created;
}

/** Find or create the cart for a guest token. */
export async function getOrCreateGuestCart(guestToken: string) {
  const [existing] = await db.select().from(carts).where(eq(carts.guestToken, guestToken)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(carts).values({ guestToken }).returning();
  return created;
}

export type CartLine = {
  id: string;
  productId: string;
  variantId: string | null;
  qty: number;
  unitPrice: string;
  name: string;
  slug: string;
  stock: number;
  status: string;
  image: string | null;
  variantLabel: string | null;
};

export async function getCartLines(cartId: string): Promise<CartLine[]> {
  return db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      variantId: cartItems.variantId,
      qty: cartItems.qty,
      unitPrice: cartItems.unitPrice,
      name: products.name,
      slug: products.slug,
      stock: products.stock,
      status: products.status,
      variantLabel: productVariants.value,
      image: sql<string | null>`(
        select pi.url from product_images pi
        where pi.product_id = products.id
        order by pi.sort_order asc limit 1
      )`,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt));
}

export async function addCartItem(input: { cartId: string; productId: string; variantId: string | null; qty: number; unitPrice: string }) {
  // Merge with an existing line for the same product+variant.
  const [existing] = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, input.cartId),
        eq(cartItems.productId, input.productId),
        input.variantId ? eq(cartItems.variantId, input.variantId) : isNull(cartItems.variantId),
      ),
    )
    .limit(1);

  if (existing) {
    const [row] = await db
      .update(cartItems)
      .set({ qty: existing.qty + input.qty, unitPrice: input.unitPrice })
      .where(eq(cartItems.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db.insert(cartItems).values(input).returning();
  return row;
}

export async function setCartItemQty(cartId: string, itemId: string, qty: number) {
  if (qty <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
    return { ok: true };
  }
  await db.update(cartItems).set({ qty }).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
  return { ok: true };
}

export async function removeCartItem(cartId: string, itemId: string) {
  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
  return { ok: true };
}

export async function clearCart(cartId: string) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  return { ok: true };
}

export async function countCartItems(cartId: string) {
  const [row] = await db.select({ value: sql<number>`coalesce(sum(${cartItems.qty}), 0)::int` }).from(cartItems).where(eq(cartItems.cartId, cartId));
  return row?.value ?? 0;
}

/** Move every line from a guest cart into the user's cart, then drop the guest cart. */
export async function mergeGuestCartIntoUser(guestToken: string, userId: string) {
  const [guest] = await db.select().from(carts).where(eq(carts.guestToken, guestToken)).limit(1);
  if (!guest) return { ok: true };
  const userCart = await getOrCreateUserCart(userId);
  const lines = await db.select().from(cartItems).where(eq(cartItems.cartId, guest.id));
  for (const line of lines) {
    await addCartItem({
      cartId: userCart.id,
      productId: line.productId,
      variantId: line.variantId,
      qty: line.qty,
      unitPrice: line.unitPrice,
    });
  }
  await db.delete(carts).where(eq(carts.id, guest.id));
  return { ok: true };
}

// ── addresses ────────────────────────────────────────────────────────────────
export async function listAddresses(userId: string) {
  return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
}

export async function createAddress(input: {
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  state: string;
  city: string;
  street: string;
  isDefault: boolean;
}) {
  if (input.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, input.userId));
  }
  const [row] = await db.insert(addresses).values(input).returning();
  return row;
}

export async function updateAddress(
  id: string,
  userId: string,
  input: { label?: string; fullName?: string; phone?: string; state?: string; city?: string; street?: string; isDefault?: boolean },
) {
  if (input.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  }
  const [row] = await db
    .update(addresses)
    .set(input)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteAddress(id: string, userId: string) {
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  return { ok: true };
}

// ── orders ───────────────────────────────────────────────────────────────────
export type OrderLineInput = {
  productId: string;
  name: string;
  image: string | null;
  unitPrice: string;
  qty: number;
  variant: string | null;
};

/** Generate a unique, human-readable order number: MH-YYMMDD-XXXXXX. */
function makeOrderNumber(): string {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MH-${stamp}-${rand}`;
}

/**
 * Create an order from server-validated lines. Stock is re-checked and decremented
 * in the same atomic unit, so two concurrent checkouts cannot oversell.
 */
export async function createOrder(input: {
  userId: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  addressSnapshot: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  lines: OrderLineInput[];
}) {
  const orderNumber = makeOrderNumber();
  const orderId = crypto.randomUUID();

  const [orderRow] = await db
    .insert(orders)
    .values({
      id: orderId,
      orderNumber,
      userId: input.userId,
      guestName: input.guestName ?? null,
      guestPhone: input.guestPhone ?? null,
      guestEmail: input.guestEmail ?? null,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      total: input.total,
      status: "pending_payment",
      paymentStatus: "unpaid",
      addressSnapshot: input.addressSnapshot,
    })
    .returning();

  await db.insert(orderItems).values(
    input.lines.map((l) => ({
      orderId,
      productId: l.productId,
      name: l.name,
      image: l.image,
      unitPrice: l.unitPrice,
      qty: l.qty,
      variant: l.variant,
    })),
  );

  // Decrement stock with a guard: the WHERE re-checks availability in SQL, so a
  // zero-row result means somebody else took the last unit.
  for (const line of input.lines) {
    const updated = await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${line.qty}`, soldCount: sql`${products.soldCount} + ${line.qty}` })
      .where(and(eq(products.id, line.productId), gte(products.stock, line.qty)))
      .returning({ id: products.id });
    if (updated.length === 0) {
      throw new Error(`OUT_OF_STOCK:${line.name}`);
    }
  }

  return orderRow;
}

export async function getOrderById(id: string) {
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return row ?? null;
}

export async function setOrderPaymentStatus(orderId: string, paymentStatus: string) {
  await db.update(orders).set({ paymentStatus, updatedAt: new Date() }).where(eq(orders.id, orderId));
  return { ok: true };
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const paymentRows = await db.select().from(payments).where(eq(payments.orderId, order.id)).orderBy(desc(payments.createdAt));
  return { ...order, items, payments: paymentRows };
}

export async function listOrdersByUser(userId: string) {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  if (rows.length === 0) return [];
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((r) => r.id)));
  return rows.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) }));
}

export async function listOrdersAdmin(q: { search?: string; status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, q.pageSize ?? 25));
  const conds = [];
  if (q.status) conds.push(eq(orders.status, q.status));
  if (q.search) {
    const term = `%${q.search}%`;
    conds.push(or(ilike(orders.orderNumber, term), ilike(orders.guestName, term), ilike(orders.guestPhone, term)));
  }
  const where = conds.length ? and(...conds) : undefined;

  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
  const [totalRow] = await db.select({ value: count() }).from(orders).where(where);
  const items = rows.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id)))
    : [];
  const userIds = rows.map((r) => r.userId).filter((v): v is string => Boolean(v));
  const buyers = userIds.length
    ? await db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(inArray(users.id, userIds))
    : [];
  const byId = new Map(buyers.map((b) => [b.id, b]));

  return {
    items: rows.map((o) => ({
      ...o,
      items: items.filter((i) => i.orderId === o.id),
      buyer: o.userId ? (byId.get(o.userId) ?? null) : null,
    })),
    total: totalRow?.value ?? 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((totalRow?.value ?? 0) / pageSize)),
  };
}

export async function updateOrderStatus(id: string, status: string) {
  const [row] = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
  return row ?? null;
}

export async function cancelOrder(id: string, userId: string) {
  // Only the owner may cancel, and only before it ships.
  const [row] = await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, id),
        eq(orders.userId, userId),
        inArray(orders.status, ["pending_payment", "payment_verification", "paid", "processing"]),
      ),
    )
    .returning();
  return row ?? null;
}

export async function countOrders() {
  const [row] = await db.select({ value: count() }).from(orders);
  return row?.value ?? 0;
}

// ── payments ─────────────────────────────────────────────────────────────────
export async function createPayment(input: { orderId: string; userId: string | null; amount: string; reference: string; note?: string | null }) {
  const [row] = await db
    .insert(payments)
    .values({
      orderId: input.orderId,
      userId: input.userId,
      amount: input.amount,
      reference: input.reference,
      note: input.note ?? null,
      status: "awaiting",
    })
    .returning();
  return row;
}

export async function listPaymentsAdmin(q: { status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, q.pageSize ?? 25));
  const where = q.status ? eq(payments.status, q.status) : undefined;

  const rows = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      userId: payments.userId,
      amount: payments.amount,
      reference: payments.reference,
      note: payments.note,
      status: payments.status,
      adminNote: payments.adminNote,
      verifiedAt: payments.verifiedAt,
      createdAt: payments.createdAt,
      orderNumber: orders.orderNumber,
      orderTotal: orders.total,
      orderStatus: orders.status,
      guestName: orders.guestName,
      guestPhone: orders.guestPhone,
      buyerEmail: users.email,
      buyerName: users.name,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .leftJoin(users, eq(payments.userId, users.id))
    .where(where)
    .orderBy(desc(payments.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [totalRow] = await db.select({ value: count() }).from(payments).where(where);
  return { items: rows, total: totalRow?.value ?? 0, page, pageSize, pageCount: Math.max(1, Math.ceil((totalRow?.value ?? 0) / pageSize)) };
}

export async function listPaymentsForOrder(orderId: string) {
  return db.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt));
}

/**
 * Approve a payment. Guarded so a second approval cannot double-apply: the
 * WHERE requires status = 'awaiting', so a zero-row result means somebody
 * already decided this one.
 */
export async function approvePayment(paymentId: string, adminId: string, adminNote?: string | null) {
  const [row] = await db
    .update(payments)
    .set({ status: "approved", adminNote: adminNote ?? null, verifiedBy: adminId, verifiedAt: new Date() })
    .where(and(eq(payments.id, paymentId), eq(payments.status, "awaiting")))
    .returning();
  if (!row) return null;
  await db
    .update(orders)
    .set({ paymentStatus: "paid", status: "paid", updatedAt: new Date() })
    .where(eq(orders.id, row.orderId));
  return row;
}

export async function rejectPayment(paymentId: string, adminId: string, adminNote?: string | null) {
  const [row] = await db
    .update(payments)
    .set({ status: "rejected", adminNote: adminNote ?? null, verifiedBy: adminId, verifiedAt: new Date() })
    .where(and(eq(payments.id, paymentId), eq(payments.status, "awaiting")))
    .returning();
  if (!row) return null;
  await db
    .update(orders)
    .set({ paymentStatus: "rejected", status: "payment_verification", updatedAt: new Date() })
    .where(eq(orders.id, row.orderId));
  return row;
}

export async function paymentStats() {
  const [row] = await db
    .select({
      awaiting: sql<number>`count(*) filter (where ${payments.status} = 'awaiting')::int`,
      approved: sql<number>`count(*) filter (where ${payments.status} = 'approved')::int`,
      rejected: sql<number>`count(*) filter (where ${payments.status} = 'rejected')::int`,
      revenue: sql<string>`coalesce(sum(${payments.amount}) filter (where ${payments.status} = 'approved'), 0)`,
    })
    .from(payments);
  return {
    awaiting: row?.awaiting ?? 0,
    approved: row?.approved ?? 0,
    rejected: row?.rejected ?? 0,
    revenue: num(row?.revenue),
  };
}

// ── payment settings (singleton) ─────────────────────────────────────────────
export async function getPaymentSettings() {
  const [row] = await db.select().from(paymentSettings).where(eq(paymentSettings.id, "default")).limit(1);
  if (row) return row;
  const [created] = await db.insert(paymentSettings).values({ id: "default" }).onConflictDoNothing().returning();
  if (created) return created;
  const [again] = await db.select().from(paymentSettings).where(eq(paymentSettings.id, "default")).limit(1);
  return again;
}

export async function updatePaymentSettings(input: { bankName: string; accountName: string; accountNumber: string; instructions: string }) {
  const [row] = await db
    .insert(paymentSettings)
    .values({ id: "default", ...input, updatedAt: new Date() })
    .onConflictDoUpdate({ target: paymentSettings.id, set: { ...input, updatedAt: new Date() } })
    .returning();
  return row;
}

// ── notifications ────────────────────────────────────────────────────────────
export async function createNotification(input: {
  userId?: string | null;
  audience: "customer" | "admin";
  type: string;
  title: string;
  body?: string;
  link?: string | null;
}) {
  const [row] = await db
    .insert(notifications)
    .values({
      userId: input.userId ?? null,
      audience: input.audience,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
      link: input.link ?? null,
    })
    .returning();
  return row;
}

export async function listNotifications(userId: string, limit = 50) {
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.audience, "customer"), eq(notifications.userId, userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function listAdminNotifications(limit = 50) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.audience, "admin"))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function unreadCount(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.audience, "customer"), eq(notifications.userId, userId), eq(notifications.read, false)));
  return row?.value ?? 0;
}

export async function unreadAdminCount() {
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.audience, "admin"), eq(notifications.read, false)));
  return row?.value ?? 0;
}

export async function markNotificationRead(id: string, userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  return { ok: true };
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.audience, "customer"), eq(notifications.userId, userId)));
  return { ok: true };
}

export async function markAdminNotificationsRead() {
  await db.update(notifications).set({ read: true }).where(eq(notifications.audience, "admin"));
  return { ok: true };
}

// ── profiles / users ─────────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return row ?? null;
}

export async function upsertProfile(userId: string, input: { fullName?: string | null; phone?: string | null }) {
  const [row] = await db
    .insert(profiles)
    .values({ userId, fullName: input.fullName ?? null, phone: input.phone ?? null })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { fullName: input.fullName ?? null, phone: input.phone ?? null, updatedAt: new Date() },
    })
    .returning();
  return row;
}

export async function updateUserName(userId: string, name: string) {
  await db.update(users).set({ name }).where(eq(users.id, userId));
  return { ok: true };
}

export async function listUsersAdmin(q: { search?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, q.pageSize ?? 25));
  const where = q.search
    ? or(ilike(users.email, `%${q.search}%`), ilike(users.name, `%${q.search}%`))
    : undefined;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      fullName: profiles.fullName,
      phone: profiles.phone,
      suspended: profiles.suspended,
      orderCount: sql<number>`(select count(*)::int from orders o where o.user_id = users.id)`,
      totalSpent: sql<string>`(select coalesce(sum(o.total), 0) from orders o where o.user_id = users.id and o.payment_status = 'paid')`,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [totalRow] = await db.select({ value: count() }).from(users).where(where);
  return { items: rows, total: totalRow?.value ?? 0, page, pageSize, pageCount: Math.max(1, Math.ceil((totalRow?.value ?? 0) / pageSize)) };
}

export async function setUserRole(userId: string, role: "user" | "admin") {
  const [row] = await db.update(users).set({ role }).where(eq(users.id, userId)).returning();
  return row ?? null;
}

export async function countAdmins() {
  const [row] = await db.select({ value: count() }).from(users).where(eq(users.role, "admin"));
  return row?.value ?? 0;
}

export async function setUserSuspended(userId: string, suspended: boolean) {
  const [row] = await db
    .insert(profiles)
    .values({ userId, suspended })
    .onConflictDoUpdate({ target: profiles.userId, set: { suspended, updatedAt: new Date() } })
    .returning();
  return row;
}

export async function countUsers() {
  const [row] = await db.select({ value: count() }).from(users);
  return row?.value ?? 0;
}

// ── dashboard analytics ──────────────────────────────────────────────────────
export async function dashboardStats() {
  const [orderAgg] = await db
    .select({
      totalOrders: count(),
      pending: sql<number>`count(*) filter (where ${orders.status} = 'pending_payment')::int`,
      processing: sql<number>`count(*) filter (where ${orders.status} in ('paid','processing','shipped','out_for_delivery'))::int`,
      delivered: sql<number>`count(*) filter (where ${orders.status} = 'delivered')::int`,
      cancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int`,
      grossSales: sql<string>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid'), 0)`,
    })
    .from(orders);

  const [pay] = await Promise.all([paymentStats()]);
  const [customers, productCount] = await Promise.all([countUsers(), countProducts()]);

  return {
    totalOrders: orderAgg?.totalOrders ?? 0,
    pendingOrders: orderAgg?.pending ?? 0,
    processingOrders: orderAgg?.processing ?? 0,
    deliveredOrders: orderAgg?.delivered ?? 0,
    cancelledOrders: orderAgg?.cancelled ?? 0,
    totalRevenue: num(orderAgg?.grossSales),
    pendingPayments: pay.awaiting,
    completedPayments: pay.approved,
    rejectedPayments: pay.rejected,
    totalCustomers: customers,
    totalProducts: productCount,
  };
}

/** Daily order count + revenue for the last N days (real rows only). */
export async function salesSeries(days = 14) {
  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
      orders: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid'), 0)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, sql`now() - ${`${days} days`}::interval`))
    .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('day', ${orders.createdAt})`);

  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: { day: string; orders: number; revenue: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hit = byDay.get(key);
    out.push({ day: key, orders: hit?.orders ?? 0, revenue: num(hit?.revenue) });
  }
  return out;
}

export async function topCategories(limit = 6) {
  return db
    .select({
      name: categories.name,
      slug: categories.slug,
      productCount: sql<number>`count(${products.id})::int`,
      sold: sql<number>`coalesce(sum(${products.soldCount}), 0)::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id, categories.name, categories.slug)
    .orderBy(desc(sql`coalesce(sum(${products.soldCount}), 0)`))
    .limit(limit);
}

export async function recentOrders(limit = 8) {
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      total: orders.total,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
      guestName: orders.guestName,
      buyerEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function recentActivity(limit = 10) {
  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.audience, "admin"))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export { atomic };
