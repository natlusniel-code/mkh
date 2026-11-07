import { Fragment, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { useStore } from "@/lib/store";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatNaira } from "@shared/markethub";
import type { OrderStatus, PaymentStatus } from "@shared/markethub";

export default function AdminOrders() {
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const query = trpc.admin.orders.useQuery({ search: search || undefined, status: status || undefined, page, pageSize: 20 });
  const setStatusM = trpc.admin.setOrderStatus.useMutation({
    onSuccess: async () => {
      toast("Order status updated");
      await utils.admin.orders.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Orders" description="Every order, its payment state and its fulfilment status." />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Order number, name or phone…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-48"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </Select>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (query.data?.items ?? []).length === 0 ? (
        <EmptyState title="No orders found" description="Orders placed in the storefront will appear here for fulfilment." />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).map((o) => (
                <Fragment key={o.id}>
                  <TableRow>
                    <TableCell>
                      <button type="button" onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="flex items-center gap-1 text-sm font-medium hover:text-primary">
                        <ChevronDown className={`h-4 w-4 transition-transform ${expanded === o.id ? "rotate-180" : ""}`} />
                        {o.orderNumber}
                      </button>
                      <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-NG")}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="block">{o.buyer?.name ?? o.guestName ?? "Guest"}</span>
                      <span className="text-xs text-muted-foreground">{o.buyer?.email ?? o.guestPhone ?? "—"}</span>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{formatNaira(o.total)}</TableCell>
                    <TableCell>
                      <Badge variant={o.paymentStatus === "paid" ? "success" : o.paymentStatus === "rejected" ? "destructive" : "amber"}>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus as PaymentStatus] ?? o.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Select
                          value={o.status}
                          onChange={(e) => setStatusM.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                          className="w-44"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                          ))}
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded === o.id ? (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="grid gap-4 py-2 sm:grid-cols-2">
                          <div>
                            <p className="mh-caption mb-1">Items</p>
                            <ul className="space-y-1 text-sm">
                              {o.items.map((i: any) => (
                                <li key={i.id} className="flex justify-between gap-3">
                                  <span className="truncate">{i.name}{i.variant ? ` · ${i.variant}` : ""} × {i.qty}</span>
                                  <span className="shrink-0 font-medium">{formatNaira(Number(i.unitPrice) * i.qty)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="mh-caption mb-1">Delivery</p>
                            <p className="text-sm text-muted-foreground">{o.addressSnapshot}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Subtotal {formatNaira(o.subtotal)} · Delivery {Number(o.deliveryFee) === 0 ? "Free" : formatNaira(o.deliveryFee)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {query.data && query.data.pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {query.data.page} of {query.data.pageCount}</span>
          <Button variant="outline" size="sm" disabled={page >= query.data.pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      ) : null}
    </div>
  );
}
