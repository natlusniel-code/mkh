import { useState } from "react";
import { Check, X } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { useStore } from "@/lib/store";
import { PAYMENT_STATUSES, formatNaira } from "@shared/markethub";

export default function AdminPayments() {
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const [status, setStatus] = useState("awaiting");
  const [page, setPage] = useState(1);
  const [rejecting, setRejecting] = useState<{ id: string; orderNumber: string } | null>(null);
  const [note, setNote] = useState("");

  const query = trpc.admin.payments.useQuery({ status: status || undefined, page });
  const approveM = trpc.admin.approvePayment.useMutation({
    onSuccess: async () => {
      toast("Payment approved — customer notified");
      await Promise.all([utils.admin.payments.invalidate(), utils.admin.dashboard.invalidate()]);
    },
    onError: (e) => toast(e.message, "error"),
  });
  const rejectM = trpc.admin.rejectPayment.useMutation({
    onSuccess: async () => {
      toast("Payment rejected — customer notified");
      setRejecting(null);
      setNote("");
      await Promise.all([utils.admin.payments.invalidate(), utils.admin.dashboard.invalidate()]);
    },
    onError: (e) => toast(e.message, "error"),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments"
        description="Verify bank-transfer references. Approving marks the order paid and notifies the customer."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-48"
        >
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (query.data?.items ?? []).length === 0 ? (
        <EmptyState
          title={status === "awaiting" ? "Nothing waiting for verification" : "No payments found"}
          description={status === "awaiting" ? "When a customer submits a transfer reference it lands here for review." : "Try a different status filter."}
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="text-sm font-medium">{p.orderNumber}</span>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString("en-NG")}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="block">{p.buyerName ?? p.guestName ?? "Guest"}</span>
                    <span className="text-xs text-muted-foreground">{p.buyerEmail ?? p.guestPhone ?? "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{p.reference}</span>
                    {p.note ? <p className="mt-0.5 text-xs text-muted-foreground">{p.note}</p> : null}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">{formatNaira(p.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "approved" ? "success" : p.status === "rejected" ? "destructive" : "amber"}>{p.status}</Badge>
                    {p.adminNote ? <p className="mt-0.5 text-xs text-muted-foreground">{p.adminNote}</p> : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {p.status === "awaiting" ? (
                        <>
                          <Button size="sm" onClick={() => approveM.mutate({ id: p.id })} disabled={approveM.isPending}>
                            <Check className="h-4 w-4" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejecting({ id: p.id, orderNumber: p.orderNumber })}>
                            <X className="h-4 w-4" /> Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString("en-NG") : "Decided"}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
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

      <Dialog open={Boolean(rejecting)} onClose={() => setRejecting(null)}>
        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          <h2 className="text-lg font-bold tracking-tight">Reject payment</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Order {rejecting?.orderNumber}. The customer sees this note, so make it actionable.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (rejecting) rejectM.mutate({ id: rejecting.id, adminNote: note });
            }}
          >
            <div>
              <Label htmlFor="rn" className="mb-1 block">Reason</Label>
              <Textarea id="rn" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Reference doesn't match any transfer we received" required minLength={3} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setRejecting(null)}>Cancel</Button>
              <Button type="submit" variant="destructive" className="flex-1" disabled={rejectM.isPending}>
                {rejectM.isPending ? "Rejecting…" : "Reject payment"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
