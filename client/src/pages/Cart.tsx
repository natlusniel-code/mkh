import { Link } from "wouter";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ProductCard";
import { EmptyState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { FREE_DELIVERY_THRESHOLD, formatNaira } from "@shared/markethub";

export default function Cart() {
  const { cart, cartLoading, setQty, removeItem, clearCart } = useStore();

  if (cartLoading) return <LoadingState label="Loading your cart…" />;

  if (cart.lines.length === 0) {
    return (
      <div className="mh-container py-10 pb-16">
        <h1 className="mh-page-title">Your cart</h1>
        <div className="mt-6">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Your cart is empty"
            description="Browse the store and add products — your cart is saved here, even before you log in."
            action={<Button asChild><Link to="/products">Start shopping</Link></Button>}
          />
        </div>
      </div>
    );
  }

  const remaining = FREE_DELIVERY_THRESHOLD - cart.subtotal;

  return (
    <div className="mh-container py-6 pb-16">
      <div className="flex items-end justify-between gap-3">
        <h1 className="mh-page-title">Your cart</h1>
        <Button variant="ghost" size="sm" onClick={() => clearCart()} className="text-muted-foreground">
          Clear cart
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {cart.lines.map((line) => (
            <div key={line.id} className="flex gap-4 rounded-2xl border bg-card p-3 shadow-sm">
              <Link to={`/products/${line.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                <ProductImage src={line.image} alt={line.name} className="h-full w-full" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link to={`/products/${line.slug}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
                  {line.name}
                </Link>
                {line.variantLabel ? <span className="mt-0.5 text-xs text-muted-foreground">{line.variantLabel}</span> : null}
                <span className="mt-1 text-sm font-bold">{formatNaira(line.unitPrice)}</span>
                {line.stock < line.qty ? <Badge variant="destructive" className="mt-1 w-fit">Only {line.stock} left</Badge> : null}

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-lg border">
                    <button type="button" className="flex h-8 w-8 items-center justify-center hover:bg-muted" onClick={() => setQty(line.id, line.qty - 1)} aria-label="Decrease">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{line.qty}</span>
                    <button type="button" className="flex h-8 w-8 items-center justify-center hover:bg-muted" onClick={() => setQty(line.id, line.qty + 1)} aria-label="Increase">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem(line.id)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal ({cart.count} item{cart.count === 1 ? "" : "s"})</dt>
                <dd className="font-medium">{formatNaira(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium">{cart.deliveryFee === 0 ? "Free" : formatNaira(cart.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-extrabold">{formatNaira(cart.total)}</dd>
              </div>
            </dl>

            {remaining > 0 ? (
              <p className="mt-3 rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
                Add {formatNaira(remaining)} more for free delivery.
              </p>
            ) : null}

            <Button asChild size="lg" className="mt-4 w-full">
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
              <Link to="/products">Continue shopping</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
