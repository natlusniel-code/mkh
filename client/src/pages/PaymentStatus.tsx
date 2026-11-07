import { Link, useParams } from "wouter";
import { CheckCircle2, Clock, Landmark, RefreshCw, XCircle } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/states";
import { ORDER_STATUS_LABELS, formatNaira } from "@shared/markethub";
import type { OrderStatus } from "@shared/markethub";

/**
 * Standalone payment-status page. Meant to be opened in its own tab so the
 * customer can keep it open while they complete the transfer; it polls the
 * server every 10s and reflects the admin's decision live.
 */
export default function PaymentStatus() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const query = trpc.orders.status.useQuery(
    { orderNumber: orderNumber ?? "" },
    { enabled: Boolean(orderNumber), refetchInterval: 10_000 },
  );
  const settings = trpc.payments.settings.useQuery();

  if (query.isLoading) return <LoadingState label="Checking payment status…" />;
  if (query.isError) {
    return (
      <div className="mh-container py-10">
        <EmptyState
          title="Order not found"
          description="We couldn't find that order number. Double-check the link you were given."
          action={<Button asChild><Link to="/">Back to store</Link></Button>}
        />
      </div>
    );
  }

  const o = query.data!;
  const s = settings.data;
  const state =
    o.paymentStatus === "paid"
      ? { icon: <CheckCircle2 className="h-8 w-8" />, tone: "text-success", title: "Payment verified", body: "Your transfer has been confirmed. We're preparing your order for delivery." }
      : o.paymentStatus === "rejected"
        ? { icon: <XCircle className="h-8 w-8" />, tone: "text-destructive", title: "Payment could not be verified", body: o.latestPayment?.adminNote ? `Reason: ${o.latestPayment.adminNote}` : "Please check your reference and submit it again from your order page." }
        : o.paymentStatus === "awaiting"
          ? { icon: <Clock className="h-8 w-8" />, tone: "text-amber", title: "Awaiting verification", body: "We've received your reference and our team is checking it. This page updates automatically." }
          : { icon: <Landmark className="h-8 w-8" />, tone: "text-primary", title: "Awaiting your transfer", body: "Transfer the total to the account below, then submit your reference from your order page." };

  return (
    <div className="mh-container max-w-2xl py-10 pb-16">
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted ${state.tone}`}>{state.icon}</span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">{state.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{state.body}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline">Order {o.orderNumber}</Badge>
          <Badge variant="outline">{ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}</Badge>
          <Badge variant="default">{formatNaira(o.total)}</Badge>
        </div>

        {o.paymentStatus !== "paid" ? (
          <dl className="mt-6 grid gap-3 text-left sm:grid-cols-3">
            {[
              { label: "Bank", value: s?.bankName ?? "—" },
              { label: "Account name", value: s?.accountName ?? "—" },
              { label: "Account number", value: s?.accountNumber ?? "—" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border bg-muted/30 p-3">
                <dt className="mh-caption">{row.label}</dt>
                <dd className="mt-1 truncate text-sm font-semibold">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {o.latestPayment ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Reference on file: <span className="font-mono">{o.latestPayment.reference}</span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to={`/order/${o.orderNumber}`}>View order</Link></Button>
          <Button variant="outline" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" /> Refresh now
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">This page refreshes automatically every 10 seconds.</p>
      </div>
    </div>
  );
}
