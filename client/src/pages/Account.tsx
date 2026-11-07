import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  Bell,
  Check,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { NIGERIAN_STATES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatNaira } from "@shared/markethub";
import type { OrderStatus, PaymentStatus } from "@shared/markethub";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

/** Temu-style order status shortcuts shown under the profile header. */
const ORDER_SHORTCUTS = [
  { key: "all", label: "All orders", icon: ShoppingBag, statuses: null as string[] | null },
  { key: "to_pay", label: "To pay", icon: Wallet, statuses: ["pending_payment", "payment_verification"] },
  { key: "to_ship", label: "To ship", icon: Package, statuses: ["paid", "processing"] },
  { key: "to_receive", label: "To receive", icon: Truck, statuses: ["shipped"] },
  { key: "reviews", label: "Reviews", icon: Heart, statuses: ["delivered"] },
] as const;

export default function Account() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useStore();
  const utils = trpc.useUtils();

  const tab = (new URLSearchParams(search).get("tab") ?? "profile") as (typeof TABS)[number]["id"];
  const overview = trpc.account.overview.useQuery(undefined, { enabled: Boolean(user) });
  const notifications = trpc.notifications.list.useQuery(undefined, { enabled: Boolean(user) });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [addr, setAddr] = useState({ label: "Home", fullName: "", phone: "", state: "Lagos", city: "", street: "", isDefault: false });

  if (overview.data && !hydrated) {
    setFullName(overview.data.profile?.fullName ?? overview.data.user?.name ?? "");
    setPhone(overview.data.profile?.phone ?? "");
    setHydrated(true);
  }

  const profileM = trpc.account.updateProfile.useMutation({
    onSuccess: async () => {
      toast("Profile updated");
      await Promise.all([utils.account.overview.invalidate(), utils.auth.me.invalidate()]);
    },
    onError: (e) => toast(e.message, "error"),
  });
  const addAddrM = trpc.account.addAddress.useMutation({
    onSuccess: async () => {
      toast("Address saved");
      setShowAddress(false);
      setAddr({ label: "Home", fullName: "", phone: "", state: "Lagos", city: "", street: "", isDefault: false });
      await utils.account.overview.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });
  const delAddrM = trpc.account.deleteAddress.useMutation({
    onSuccess: async () => {
      toast("Address removed");
      await utils.account.overview.invalidate();
    },
  });
  const markAllM = trpc.notifications.markAllRead.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.notifications.list.invalidate(), utils.auth.session.invalidate()]);
    },
  });
  const cancelM = trpc.orders.cancel.useMutation({
    onSuccess: async () => {
      toast("Order cancelled");
      await utils.account.overview.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });

  if (!user) return null;

  const orders = overview.data?.orders ?? [];
  const unread = (notifications.data ?? []).filter((n) => !n.read).length;
  const displayName = overview.data?.profile?.fullName ?? overview.data?.user?.name ?? user.email.split("@")[0];
  const initial = (displayName || "U").slice(0, 1).toUpperCase();

  function countFor(statuses: readonly string[] | null) {
    if (!statuses) return orders.length;
    return orders.filter((o) => statuses.includes(o.status)).length;
  }

  return (
    <div className="mh-container py-6 pb-16">
      {/* Temu-style profile header (change 9) */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-primary to-violet text-white shadow-sm">
        <div className="flex items-center gap-4 p-6 sm:p-8">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur ring-2 ring-white/40">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{displayName}</h1>
            <p className="truncate text-sm text-white/80">{user.email}</p>
            {overview.data?.profile?.phone ? (
              <p className="truncate text-xs text-white/70">{overview.data.profile.phone}</p>
            ) : null}
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden border-white/40 bg-transparent text-white hover:bg-white/10 sm:inline-flex"
          >
            <Link to="/account?tab=profile"><Settings className="h-4 w-4" /> Edit</Link>
          </Button>
        </div>

        <div className="grid grid-cols-5 border-t border-white/15 bg-black/10">
          {ORDER_SHORTCUTS.map((s) => {
            const Icon = s.icon;
            const n = countFor(s.statuses);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => navigate("/account?tab=orders")}
                className="flex flex-col items-center gap-1 px-1 py-3 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/10"
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {n > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-amber-foreground">
                      {n > 9 ? "9+" : n}
                    </span>
                  ) : null}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Temu-style menu list */}
        <nav className="space-y-1 rounded-2xl border bg-card p-2 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            const badge = t.id === "notifications" ? unread : 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate(`/account?tab=${t.id}`)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-primary-soft text-primary" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{t.label}</span>
                {badge > 0 ? <Badge variant="amber">{badge}</Badge> : null}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
          <Link
            to="/wishlist"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Heart className="h-4 w-4" />
            <span className="flex-1 text-left">Wishlist</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="flex-1 text-left">Log out</span>
          </button>
        </nav>

        <div>
          {overview.isLoading ? (
            <LoadingState />
          ) : overview.isError ? (
            <ErrorState message={overview.error.message} onRetry={() => overview.refetch()} />
          ) : tab === "profile" ? (
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Profile details</h2>
              <form
                className="mt-4 grid max-w-md gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  profileM.mutate({ fullName, phone: phone || undefined });
                }}
              >
                <div>
                  <Label htmlFor="fn" className="mb-1 block">Full name</Label>
                  <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
                </div>
                <div>
                  <Label htmlFor="ph" className="mb-1 block">Phone</Label>
                  <Input id="ph" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" inputMode="tel" />
                </div>
                <div>
                  <Label className="mb-1 block">Email</Label>
                  <Input value={user.email} disabled />
                </div>
                <Button type="submit" className="w-fit" disabled={profileM.isPending}>
                  {profileM.isPending ? "Saving…" : "Save changes"}
                </Button>
              </form>
            </section>
          ) : tab === "orders" ? (
            <section className="space-y-3">
              {orders.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-6 w-6" />}
                  title="No orders yet"
                  description="When you place an order it appears here with its payment and delivery status."
                  action={<Button asChild><Link to="/products">Start shopping</Link></Button>}
                />
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <Link to={`/order/${o.orderNumber}`} className="font-semibold hover:text-primary">{o.orderNumber}</Link>
                        <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-NG")} · {o.items.length} item(s)</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={o.paymentStatus === "paid" ? "success" : o.paymentStatus === "rejected" ? "destructive" : "amber"}>
                          {PAYMENT_STATUS_LABELS[o.paymentStatus as PaymentStatus] ?? o.paymentStatus}
                        </Badge>
                        <Badge variant="outline">{ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}</Badge>
                        <span className="text-sm font-bold">{formatNaira(o.total)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline"><Link to={`/order/${o.orderNumber}`}>View order</Link></Button>
                      {["pending_payment", "payment_verification", "paid", "processing"].includes(o.status) ? (
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => cancelM.mutate({ id: o.id })}>
                          Cancel order
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </section>
          ) : tab === "addresses" ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Delivery addresses</h2>
                <Button size="sm" onClick={() => setShowAddress((s) => !s)}>
                  <Plus className="h-4 w-4" /> Add address
                </Button>
              </div>

              {showAddress ? (
                <form
                  className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addAddrM.mutate(addr);
                  }}
                >
                  <div>
                    <Label className="mb-1 block">Label</Label>
                    <Input value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} placeholder="Home" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Full name</Label>
                    <Input value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} required minLength={2} />
                  </div>
                  <div>
                    <Label className="mb-1 block">Phone</Label>
                    <Input value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} required inputMode="tel" />
                  </div>
                  <div>
                    <Label className="mb-1 block">State</Label>
                    <Select value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })}>
                      {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">City</Label>
                    <Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} required />
                  </div>
                  <div>
                    <Label className="mb-1 block">Street</Label>
                    <Input value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} required minLength={3} />
                  </div>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" checked={addr.isDefault} onChange={(e) => setAddr({ ...addr, isDefault: e.target.checked })} className="h-4 w-4 accent-[var(--primary)]" />
                    Set as default address
                  </label>
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit" disabled={addAddrM.isPending}>{addAddrM.isPending ? "Saving…" : "Save address"}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddress(false)}>Cancel</Button>
                  </div>
                </form>
              ) : null}

              {(overview.data?.addresses ?? []).length === 0 && !showAddress ? (
                <EmptyState
                  icon={<MapPin className="h-6 w-6" />}
                  title="No saved addresses"
                  description="Save an address to check out faster next time."
                  action={<Button onClick={() => setShowAddress(true)}>Add your first address</Button>}
                />
              ) : (
                (overview.data?.addresses ?? []).map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="text-sm">
                      <p className="flex items-center gap-2 font-medium">
                        {a.fullName}
                        <Badge variant="muted">{a.label}</Badge>
                        {a.isDefault ? <Badge variant="default"><Check className="h-3 w-3" /> Default</Badge> : null}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">{a.phone} · {a.street}, {a.city}, {a.state}</p>
                    </div>
                    <button type="button" onClick={() => delAddrM.mutate({ id: a.id })} className="text-muted-foreground hover:text-destructive" aria-label="Delete address">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </section>
          ) : (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Notifications</h2>
                {(notifications.data ?? []).some((n) => !n.read) ? (
                  <Button size="sm" variant="outline" onClick={() => markAllM.mutate()}>Mark all read</Button>
                ) : null}
              </div>
              {notifications.isLoading ? (
                <LoadingState />
              ) : (notifications.data ?? []).length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-6 w-6" />}
                  title="No notifications yet"
                  description="Order updates and payment confirmations will show up here."
                />
              ) : (
                (notifications.data ?? []).map((n) => (
                  <div key={n.id} className={cn("rounded-2xl border bg-card p-4 shadow-sm", !n.read && "border-primary/40 bg-primary-soft/40")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{n.title}</p>
                        {n.body ? <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p> : null}
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("en-NG")}</p>
                      </div>
                      {n.link ? <Button asChild size="sm" variant="outline"><Link to={n.link}>Open</Link></Button> : null}
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
