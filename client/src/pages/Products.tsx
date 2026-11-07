import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Filter, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductCard, ProductGrid } from "@/components/ProductCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const;

export default function Products() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const { addToCart, toggleWishlist, wishlist } = useStore();

  const [term, setTerm] = useState(params.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const categorySlug = params.get("category") ?? undefined;
  const sort = (params.get("sort") ?? "newest") as (typeof SORTS)[number]["value"];
  const page = Number(params.get("page") ?? 1);
  const discountedOnly = params.get("discounted") === "1";
  const featuredOnly = params.get("featured") === "1";
  const inStockOnly = params.get("instock") === "1";

  useEffect(() => {
    setTerm(params.get("search") ?? "");
    setMinPrice(params.get("min") ?? "");
    setMaxPrice(params.get("max") ?? "");
  }, [params]);

  const categories = trpc.catalog.categories.useQuery();
  const query = trpc.catalog.products.useQuery({
    search: params.get("search") ?? undefined,
    categorySlug,
    sort,
    page,
    pageSize: 24,
    discountedOnly: discountedOnly || undefined,
    featuredOnly: featuredOnly || undefined,
    inStockOnly: inStockOnly || undefined,
    minPrice: params.get("min") ? Number(params.get("min")) : undefined,
    maxPrice: params.get("max") ? Number(params.get("max")) : undefined,
  });

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    navigate(`/products?${next.toString()}`);
  }

  const activeCategory = (categories.data ?? []).find((c) => c.slug === categorySlug);
  const activeFilters = [
    discountedOnly ? { key: "discounted", label: "On sale" } : null,
    featuredOnly ? { key: "featured", label: "Featured" } : null,
    inStockOnly ? { key: "instock", label: "In stock" } : null,
    params.get("min") ? { key: "min", label: `Min ₦${params.get("min")}` } : null,
    params.get("max") ? { key: "max", label: `Max ₦${params.get("max")}` } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="mh-container py-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mh-page-title">{activeCategory ? activeCategory.name : "All products"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.data ? `${query.data.total} product${query.data.total === 1 ? "" : "s"} found` : "Loading products…"}
            {params.get("search") ? ` for “${params.get("search")}”` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters((s) => !s)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <Select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="w-44">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className={cn("space-y-5", showFilters ? "block" : "hidden lg:block")}>
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Filter className="h-4 w-4" /> Search</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setParam("search", term.trim() || null);
              }}
              className="space-y-2"
            >
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Product name…" />
              <Button type="submit" size="sm" className="w-full">Apply</Button>
            </form>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Category</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setParam("category", null)}
                  className={cn("w-full rounded-md px-2 py-1.5 text-left hover:bg-muted", !categorySlug && "bg-primary-soft font-medium text-primary")}
                >
                  All categories
                </button>
              </li>
              {(categories.data ?? []).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setParam("category", c.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-muted",
                      categorySlug === c.slug && "bg-primary-soft font-medium text-primary",
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.productCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Price (₦)</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const next = new URLSearchParams(params);
                if (minPrice) next.set("min", minPrice); else next.delete("min");
                if (maxPrice) next.set("max", maxPrice); else next.delete("max");
                next.delete("page");
                navigate(`/products?${next.toString()}`);
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Input inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" />
                <span className="text-muted-foreground">–</span>
                <Input inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" />
              </div>
              <Button type="submit" size="sm" variant="outline" className="w-full">Apply range</Button>
            </form>
          </div>

          <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold">Quick filters</h2>
            {[
              { key: "discounted", label: "On sale only", on: discountedOnly },
              { key: "featured", label: "Featured", on: featuredOnly },
              { key: "instock", label: "In stock", on: inStockOnly },
            ].map((f) => (
              <label key={f.key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.on}
                  onChange={(e) => setParam(f.key, e.target.checked ? "1" : null)}
                  className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                />
                {f.label}
              </label>
            ))}
          </div>
        </aside>

        <div>
          {activeFilters.length > 0 ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <button key={f.key} type="button" onClick={() => setParam(f.key, null)}>
                  <Badge variant="muted" className="gap-1 hover:bg-muted/70">
                    {f.label} <X className="h-3 w-3" />
                  </Badge>
                </button>
              ))}
              <button type="button" onClick={() => navigate("/products")} className="text-xs font-medium text-primary hover:underline">
                Clear all
              </button>
            </div>
          ) : null}

          {query.isLoading ? (
            <LoadingState label="Loading products…" />
          ) : query.isError ? (
            <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
          ) : query.data && query.data.items.length > 0 ? (
            <>
              <ProductGrid>
                {query.data.items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(p) => addToCart(p.id, 1, null)}
                    onToggleWishlist={toggleWishlist}
                    wishlisted={wishlist.includes(p.id)}
                  />
                ))}
              </ProductGrid>

              {query.data.pageCount > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {query.data.page} of {query.data.pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= query.data.pageCount}
                    onClick={() => setParam("page", String(page + 1))}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              icon={<PackageSearch className="h-6 w-6" />}
              title="No products match these filters"
              description="Try a different search term, widen the price range, or clear the filters to see everything in the store."
              action={<Button onClick={() => navigate("/products")}>Clear all filters</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
