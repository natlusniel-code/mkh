import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { ProductImage } from "@/components/ProductCard";
import { PAYMENT_STATUS_LABELS, formatNaira } from "@shared/markethub";
import type { PaymentStatus } from "@shared/markethub";

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone?: "default" | "amber" | "success" | "destructive";
}) {
  const tones: Record<string, string> = {
    default: "bg-primary-soft text-primary",
    amber: "bg-amber/15 text-amber",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="mh-caption">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const query = trpc.admin.dashboard.useQuery();

  if (query.isLoading) return <LoadingState label="Loading dashboard…" />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  const d = query.data!;
  const s = d.stats;
  const maxRevenue = Math.max(1, ...d.series.map((p) => p.revenue));
  const maxCat = Math.max(1, ...d.categories.map((c) => c.productCount));

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Live figures straight from the database — orders, revenue, payments and stock." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatNaira(s.totalRevenue)} hint={`${s.completedPayments} verified payments`} icon={<TrendingUp className="h-4 w-4" />} tone="success" />
        <StatCard label="Orders" value={String(s.totalOrders)} hint={`${s.pendingOrders} awaiting payment`} icon={<ShoppingBag className="h-4 w-4" />} />
        <StatCard label="Payments to verify" value={String(s.pendingPayments)} hint={`${s.rejectedPayments} rejected`} icon={<CreditCard className="h-4 w-4" />} tone={s.pendingPayments > 0 ? "amber" : "default"} />
        <StatCard label="Customers" value={String(s.totalCustomers)} hint={`${s.totalProducts} products live`} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Revenue — last 14 days</h2>
            <Badge variant="muted">NGN</Badge>
          </div>
          <div className="mt-5 flex h-40 items-end gap-1.5">
            {d.series.map((p) => (
              <div key={p.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${p.day}: ${formatNaira(p.revenue)} · ${p.orders} orders`}>
                <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {p.orders}
                </span>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary/60 to-primary transition-all"
                  style={{ height: `${Math.max(2, (p.revenue / maxRevenue) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{d.series[0]?.day}</span>
            <span>{d.series[d.series.length - 1]?.day}</span>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Products by category</h2>
          <ul className="mt-4 space-y-3">
            {d.categories.map((c) => (
              <li key={c.slug}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{c.productCount} · {c.sold} sold</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet" style={{ width: `${(c.productCount / maxCat) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              All orders <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {d.recentOrders.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No orders yet" description="Orders placed in the store will appear here." />
            </div>
          ) : (
            <ul className="mt-3 divide-y">
              {d.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link to="/admin/orders" className="text-sm font-medium hover:text-primary">{o.orderNumber}</Link>
                    <p className="truncate text-xs text-muted-foreground">{o.buyerEmail ?? o.guestName ?? "Guest"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={o.paymentStatus === "paid" ? "success" : o.paymentStatus === "rejected" ? "destructive" : "amber"}>
                      {PAYMENT_STATUS_LABELS[o.paymentStatus as PaymentStatus] ?? o.paymentStatus}
                    </Badge>
                    <span className="text-sm font-semibold">{formatNaira(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber" /> Low stock
            </h2>
            <Link to="/admin/products" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {d.lowStock.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Stock levels are healthy" description="No active product is at or below 8 units." />
            </div>
          ) : (
            <ul className="mt-3 divide-y">
              {d.lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                    <ProductImage src={p.image} alt={p.name} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <Badge variant={p.stock === 0 ? "destructive" : "amber"}>{p.stock} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Recent activity</h2>
        {d.activity.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nothing yet" description="New orders and payment submissions will show up here." />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {d.activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl border p-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Package className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.body ? <p className="text-xs text-muted-foreground">{a.body}</p> : null}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{new Date(a.createdAt).toLocaleString("en-NG")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
