// ── AGENT-OWNED: tRPC API surface ────────────────────────────────────────────
// Thin procedures: zod validation → server/db.ts → typed result.
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc";
import { authProvider, registerLocalUser, AuthError, EmailTakenError } from "./_core/auth";
import { storageCommit, storageDeleteAny, storageListAll, storagePutUrl, StorageError } from "./_core/storage";
import { isUniqueViolation } from "./_core/db";
import * as q from "./db";
import {
  ORDER_STATUSES,
  effectivePrice,
  normalizePhone,
  deliveryFeeFor,
  slugify,
} from "@shared/markethub";

// ── simple in-memory rate limiter (per process) ──────────────────────────────
const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > limit) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again shortly." });
  }
}

// ── phone accounts ───────────────────────────────────────────────────────────
// The platform's auth table keys accounts by `email`. A phone-only account gets
// an explicitly NON-ROUTABLE internal identifier under the reserved `.invalid`
// TLD (RFC 2606) — it is never presented to the customer as an email address and
// no mail is ever sent to it. The customer's real identifier is the normalized
// phone, stored uniquely on `profiles.phone`.
const PHONE_DOMAIN = "@phone.invalid";
const phoneToIdentifier = (phone: string) => `${normalizePhone(phone)}${PHONE_DOMAIN}`;

function looksLikePhone(value: string) {
  return /^[+\d][\d\s()-]{6,}$/.test(value.trim());
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function syncAdminRole(user: { id: string; email: string; role: string }) {
  const allow = adminEmails();
  if (user.role !== "admin" && allow.includes(user.email.toLowerCase())) {
    await q.setUserRole(user.id, "admin");
    return { ...user, role: "admin" };
  }
  return user;
}

// ── auth ─────────────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),

  // One call for the storefront shell: identity + cart count + wishlist ids.
  session: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return { user: null, cartCount: 0, wishlist: [] as string[], unread: 0, isAdmin: false };
    const cart = await q.getOrCreateUserCart(ctx.user.id);
    const [cartCount, wishlist, unread, profile] = await Promise.all([
      q.countCartItems(cart.id),
      q.wishlistIds(ctx.user.id),
      q.unreadCount(ctx.user.id),
      q.getProfile(ctx.user.id),
    ]);
    if (profile?.suspended) return { user: null, cartCount: 0, wishlist: [], unread: 0, isAdmin: false, suspended: true };
    const user = await syncAdminRole(ctx.user);
    return { user, cartCount, wishlist, unread, isAdmin: user.role === "admin", suspended: false };
  }),

  signup: publicProcedure
    .input(
      z.object({
        mode: z.enum(["email", "phone"]).default("email"),
        email: z.string().optional(),
        phone: z.string().optional(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().optional(),
        // `fullName` is the storefront's field; `name` is what _core/useAuth sends.
        fullName: z.string().optional(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.confirmPassword !== undefined && input.confirmPassword !== input.password) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match" });
      }
      rateLimit(`signup:${input.email ?? input.phone}`, 5, 60_000);

      let identifier: string;
      let phone: string | null = null;

      if (input.mode === "phone") {
        phone = normalizePhone(input.phone ?? "");
        if (phone.length < 10) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid Nigerian phone number" });
        }
        identifier = phoneToIdentifier(phone);
      } else {
        const email = (input.email ?? "").trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid email address" });
        }
        identifier = email;
      }

      const fullName = (input.fullName ?? input.name ?? "").trim();
      if (fullName.length < 2) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter your full name" });
      }

      try {
        const created = await registerLocalUser(identifier, input.password, fullName);
        await q.upsertProfile(created.id, { fullName, phone });
        await authProvider().login(ctx.c, identifier, input.password);
        await syncAdminRole({ ...created, email: identifier });
        await q.createNotification({
          userId: created.id,
          audience: "customer",
          type: "welcome",
          title: "Welcome to MarketHub 🎉",
          body: "Browse 200+ products across 10 categories. Your cart and orders are saved here.",
          link: "/products",
        });
        return { ok: true };
      } catch (e) {
        if (e instanceof EmailTakenError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: input.mode === "phone" ? "That phone number already has an account — log in instead." : e.message,
          });
        }
        if (isUniqueViolation(e)) {
          throw new TRPCError({ code: "CONFLICT", message: "That phone number already has an account — log in instead." });
        }
        throw e;
      }
    }),

  login: publicProcedure
    // Accepts `identifier` (storefront) or `email` (what _core/useAuth sends).
    .input(z.object({ email: z.string().optional(), identifier: z.string().optional(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const raw = (input.identifier ?? input.email ?? "").trim();
      if (raw.length < 3) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter your email or phone number" });
      }
      rateLimit(`login:${raw}`, 10, 60_000);
      const identifier = looksLikePhone(raw) ? phoneToIdentifier(raw) : raw.toLowerCase();
      try {
        const user = await authProvider().login(ctx.c, identifier, input.password);
        const profile = await q.getProfile(user.id);
        if (profile?.suspended) {
          await authProvider().logout(ctx.c);
          throw new TRPCError({ code: "FORBIDDEN", message: "This account has been suspended. Contact support." });
        }
        await syncAdminRole(user);
        return { ok: true };
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        if (e instanceof AuthError) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email/phone or password" });
        }
        throw e;
      }
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await authProvider().logout(ctx.c);
    return { ok: true };
  }),
});

