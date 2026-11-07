import { useState } from "react";
import { Link, useParams } from "wouter";
import { CheckCircle2, Copy, Landmark, Package, ShieldCheck } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ProductImage } from "@/components/ProductCard";
import { EmptyState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatNaira } from "@shared/markethub";
import type { OrderStatus, PaymentStatus } from "@shared/markethub";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const query = trpc.orders.byNumber.useQuery({ orderNumber: orderNumber ?? "" }, { enabled: Boolean(orderNumber) });
  const settings = trpc.payments.settings.useQuery();

  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const submitM = trpc.payments.submit.useMutation({
    onSuccess: async () => {
      toast("Reference submitted — awaiting verification");
      setOpen(false);
      setReference("");
      setNote("");
      await utils.orders.byNumber.invalidate({ orderNumber: orderNumber ?? "" });
    },
    onError: (e) => toast(e.message, "error"),
  });

  if (query.isLoading) return <LoadingState label="Loading your order…" />;
  if (query.isError) {
    return (
      <div className="mh-container py-10">
        <EmptyState
          title="Order not found"
          description="We couldn't find that order. Check the order number, or log in to see your order history."
          action={<Button asChild><Link to="/account?tab=orders">My orders</Link></Button>}
        />
      </div>
    );
  }

  const order = query.data!;
  const s = settings.data;
  const paid = order.paymentStatus === "paid";
  const awaiting = order.paymentStatus === "awaiting";

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    toast("Copied to clipboard");
  }

  return (
    <div className="mh-container py-6 pb-16">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Order placed</h1>
              <p className="text-sm text-muted-foreground">
                Order <span className="font-semibold text-foreground">{order.orderNumber}</span> · {new Date(order.createdAt).toLocaleString("en-NG")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={paid ? "success" : awaiting ? "amber" : "muted"}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ?? order.paymentStatus}
            </Badge>
            <Badge variant="outline">{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</Badge>
          </div>
        </div>

        {!paid ? (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary-soft p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Landmark className="h-4 w-4 text-primary" /> Complete your bank transfer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Transfer <span className="font-semibold text-foreground">{formatNaira(order.total)}</span> to the account below, then submit your transaction reference.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Bank", value: s?.bankName ?? "—" },
                { label: "Account name", value: s?.accountName ?? "—" },
                { label: "Account number", value: s?.accountNumber ?? "—" },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border bg-background p-3">
                  <dt className="mh-caption">{row.label}</dt>
                  <dd className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold">
                    <span className="truncate">{row.value}</span>
                    <button type="button" onClick={() => copy(row.value)} aria-label={`Copy ${row.label}`} className="text-muted-foreground hover:text-primary">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
            {s?.instructions ? <p className="mt-3 text-xs text-muted-foreground">{s.instructions}</p> : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => setOpen(true)} disabled={awaiting}>
                {awaiting ? "Reference submitted" : "I've paid — submit reference"}
              </Button>
              <Button asChild variant="outline">
                <Link to={`/payment-status/${order.orderNumber}`}>Open payment status page</Link>
              </Button>
            </div>
            {awaiting ? (
              <p className="mt-2 text-xs text-muted-foreground">
                We're verifying your payment. You'll get a notification the moment it's approved.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-5">
            <ShieldCheck className="h-5 w-5 text-success" />
            <p className="text-sm">
              <span className="font-semibold">Payment verified.</span> We're preparing your order for delivery.
            </p>
          </div>
        )}

        {order.payments.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold">Submitted references</h2>
            <ul className="mt-2 space-y-2">
              {order.payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm">
                  <span className="font-mono text-xs">{p.reference}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString("en-NG")}</span>
                    <Badge variant={p.status === "approved" ? "success" : p.status === "rejected" ? "destructive" : "amber"}>
                      {p.status}
                    </Badge>
                  </span>
                  {p.adminNote ? <span className="w-full text-xs text-muted-foreground">Note: {p.adminNote}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4 text-primary" /> Items ({order.items.length})
          </h2>
          <ul className="mt-3 divide-y">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <ProductImage src={i.image} alt={i.name} className="h-full w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium">{i.name}</span>
                  {i.variant ? <span className="text-xs text-muted-foreground">{i.variant}</span> : null}
                  <span className="block text-xs text-muted-foreground">Qty {i.qty} · {formatNaira(i.unitPrice)} each</span>
                </span>
                <span className="text-sm font-semibold">{formatNaira(Number(i.unitPrice) * i.qty)}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Totals</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatNaira(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>{Number(order.deliveryFee) === 0 ? "Free" : formatNaira(order.deliveryFee)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-base"><dt className="font-semibold">Total</dt><dd className="font-extrabold">{formatNaira(order.total)}</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Delivery to</h2>
            <p className="mt-2 text-sm text-muted-foreground">{order.addressSnapshot}</p>
          </div>
          <Button asChild variant="outline" className="w-full"><Link to="/products">Continue shopping</Link></Button>
        </aside>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          <h2 className="text-lg font-bold tracking-tight">Submit your payment reference</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the reference from your bank transfer so our team can match and verify it.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitM.mutate({ orderNumber: order.orderNumber, reference, note: note || undefined });
            }}
          >
            <div>
              <Label htmlFor="ref" className="mb-1 block">Transaction reference</Label>
              <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 0001234567890" required minLength={4} />
            </div>
            <div>
              <Label htmlFor="nt" className="mb-1 block">Note (optional)</Label>
              <Textarea id="nt" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything we should know?" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={submitM.isPending}>
                {submitM.isPending ? "Submitting…" : "Submit reference"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
