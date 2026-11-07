import { Link } from "wouter";
import { Heart } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductGrid } from "@/components/ProductCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { useAuth } from "@/_core/useAuth";

export default function Wishlist() {
  const { user, isLoading } = useAuth();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const query = trpc.wishlist.list.useQuery(undefined, { enabled: Boolean(user) });

  if (isLoading) return <LoadingState />;

  if (!user) {
    return (
      <div className="mh-container py-10 pb-16">
        <h1 className="mh-page-title">Wishlist</h1>
        <div className="mt-6">
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Log in to use your wishlist"
            description="Your wishlist is saved to your account so it follows you across devices."
            action={<Button asChild><Link to="/login">Log in</Link></Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mh-container py-6 pb-16">
      <h1 className="mh-page-title">Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {query.data ? `${query.data.length} saved item${query.data.length === 1 ? "" : "s"}` : "Loading…"}
      </p>

      <div className="mt-6">
        {query.isLoading ? (
          <LoadingState label="Loading your wishlist…" />
        ) : query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
        ) : (query.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Nothing saved yet"
            description="Tap the heart on any product to save it here for later."
            action={<Button asChild><Link to="/products">Browse products</Link></Button>}
          />
        ) : (
          <ProductGrid>
            {(query.data ?? []).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(x) => addToCart(x.id, 1, null)}
                onToggleWishlist={toggleWishlist}
                wishlisted={wishlist.includes(p.id)}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
