import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductImage } from "@/components/ProductCard";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { useStore } from "@/lib/store";
import { PRODUCT_STATUSES, formatNaira } from "@shared/markethub";

const EMPTY = {
  name: "",
  description: "",
  categoryId: "",
  price: "",
  discountPrice: "",
  stock: "0",
  status: "active" as "active" | "draft" | "archived",
  featured: false,
  images: "",
};

export default function AdminProducts() {
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const categories = trpc.admin.categories.useQuery();
  const query = trpc.admin.products.useQuery({ search: search || undefined, status: status || undefined, page, pageSize: 20 });

  const createM = trpc.admin.createProduct.useMutation({
    onSuccess: async () => {
      toast("Product created");
      setOpen(false);
      await utils.admin.products.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });
  const updateM = trpc.admin.updateProduct.useMutation({
    onSuccess: async () => {
      toast("Product updated");
      setOpen(false);
      await utils.admin.products.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });
  const deleteM = trpc.admin.deleteProduct.useMutation({
    onSuccess: async () => {
      toast("Product deleted");
      await utils.admin.products.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  }

  function openEdit(p: any) {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      categoryId: p.categoryId ?? "",
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      stock: String(p.stock),
      status: p.status,
      featured: Boolean(p.featured),
      images: p.image ?? "",
    });
    setOpen(true);
  }

  function submit() {
    const payload = {
      name: form.name.trim(),
      description: form.description,
      categoryId: form.categoryId || null,
      price: form.price.trim(),
      discountPrice: form.discountPrice.trim() || null,
      stock: Number(form.stock) || 0,
      status: form.status,
      featured: form.featured,
      images: form.images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    };
    if (editing) updateM.mutate({ id: editing, ...payload });
    else createM.mutate(payload);
  }

  const busy = createM.isPending || updateM.isPending;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="Create, edit and retire catalogue items. Prices are in Naira."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New product
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-40"
        >
          <option value="">All statuses</option>
          {PRODUCT_STATUSES.map((s) => (
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
          title="No products found"
          description="Adjust the filters, or create your first product."
          action={<Button onClick={openCreate}>New product</Button>}
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        <ProductImage src={p.image} alt={p.name} className="h-full w-full" />
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                        {p.featured ? <Badge variant="amber" className="mt-0.5">Featured</Badge> : null}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.categoryName ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {p.discountPrice ? (
                      <span className="flex flex-col">
                        <span className="font-semibold">{formatNaira(p.discountPrice)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatNaira(p.price)}</span>
                      </span>
                    ) : (
                      <span className="font-semibold">{formatNaira(p.price)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.stock === 0 ? "destructive" : p.stock <= 8 ? "amber" : "muted"}>{p.stock}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "success" : p.status === "draft" ? "muted" : "outline"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`Delete “${p.name}”? This cannot be undone.`)) deleteM.mutate({ id: p.id });
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

      {query.data && query.data.pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {query.data.page} of {query.data.pageCount}</span>
          <Button variant="outline" size="sm" disabled={page >= query.data.pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      ) : null}

      <Dialog open={open} onClose={() => setOpen(false)} className="max-w-2xl">
        <div className="max-h-[85vh] overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl">
          <h2 className="text-lg font-bold tracking-tight">{editing ? "Edit product" : "New product"}</h2>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
            </div>
            <div>
              <Label className="mb-1 block">Category</Label>
              <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Uncategorised</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}>
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Price (₦)</Label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="25000" required pattern="\d+(\.\d{1,2})?" />
            </div>
            <div>
              <Label className="mb-1 block">Discount price (₦, optional)</Label>
              <Input value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="19999" pattern="\d+(\.\d{1,2})?" />
            </div>
            <div>
              <Label className="mb-1 block">Stock</Label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <label className="flex items-center gap-2 self-end text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[var(--primary)]" />
              Featured on the home page
            </label>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Image URLs (one per line)</Label>
              <Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://…/photo.jpg" />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create product"}</Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
