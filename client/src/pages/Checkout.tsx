import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ProductCard";
import { EmptyState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { guestToken } from "@/lib/guest";
import { NIGERIAN_STATES, formatNaira } from "@shared/markethub";
import { cn } from "@/lib/utils";

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartLoading, toast } = useStore();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const addresses = trpc.account.addresses.useQuery(undefined, { enabled: Boolean(user) });
  const [addressId, setAddressId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", state: "Lagos", city: "", street: "" });
  const [guestEmail, setGuestEmail] = useState("");

  const createM = trpc.orders.create.useMutation({
    onSuccess: async (res) => {
      await utils.cart.get.invalidate();
      toast(`Order ${res.orderNumber} created`);
      navigate(`/order/${res.orderNumber}`);
    },
    onError: (e) => toast(e.message, "error"),
  });

  if (cartLoading) return <LoadingState label="Preparing checkout…" />;

  if (cart.lines.length === 0) {
    return (
      <div className="mh-container py-10 pb-16">
        <h1 className="mh-page-title">Checkout</h1>
        <div className="mt-6">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Nothing to check out"
            description="Your cart is empty. Add a few products and come back to complete your order."
            action={<Button asChild><Link to="/products">Browse products</Link></Button>}
          />
        </div>
      </div>
    );
  }

  const saved = addresses.data ?? [];
  const chosen = addressId ?? saved.find((a) => a.isDefault)?.id ?? saved[0]?.id ?? null;
  const canSubmit = user
    ? Boolean(chosen)
    : form.fullName.length > 1 && form.phone.length > 6 && form.city.length > 0 && form.street.length > 2;

  function submit() {
    if (user) {
      createM.mutate({ addressId: chosen, guestToken: null });
    } else {
      createM.mutate({ guestToken: guestToken(), address: form, guestEmail: guestEmail || undefined });
    }
  }

  return (
    <div className="mh-container py-6 pb-16">
      <h1 className="mh-page-title">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {user ? "Choose a delivery address, then place your order." : "No account needed — enter your delivery details below."}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" /> Delivery details
            </h2>

            {user ? (
              saved.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    title="No saved addresses"
                    description="Add a delivery address to your account, then return here to check out."
                    action={<Button asChild><Link to="/account?tab=addresses">Add an address</Link></Button>}
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {saved.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                        chosen === a.id ? "border-primary bg-primary-soft" : "hover:bg-muted/50",
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={chosen === a.id}
                        onChange={() => setAddressId(a.id)}
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                      />
                      <span className="text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          {a.fullName}
                          <Badge variant="muted">{a.label}</Badge>
                          {a.isDefault ? <Badge variant="default">Default</Badge> : null}
                        </span>
                        <span className="mt-0.5 block text-muted-foreground">
                          {a.phone} · {a.street}, {a.city}, {a.state}
                        </span>
                      </span>
                    </label>
                  ))}
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/account?tab=addresses">Manage addresses</Link>
                  </Button>
                </div>
              )
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="fn" className="mb-1 block">Full name</Label>
                  <Input id="fn" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Ada Obi" />
                </div>
                <div>
                  <Label htmlFor="ph" className="mb-1 block">Phone</Label>
                  <Input id="ph" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08012345678" inputMode="tel" />
                </div>
                <div>
                  <Label htmlFor="em" className="mb-1 block">Email (optional)</Label>
                  <Input id="em" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="st" className="mb-1 block">State</Label>
                  <Select id="st" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ct" className="mb-1 block">City</Label>
                  <Input id="ct" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ikeja" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="sr" className="mb-1 block">Street address</Label>
                  <Input id="sr" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="12 Allen Avenue" />
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link> to save this address and track your order in your account.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 text-primary" /> Payment method
            </h2>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary bg-primary-soft p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Bank transfer (manual verification)</p>
                <p className="mt-0.5 text-muted-foreground">
                  After placing your order you'll see our bank details. Transfer the exact total, then submit your transaction
                  reference — our team verifies it, usually within a few hours.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Order summary</h2>
            <ul className="mt-3 space-y-3">
              {cart.lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <ProductImage src={l.image} alt={l.name} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm">{l.name}</span>
                    <span className="text-xs text-muted-foreground">Qty {l.qty}</span>
                  </span>
                  <span className="text-sm font-medium">{formatNaira(Number(l.unitPrice) * l.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">{formatNaira(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium">{cart.deliveryFee === 0 ? "Free" : formatNaira(cart.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-extrabold">{formatNaira(cart.total)}</dd>
              </div>
            </dl>
            <Button size="lg" className="mt-4 w-full" disabled={!canSubmit || createM.isPending} onClick={submit}>
              {createM.isPending ? "Placing order…" : "Place order"}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">You'll get our bank details on the next screen.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
