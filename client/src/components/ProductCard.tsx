import { useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discountPercent, effectivePrice, formatNaira } from "@shared/markethub";
import type { ProductCardData } from "@/lib/types";

/** Product image with a graceful fallback when the object is missing. */
export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <ShoppingCart className="h-8 w-8 opacity-40" aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  wishlisted = false,
  busy = false,
}: {
  product: ProductCardData;
  onAddToCart?: (p: ProductCardData) => void;
  onToggleWishlist?: (p: ProductCardData) => void;
  wishlisted?: boolean;
  busy?: boolean;
}) {
  const off = discountPercent(product.price, product.discountPrice);
  const price = effectivePrice(product.price, product.discountPrice);
  const out = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm mh-card-hover">
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {off > 0 ? (
          <Badge variant="amber" className="absolute left-2 top-2 shadow-sm">
            -{off}%
          </Badge>
        ) : null}
        {out ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Badge variant="muted" className="text-xs">Out of stock</Badge>
          </div>
        ) : null}
      </Link>

      {onToggleWishlist ? (
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 shadow-sm transition-colors",
            wishlisted ? "text-destructive" : "text-muted-foreground hover:text-destructive",
          )}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link to={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary">
          {product.name}
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatNaira(price)}</span>
          {off > 0 ? <span className="text-xs text-muted-foreground line-through">{formatNaira(product.price)}</span> : null}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {product.ratingCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber text-amber" />
              {Number(product.rating).toFixed(1)}
              <span className="text-muted-foreground/70">({product.ratingCount})</span>
            </span>
          ) : (
            <span>New</span>
          )}
          {product.soldCount > 0 ? <span>· {product.soldCount} sold</span> : null}
        </div>

        <div className="mt-auto pt-1">
          {onAddToCart ? (
            <Button size="sm" className="w-full" disabled={out || busy} onClick={() => onAddToCart(product)}>
              <ShoppingCart className="h-4 w-4" />
              {out ? "Out of stock" : "Add to cart"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", className)}>{children}</div>
  );
}