// ── catalog ──────────────────────────────────────────────────────────────────
const catalogRouter = router({
  categories: publicProcedure.query(() => q.listCategoriesWithCounts()),

  products: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        categorySlug: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        discountedOnly: z.boolean().optional(),
        inStockOnly: z.boolean().optional(),
        featuredOnly: z.boolean().optional(),
        sort: z.enum(["newest", "price_asc", "price_desc", "popular", "rating"]).optional(),
        page: z.number().int().min(1).optional(),
        pageSize: z.number().int().min(1).max(60).optional(),
      }),
    )
    .query(({ input }) => q.listProducts(input)),

  product: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const product = await q.getProductBySlug(input.slug);
    if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    const [related, reviewRows] = await Promise.all([
      q.getRelatedProducts(product.id, product.categoryId ?? null, 8),
      q.listReviews(product.id),
    ]);
    return { ...product, related, reviews: reviewRows };
  }),

  home: publicProcedure.query(async () => {
    const [categories, featured, newest, bestSellers, discounted, all] = await Promise.all([
      q.listCategoriesWithCounts(),
      q.listProducts({ featuredOnly: true, pageSize: 10, sort: "popular" }),
      q.listProducts({ pageSize: 10, sort: "newest" }),
      q.listProducts({ pageSize: 10, sort: "popular" }),
      q.listProducts({ discountedOnly: true, pageSize: 10, sort: "popular" }),
      q.listProducts({ pageSize: 48, sort: "popular" }),
    ]);
    return {
      categories,
      featured: featured.items,
      newest: newest.items,
      bestSellers: bestSellers.items,
      discounted: discounted.items,
      recommended: all.items,
      totalProducts: all.total,
    };
  }),

  searchSuggestions: publicProcedure
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ input }) => {
      const res = await q.listProducts({ search: input.q, pageSize: 6 });
      return res.items.map((p) => ({ name: p.name, slug: p.slug, image: p.image, price: p.price, discountPrice: p.discountPrice }));
    }),

  addReview: protectedProcedure
    .input(z.object({ productId: z.uuid(), rating: z.number().int().min(1).max(5), title: z.string().optional(), body: z.string().optional() }))
    .mutation(({ ctx, input }) => q.upsertReview({ ...input, userId: ctx.user.id })),
});

