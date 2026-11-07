import { useEffect, useState } from "react";
import { Landmark, Save } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ErrorState, LoadingState, PageHeader } from "@/components/states";
import { useStore } from "@/lib/store";

export default function AdminSettings() {
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const query = trpc.admin.paymentSettings.useQuery();
  const [form, setForm] = useState({ bankName: "", accountName: "", accountNumber: "", instructions: "" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (query.data && !hydrated) {
      setForm({
        bankName: query.data.bankName ?? "",
        accountName: query.data.accountName ?? "",
        accountNumber: query.data.accountNumber ?? "",
        instructions: query.data.instructions ?? "",
      });
      setHydrated(true);
    }
  }, [query.data, hydrated]);

  const saveM = trpc.admin.updatePaymentSettings.useMutation({
    onSuccess: async () => {
      toast("Payment settings saved");
      await Promise.all([utils.admin.paymentSettings.invalidate(), utils.payments.settings.invalidate()]);
    },
    onError: (e) => toast(e.message, "error"),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="The bank account customers transfer to, and the instructions they see at checkout." />

      <section className="max-w-2xl rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Landmark className="h-4 w-4 text-primary" /> Bank transfer details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These appear on every order confirmation and payment-status page. Customers submit a reference which you verify under Payments.
        </p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveM.mutate(form);
          }}
        >
          <div>
            <Label className="mb-1 block">Bank name</Label>
            <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} required minLength={2} />
          </div>
          <div>
            <Label className="mb-1 block">Account name</Label>
            <Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required minLength={2} />
          </div>
          <div>
            <Label className="mb-1 block">Account number</Label>
            <Input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} required minLength={6} inputMode="numeric" />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block">Instructions shown to customers</Label>
            <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Use your order number as the transfer narration…" />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saveM.isPending}>
              <Save className="h-4 w-4" /> {saveM.isPending ? "Saving…" : "Save settings"}
            </Button>
            <Badge variant="amber">Manual verification</Badge>
          </div>
        </form>
      </section>
    </div>
  );
}
