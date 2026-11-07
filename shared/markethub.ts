// Shared MarketHub domain constants + helpers (client ↔ server).

export const CURRENCY = "NGN";

/** Format an NGN amount. Accepts a number or a numeric string (Drizzle numeric). */
export function formatNaira(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `₦${safe.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Discount percentage from original + discounted price, or 0 when none. */
export function discountPercent(
  price: number | string,
  discountPrice: number | string | null | undefined,
): number {
  const p = Number(price);
  const d = discountPrice == null ? NaN : Number(discountPrice);
  if (!Number.isFinite(p) || !Number.isFinite(d) || p <= 0 || d >= p) return 0;
  return Math.round(((p - d) / p) * 100);
}

/** The price a customer actually pays. */
export function effectivePrice(
  price: number | string,
  discountPrice: number | string | null | undefined,
): number {
  const p = Number(price);
  const d = discountPrice == null ? NaN : Number(discountPrice);
  return Number.isFinite(d) && d > 0 && d < p ? d : p;
}

export const ORDER_STATUSES = [
  "pending_payment",
  "payment_verification",
  "paid",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  payment_verification: "Payment Verification",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUSES = ["unpaid", "awaiting", "paid", "rejected"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  awaiting: "Awaiting Verification",
  paid: "Paid",
  rejected: "Rejected",
};

export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** Nigerian states for the address form. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

/** Flat delivery fee in NGN, waived above the free-delivery threshold. */
export const DELIVERY_FEE = 2500;
export const FREE_DELIVERY_THRESHOLD = 100000;

export function deliveryFeeFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

/** Normalize a Nigerian phone number to digits only (e.g. 08012345678). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return `0${digits.slice(3)}`;
  return digits;
}

/** A URL-safe slug from a product/category name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