// ── cart ─────────────────────────────────────────────────────────────────────
/** Resolve the caller's cart: logged-in → their cart; guest → token cart. */
async function resolveCart(ctx: { user: { id: string } | null }, guestToken?: string | null) {
  if (ctx.user) return { cart: await q.getOrCreateUserCart(ctx.user.id), guest: false };
  if (!guestToken) throw new TRPCError({ code: "BAD_REQUEST", message: "A guest cart token is required" });
  return { cart: await q.getOrCreateGuestCart(guestToken), guest: true };
}

const cartRouter = router({
  get: publicProcedure
    .input(z.object({ guestToken: z.string().optional().nullable() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user && !input.guestToken) return { lines: [], subtotal: 0, deliveryFee: 0, total: 0, count: 0 };
      const { cart } = await resolveCart(ctx, input.guestToken);
      const lines = await q.getCartLines(cart.id);
      const subtotal = lines.reduce((s, l) => s + Number(l.unitPrice) * l.qty, 0);
      const deliveryFee = deliveryFeeFor(subtotal);
      return {
        lines,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        count: lines.reduce((s, l) => s + l.qty, 0),
      };
    }),

  add: publicProcedure
    .input(
      z.object({
        productId: z.uuid(),
        variantId: z.uuid().optional().nullable(),
        qty: z.number().int().min(1).max(20).default(1),
        guestToken: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const product = await q.getProductById(input.productId);
      if (!product || product.status !== "active") {
        throw new TRPCError({ code: "NOT_FOUND", message: "This product is no longer available" });
      }
      if (product.stock < input.qty) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Only ${product.stock} left in stock` });
      }
      const { cart } = await resolveCart(ctx, input.guestToken);

      // Price is resolved server-side; a client-supplied price is never trusted.
      let unit = effectivePrice(product.price, product.discountPrice);
      if (input.variantId) {
        const variant = (await q.getProductVariants(product.id)).find((v) => v.id === input.variantId);
        if (!variant) throw new TRPCError({ code: "BAD_REQUEST", message: "That option is not available" });
        unit += Number(variant.priceDelta);
      }

      await q.addCartItem({
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId ?? null,
        qty: input.qty,
        unitPrice: unit.toFixed(2),
      });
      return { ok: true, count: await q.countCartItems(cart.id) };
    }),

  setQty: publicProcedure
    .input(z.object({ itemId: z.uuid(), qty: z.number().int().min(0).max(20), guestToken: z.string().optional().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { cart } = await resolveCart(ctx, input.guestToken);
      await q.setCartItemQty(cart.id, input.itemId, input.qty);
      return { ok: true, count: await q.countCartItems(cart.id) };
    }),

  remove: publicProcedure
    .input(z.object({ itemId: z.uuid(), guestToken: z.string().optional().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { cart } = await resolveCart(ctx, input.guestToken);
      await q.removeCartItem(cart.id, input.itemId);
      return { ok: true, count: await q.countCartItems(cart.id) };
    }),

  clear: publicProcedure
    .input(z.object({ guestToken: z.string().optional().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { cart } = await resolveCart(ctx, input.guestToken);
      await q.clearCart(cart.id);
      return { ok: true };
    }),

  mergeGuest: protectedProcedure
    .input(z.object({ guestToken: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      await q.mergeGuestCartIntoUser(input.guestToken, ctx.user.id);
      const cart = await q.getOrCreateUserCart(ctx.user.id);
      return { ok: true, count: await q.countCartItems(cart.id) };
    }),
});

// ── wishlist ─────────────────────────────────────────────────────────────────
const wishlistRouter = router({
  list: protectedProcedure.query(({ ctx }) => q.listWishlist(ctx.user.id)),
  toggle: protectedProcedure.input(z.object({ productId: z.uuid() })).mutation(async ({ ctx, input }) => {
    const ids = await q.wishlistIds(ctx.user.id);
    if (ids.includes(input.productId)) {
      await q.removeWishlist(ctx.user.id, input.productId);
      return { ok: true, added: false };
    }
    await q.addWishlist(ctx.user.id, input.productId);
    return { ok: true, added: true };
  }),
});

// ── checkout / orders ────────────────────────────────────────────────────────
const ordersRouter = router({
  /** Create an order from the server-held cart. Prices and stock are re-verified. */
  create: publicProcedure
    .input(
      z.object({
        guestToken: z.string().optional().nullable(),
        guestName: z.string().optional(),
        guestPhone: z.string().optional(),
        guestEmail: z.string().optional(),
        addressId: z.uuid().optional().nullable(),
        address: z
          .object({
            fullName: z.string().min(2),
            phone: z.string().min(7),
            state: z.string().min(2),
            city: z.string().min(1),
            street: z.string().min(3),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      rateLimit(`order:${ctx.user?.id ?? input.guestToken ?? "anon"}`, 20, 60_000);

      const { cart } = await resolveCart(ctx, input.guestToken);
      const lines = await q.getCartLines(cart.id);
      if (lines.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Your cart is empty" });

      // Stock re-check against the live table (the cart may be stale).
      for (const line of lines) {
        if (line.status !== "active") {
          throw new TRPCError({ code: "BAD_REQUEST", message: `"${line.name}" is no longer available` });
        }
        if (line.stock < line.qty) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Only ${line.stock} of "${line.name}" left in stock` });
        }
      }

      const subtotal = lines.reduce((s, l) => s + Number(l.unitPrice) * l.qty, 0);
      const deliveryFee = deliveryFeeFor(subtotal);
      const total = subtotal + deliveryFee;

      // Resolve the delivery address (saved address or inline guest details).
      let snapshot: string;
      let guestName: string | null = null;
      let guestPhone: string | null = null;
      if (ctx.user && input.addressId) {
        const [addr] = (await q.listAddresses(ctx.user.id)).filter((a) => a.id === input.addressId);
        if (!addr) throw new TRPCError({ code: "BAD_REQUEST", message: "That delivery address was not found" });
        snapshot = `${addr.fullName} · ${addr.phone} · ${addr.street}, ${addr.city}, ${addr.state}`;
      } else if (input.address) {
        snapshot = `${input.address.fullName} · ${input.address.phone} · ${input.address.street}, ${input.address.city}, ${input.address.state}`;
        guestName = input.address.fullName;
        guestPhone = input.address.phone;
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A delivery address is required" });
      }

      if (!ctx.user && !guestPhone) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Guest orders require a phone number" });
      }

      let order;
      try {
        order = await q.createOrder({
          userId: ctx.user?.id ?? null,
          guestName,
          guestPhone,
          guestEmail: ctx.user ? null : (input.guestEmail ?? null),
          addressSnapshot: snapshot,
          subtotal: subtotal.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          total: total.toFixed(2),
          lines: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            image: l.image,
            unitPrice: l.unitPrice,
            qty: l.qty,
            variant: l.variantLabel,
          })),
        });
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("OUT_OF_STOCK:")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${e.message.replace("OUT_OF_STOCK:", "")} just sold out. Please adjust your cart.`,
          });
        }
        throw e;
      }

      await q.clearCart(cart.id);

      // Notify the customer (if any) and the admin team.
      if (ctx.user) {
        await q.createNotification({
          userId: ctx.user.id,
          audience: "customer",
          type: "order_placed",
          title: `Order ${order.orderNumber} placed`,
          body: `We've received your order for ${lines.length} item(s). Complete your bank transfer to start processing.`,
          link: `/order/${order.orderNumber}`,
        });
      }
      await q.createNotification({
        audience: "admin",
        type: "new_order",
        title: `New order ${order.orderNumber}`,
        body: `${guestName ?? ctx.user?.name ?? "A customer"} placed an order worth ₦${total.toLocaleString("en-NG")}.`,
        link: "/admin/orders",
      });

      return { orderNumber: order.orderNumber, total: order.total };
    }),

  byNumber: publicProcedure.input(z.object({ orderNumber: z.string() })).query(async ({ ctx, input }) => {
    const order = await q.getOrderByNumber(input.orderNumber);
    if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    // A logged-in customer may only open their own order.
    if (order.userId && order.userId !== ctx.user?.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this order" });
    }
    return order;
  }),

  /** Lightweight poll target for the standalone payment-status tab. */
  status: publicProcedure.input(z.object({ orderNumber: z.string() })).query(async ({ input }) => {
    const order = await q.getOrderByNumber(input.orderNumber);
    if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      latestPayment: order.payments[0] ?? null,
    };
  }),

  myOrders: protectedProcedure.query(({ ctx }) => q.listOrdersByUser(ctx.user.id)),

  cancel: protectedProcedure.input(z.object({ id: z.uuid() })).mutation(async ({ ctx, input }) => {
    const row = await q.cancelOrder(input.id, ctx.user.id);
    if (!row) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This order can no longer be cancelled" });
    }
    await q.createNotification({
      userId: ctx.user.id,
      audience: "customer",
      type: "order_cancelled",
      title: `Order ${row.orderNumber} cancelled`,
      body: "Your order has been cancelled.",
      link: `/order/${row.orderNumber}`,
    });
    return { ok: true };
  }),
});

