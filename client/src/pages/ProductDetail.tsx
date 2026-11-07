import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Check, Heart, Minus, Package, Plus, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard, ProductGrid, ProductImage } from "@/components/ProductCard";
import { EmptyState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { useAuth } from "@/_core/useAuth";
import { cn } from "@/lib/utils";
import { discountPercent, effectivePrice, formatNaira } from "@shared/markethub";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, toggleWishlist, wishlist, toast } = useStore();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const query = trpc.catalog.product.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");

  const reviewM = trpc.catalog.addReview.useMutation({
    onSuccess: async () => {
      toast("Thanks — your review is live");
      setReviewTitle("");
      setReviewBody("");
      await utils.catalog.product.invalidate({ slug: slug ?? "" });
    },
    onError: (e) => toast(e.message, "error"),
  });

  if (query.isLoading) return <LoadingState label="Loading product…" />;
  if (query.isError) {
    return (
      <div className="mh-container py-10">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or the link is incorrect."
          action={<Button asChild><Link to="/products">Browse all products</Link></Button>}
        />
      </div>
    );
  }

  const p = query.data!;
  const off = discountPercent(p.price, p.discountPrice);
  const base = effectivePrice(p.price, p.discountPrice);
  const selectedVariant = p.variants.find((v) => v.id === variantId) ?? null;
  const unit = base + Number(selectedVariant?.priceDelta ?? 0);
  const out = p.stock <= 0;
  const images = p.images.length > 0 ? p.images.map((i) => i.url) : p.image ? [p.image] : [];
  const sizes = p.variants.filter((v) => v.type === "size");
  const colors = p.variants.filter((v) => v.type === "color");

  return (
    <div className="mh-container py-6 pb-16">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border bg-card">
            <ProductImage src={images[activeImage] ?? null} alt={p.name} className="aspect-square w-full" />
          </div>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto mh-scrollbar-none">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted",
                    i === activeImage ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {p.categoryName ? (
            <Link to={`/products?category=${p.categorySlug}`} className="text-xs font-medium uppercase tracking-wide text-primary hover:underline">
              {p.categoryName}
            </Link>
          ) : null}
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{p.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {p.ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber text-amber" />
                <span className="font-medium text-foreground">{Number(p.rating).toFixed(1)}</span>
                ({p.ratingCount} review{p.ratingCount === 1 ? "" : "s"})
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            {p.soldCount > 0 ? <span>· {p.soldCount} sold</span> : null}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatNaira(unit)}</span>
            {off > 0 ? (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatNaira(p.price)}</span>
                <Badge variant="amber">-{off}% off</Badge>
              </>
            ) : null}
          </div>

          <div className="mt-3">
            {out ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : p.stock <= 10 ? (
              <Badge variant="amber">Only {p.stock} left</Badge>
            ) : (
              <Badge variant="success"><Check className="h-3 w-3" /> In stock</Badge>
            )}
          </div>

          {sizes.length > 0 ? (
            <div className="mt-5">
              <Label className="mb-2 block">Size</Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      variantId === v.id ? "border-primary bg-primary-soft font-medium text-primary" : "hover:bg-muted",
                    )}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {colors.length > 0 ? (
            <div className="mt-4">
              <Label className="mb-2 block">Colour</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      variantId === v.id ? "border-primary bg-primary-soft font-medium text-primary" : "hover:bg-muted",
                    )}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button type="button" className="flex h-10 w-10 items-center justify-center hover:bg-muted" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button type="button" className="flex h-10 w-10 items-center justify-center hover:bg-muted" onClick={() => setQty((q) => Math.min(Math.max(1, p.stock), q + 1))} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1" disabled={out} onClick={() => addToCart(p.id, qty, variantId)}>
              <ShoppingCart className="h-5 w-5" /> Add to cart
            </Button>
            <Button size="lg" variant="outline" onClick={() => toggleWishlist(p)} aria-label="Wishlist">
              <Heart className={cn("h-5 w-5", wishlist.includes(p.id) && "fill-current text-destructive")} />
            </Button>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border bg-muted/30 p-4 text-sm sm:grid-cols-3">
            <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Nationwide delivery</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Verified payments</span>
            <span className="inline-flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> 7-day returns</span>
          </div>

          <div className="mt-6">
            <h2 className="mh-section-title">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mh-section-title">Customer reviews</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {p.reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                description="Be the first to review this product and help other shoppers decide."
              />
            ) : (
              p.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{r.userName ?? "Customer"}</span>
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-amber text-amber" : "text-muted")} />
                      ))}
                    </span>
                  </div>
                  {r.title ? <p className="mt-1 text-sm font-medium">{r.title}</p> : null}
                  {r.body ? <p className="mt-1 text-sm text-muted-foreground">{r.body}</p> : null}
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Write a review</h3>
            {user ? (
              <form
                className="mt-3 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  reviewM.mutate({ productId: p.id, rating, title: reviewTitle || undefined, body: reviewBody || undefined });
                }}
              >
                <div>
                  <Label className="mb-1 block">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star`}>
                        <Star className={cn("h-6 w-6", n <= rating ? "fill-amber text-amber" : "text-muted")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="rt" className="mb-1 block">Title</Label>
                  <Input id="rt" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Sums it up" />
                </div>
                <div>
                  <Label htmlFor="rb" className="mb-1 block">Review</Label>
                  <Textarea id="rb" value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} placeholder="What did you think?" />
                </div>
                <Button type="submit" className="w-full" disabled={reviewM.isPending}>
                  {reviewM.isPending ? "Submitting…" : "Submit review"}
                </Button>
              </form>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link> to write a review.
              </p>
            )}
          </div>
        </div>
      </section>

      {p.related.length > 0 ? (
        <section className="mt-12">
          <h2 className="mh-section-title mb-4">You may also like</h2>
          <ProductGrid>
            {p.related.map((r) => (
              <ProductCard
                key={r.id}
                product={r}
                onAddToCart={(x) => addToCart(x.id, 1, null)}
                onToggleWishlist={toggleWishlist}
                wishlisted={wishlist.includes(r.id)}
              />
            ))}
          </ProductGrid>
        </section>
      ) : null}
    </div>
  );
}
