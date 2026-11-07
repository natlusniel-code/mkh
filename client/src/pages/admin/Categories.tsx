import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { useStore } from "@/lib/store";

const EMPTY = { name: "", description: "", image: "", sortOrder: "0" };

export default function AdminCategories() {
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const query = trpc.admin.categories.useQuery();
  const createM = trpc.admin.createCategory.useMutation({
    onSuccess: async () => {
      toast("Category created");
      setOpen(false);
      await utils.admin.categories.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });
  const updateM = trpc.admin.updateCategory.useMutation({
    onSuccess: async () => {
      toast("Category updated");
      setOpen(false);
      await utils.admin.categories.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });
  const deleteM = trpc.admin.deleteCategory.useMutation({
    onSuccess: async () => {
      toast("Category deleted");
      await utils.admin.categories.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  }
  function openEdit(c: any) {
    setEditing(c.id);
    setForm({ name: c.name, description: c.description ?? "", image: c.image ?? "", sortOrder: String(c.sortOrder ?? 0) });
    setOpen(true);
  }
  function submit() {
    const payload = {
      name: form.name.trim(),
      description: form.description || undefined,
      image: form.image || undefined,
      sortOrder: Number(form.sortOrder) || 0,
    };
    if (editing) updateM.mutate({ id: editing, ...payload });
    else createM.mutate(payload);
  }

  const busy = createM.isPending || updateM.isPending;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Categories"
        description="The ten departments that organise the catalogue."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New category
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState title="No categories yet" description="Create your first category to start organising products." action={<Button onClick={openCreate}>New category</Button>} />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="text-sm font-medium">{c.name}</span>
                    {c.description ? <p className="line-clamp-1 text-xs text-muted-foreground">{c.description}</p> : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                  <TableCell><Badge variant="muted">{c.productCount}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`Delete “${c.name}”? Products in it become uncategorised.`)) deleteM.mutate({ id: c.id });
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          <h2 className="text-lg font-bold tracking-tight">{editing ? "Edit category" : "New category"}</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div>
              <Label className="mb-1 block">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
            </div>
            <div>
              <Label className="mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block">Image URL (optional)</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <Label className="mb-1 block">Sort order</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create category"}</Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