// ── payments ─────────────────────────────────────────────────────────────────
const paymentsRouter = router({
  /** Bank details for the payment modal — always read live from the database. */
  settings: publicProcedure.query(() => q.getPaymentSettings()),

  submit: publicProcedure
    .input(
      z.object({
        orderNumber: z.string().min(3),
        reference: z.string().min(4, "Enter the transaction reference from your bank alert"),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      rateLimit(`pay:${input.orderNumber}`, 8, 60_000);
      const order = await q.getOrderByNumber(input.orderNumber);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      if (order.userId && order.userId !== ctx.user?.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this order" });
      }
      if (order.paymentStatus === "paid") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This order is already paid" });
      }

      const payment = await q.createPayment({
        orderId: order.id,
        // Guest payments carry no user id — the order is the link.
        userId: order.userId ?? null,
        amount: order.total,
        reference: input.reference.trim(),
        note: input.note?.trim() || null,
      });

      await q.updateOrderStatus(order.id, "payment_verification");
      await q.setOrderPaymentStatus(order.id, "awaiting");

      if (order.userId) {
        await q.createNotification({
          userId: order.userId,
          audience: "customer",
          type: "payment_submitted",
          title: `Payment reference received for ${order.orderNumber}`,
          body: `Reference ${input.reference.trim()} is awaiting verification. We'll notify you as soon as it's approved.`,
          link: `/payment-status/${order.orderNumber}`,
        });
      }
      await q.createNotification({
        audience: "admin",
        type: "payment_needs_verification",
        title: `Payment needs verification — ${order.orderNumber}`,
        body: `Reference ${input.reference.trim()} for ₦${Number(order.total).toLocaleString("en-NG")} is waiting for review.`,
        link: "/admin/payments",
      });

      return { ok: true, paymentId: payment.id };
    }),
});

// ── account ──────────────────────────────────────────────────────────────────
const accountRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const [profile, addresses, orders] = await Promise.all([
      q.getProfile(ctx.user.id),
      q.listAddresses(ctx.user.id),
      q.listOrdersByUser(ctx.user.id),
    ]);
    return { user: ctx.user, profile, addresses, orders };
  }),

  updateProfile: protectedProcedure
    .input(z.object({ fullName: z.string().min(2), phone: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const phone = input.phone ? normalizePhone(input.phone) : null;
      try {
        await q.upsertProfile(ctx.user.id, { fullName: input.fullName, phone });
      } catch (e) {
        if (isUniqueViolation(e)) {
          throw new TRPCError({ code: "CONFLICT", message: "That phone number is already used by another account" });
        }
        throw e;
      }
      await q.updateUserName(ctx.user.id, input.fullName);
      return { ok: true };
    }),

  addresses: protectedProcedure.query(({ ctx }) => q.listAddresses(ctx.user.id)),

  addAddress: protectedProcedure
    .input(
      z.object({
        label: z.string().default("Home"),
        fullName: z.string().min(2),
        phone: z.string().min(7),
        state: z.string().min(2),
        city: z.string().min(1),
        street: z.string().min(3),
        isDefault: z.boolean().default(false),
      }),
    )
    .mutation(({ ctx, input }) => q.createAddress({ ...input, userId: ctx.user.id })),

  updateAddress: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        label: z.string().optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        street: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const row = await q.updateAddress(id, ctx.user.id, rest);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Address not found" });
      return row;
    }),

  deleteAddress: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(({ ctx, input }) => q.deleteAddress(input.id, ctx.user.id)),
});

// ── notifications ────────────────────────────────────────────────────────────
const notificationsRouter = router({
  list: protectedProcedure.query(({ ctx }) => q.listNotifications(ctx.user.id)),
  unreadCount: protectedProcedure.query(({ ctx }) => q.unreadCount(ctx.user.id)),
  markRead: protectedProcedure.input(z.object({ id: z.uuid() })).mutation(({ ctx, input }) => q.markNotificationRead(input.id, ctx.user.id)),
  markAllRead: protectedProcedure.mutation(({ ctx }) => q.markAllNotificationsRead(ctx.user.id)),
});

// ── admin ────────────────────────────────────────────────────────────────────
const adminRouter = router({
  dashboard: adminProcedure.query(async () => {
    const [stats, series, categories, orders, activity, lowStock] = await Promise.all([
      q.dashboardStats(),
      q.salesSeries(14),
      q.topCategories(6),
      q.recentOrders(8),
      q.recentActivity(10),
      q.lowStockProducts(10, 8),
    ]);
    const unread = await q.unreadAdminCount();
    return { stats, series, categories, recentOrders: orders, activity, lowStock, unread };
  }),

  // products
  products: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        categorySlug: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).optional(),
        pageSize: z.number().int().min(1).max(60).optional(),
      }),
    )
    .query(async ({ input }) => {
      const res = await q.listProducts({
        search: input.search,
        categorySlug: input.categorySlug,
        page: input.page,
        pageSize: input.pageSize ?? 25,
        includeInactive: true,
        sort: "newest",
      });
      const filtered = input.status ? res.items.filter((p) => p.status === input.status) : res.items;
      return { ...res, items: filtered };
    }),

  product: adminProcedure.input(z.object({ id: z.uuid() })).query(async ({ input }) => {
    const [row] = await Promise.all([q.getProductById(input.id)]);
    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    const [images, variants] = await Promise.all([q.getProductImages(row.id), q.getProductVariants(row.id)]);
    return { ...row, images, variants };
  }),

  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().optional(),
        description: z.string().default(""),
        categoryId: z.uuid().nullable().optional(),
        subcategory: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price"),
        discountPrice: z.string().nullable().optional(),
        stock: z.number().int().min(0),
        status: z.enum(["active", "draft", "archived"]).default("active"),
        featured: z.boolean().default(false),
        images: z.array(z.string()).default([]),
        variants: z.array(z.object({ type: z.string(), value: z.string(), priceDelta: z.string().optional(), stock: z.number().optional() })).default([]),
      }),
    )
    .mutation(async ({ input }) => {
      const slug = input.slug?.trim() || slugify(input.name);
      try {
        return await q.createProduct({ ...input, slug, categoryId: input.categoryId ?? null });
      } catch (e) {
        if (isUniqueViolation(e)) throw new TRPCError({ code: "CONFLICT", message: "A product with that slug already exists" });
        throw e;
      }
    }),

  updateProduct: adminProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(2).optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.uuid().nullable().optional(),
        subcategory: z.string().nullable().optional(),
        price: z.string().optional(),
        discountPrice: z.string().nullable().optional(),
        stock: z.number().int().min(0).optional(),
        status: z.enum(["active", "draft", "archived"]).optional(),
        featured: z.boolean().optional(),
        images: z.array(z.string()).optional(),
        variants: z.array(z.object({ type: z.string(), value: z.string(), priceDelta: z.string().optional(), stock: z.number().optional() })).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      try {
        const row = await q.updateProduct(id, rest);
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        return row;
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        if (isUniqueViolation(e)) throw new TRPCError({ code: "CONFLICT", message: "A product with that slug already exists" });
        throw e;
      }
    }),

  deleteProduct: adminProcedure.input(z.object({ id: z.uuid() })).mutation(({ input }) => q.deleteProduct(input.id)),

  // categories
  categories: adminProcedure.query(() => q.listCategoriesWithCounts()),

  createCategory: adminProcedure
    .input(z.object({ name: z.string().min(2), description: z.string().optional(), image: z.string().optional(), sortOrder: z.number().int().optional() }))
    .mutation(async ({ input }) => {
      try {
        return await q.createCategory({ ...input, slug: slugify(input.name) });
      } catch (e) {
        if (isUniqueViolation(e)) throw new TRPCError({ code: "CONFLICT", message: "A category with that name already exists" });
        throw e;
      }
    }),

  updateCategory: adminProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(2),
        description: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...rest } = input;
      return q.updateCategory(id, { ...rest, slug: slugify(input.name) });
    }),

  deleteCategory: adminProcedure.input(z.object({ id: z.uuid() })).mutation(({ input }) => q.deleteCategory(input.id)),

  // orders
  orders: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).optional(),
        pageSize: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(({ input }) => q.listOrdersAdmin(input)),

  setOrderStatus: adminProcedure
    .input(z.object({ id: z.uuid(), status: z.enum(ORDER_STATUSES) }))
    .mutation(async ({ input }) => {
      const row = await q.updateOrderStatus(input.id, input.status);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      if (row.userId) {
        const label = input.status.replace(/_/g, " ");
        await q.createNotification({
          userId: row.userId,
          audience: "customer",
          type: "order_status",
          title: `Order ${row.orderNumber} is now ${label}`,
          body: `Your order status was updated to "${label}".`,
          link: `/order/${row.orderNumber}`,
        });
      }
      return row;
    }),

  // payments
  payments: adminProcedure
    .input(z.object({ status: z.string().optional(), page: z.number().int().min(1).optional() }))
    .query(({ input }) => q.listPaymentsAdmin(input)),

  approvePayment: adminProcedure
    .input(z.object({ id: z.uuid(), adminNote: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const row = await q.approvePayment(input.id, ctx.user.id, input.adminNote ?? null);
      if (!row) {
        throw new TRPCError({ code: "CONFLICT", message: "This payment was already decided — refresh to see the current state." });
      }
      const order = await q.getOrderById(row.orderId);
      if (order?.userId) {
        await q.createNotification({
          userId: order.userId,
          audience: "customer",
          type: "payment_approved",
          title: `Payment approved for ${order.orderNumber}`,
          body: "Your bank transfer has been verified. We're preparing your order now.",
          link: `/payment-status/${order.orderNumber}`,
        });
      }
      return row;
    }),

  rejectPayment: adminProcedure
    .input(z.object({ id: z.uuid(), adminNote: z.string().min(3, "Add a note so the customer knows what to fix") }))
    .mutation(async ({ ctx, input }) => {
      const row = await q.rejectPayment(input.id, ctx.user.id, input.adminNote);
      if (!row) {
        throw new TRPCError({ code: "CONFLICT", message: "This payment was already decided — refresh to see the current state." });
      }
      const order = await q.getOrderById(row.orderId);
      if (order?.userId) {
        await q.createNotification({
          userId: order.userId,
          audience: "customer",
          type: "payment_rejected",
          title: `Payment could not be verified for ${order.orderNumber}`,
          body: `Reason: ${input.adminNote}. You can submit a corrected reference from your order page.`,
          link: `/order/${order.orderNumber}`,
        });
      }
      return row;
    }),

  // payment settings
  paymentSettings: adminProcedure.query(() => q.getPaymentSettings()),

  updatePaymentSettings: adminProcedure
    .input(
      z.object({
        bankName: z.string().min(2),
        accountName: z.string().min(2),
        accountNumber: z.string().min(6),
        instructions: z.string().default(""),
      }),
    )
    .mutation(({ input }) => q.updatePaymentSettings(input)),

  // users
  users: adminProcedure
    .input(z.object({ search: z.string().optional(), page: z.number().int().min(1).optional() }))
    .query(({ input }) => q.listUsersAdmin(input)),

  setUserRole: adminProcedure
    .input(z.object({ id: z.uuid(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id && input.role === "user") {
        const admins = await q.countAdmins();
        if (admins <= 1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You are the last administrator — promote someone else first." });
        }
      }
      const row = await q.setUserRole(input.id, input.role);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return { ok: true };
    }),

  setUserSuspended: adminProcedure
    .input(z.object({ id: z.uuid(), suspended: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id && input.suspended) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot suspend your own account." });
      }
      await q.setUserSuspended(input.id, input.suspended);
      return { ok: true };
    }),

  // notifications
  notifications: adminProcedure.query(() => q.listAdminNotifications()),
  markNotificationsRead: adminProcedure.mutation(() => q.markAdminNotificationsRead()),

  // media library (product images uploaded through the platform storage seam)
  uploadUrl: adminProcedure
    .input(z.object({ name: z.string().min(1), contentType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const key = `${crypto.randomUUID()}-${sanitizeBasename(input.name)}`;
      try {
        const { uploadUrl, publicPath } = await storagePutUrl(key, input.contentType, { ownerId: ctx.user.id });
        return { key, uploadUrl, publicPath };
      } catch (e) {
        if (e instanceof StorageError && e.code === "failed") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "That image type is not accepted (use PNG, JPEG, WEBP or AVIF)." });
        }
        throw e;
      }
    }),

  commitUpload: adminProcedure
    .input(z.object({ key: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await storageCommit(input.key, { ownerId: ctx.user.id, name: input.name });
      } catch (e) {
        if (e instanceof StorageError && e.code === "not_found") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found — did the file finish uploading?" });
        }
        throw e;
      }
    }),

  media: adminProcedure.query(async () => {
    const rows = await storageListAll({ limit: 60 });
    return rows.map((r) => ({ id: r.id, key: r.key, name: r.name, url: `/app-storage/${r.key}`, createdAt: r.createdAt }));
  }),

  deleteMedia: adminProcedure.input(z.object({ key: z.string().min(1) })).mutation(async ({ input }) => {
    try {
      return { ok: await storageDeleteAny(input.key) };
    } catch (e) {
      if (e instanceof StorageError) throw new TRPCError({ code: "BAD_REQUEST", message: "That file could not be removed" });
      throw e;
    }
  }),
});

// Caller-supplied filenames are sanitized before they become part of a storage
// key: only the last path segment survives, restricted to [A-Za-z0-9._-].
export function sanitizeBasename(name: string): string {
  const last = name.split(/[/\\]/).pop() ?? "";
  const dot = last.lastIndexOf(".");
  const rawStem = dot > 0 ? last.slice(0, dot) : last;
  const rawExt = dot > 0 ? last.slice(dot + 1) : "";
  const stem = rawStem.replace(/[^A-Za-z0-9._-]/g, "").replace(/^\.+/, "") || "upload";
  const ext = rawExt.replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
  return ext ? `${stem}.${ext}` : stem;
}

export const appRouter = router({
  auth: authRouter,
  catalog: catalogRouter,
  cart: cartRouter,
  wishlist: wishlistRouter,
  orders: ordersRouter,
  payments: paymentsRouter,
  account: accountRouter,
  notifications: notificationsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
