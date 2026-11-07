import { Link } from "wouter";
import { ArrowRight, Flame, Sparkles, Tag, TrendingUp, Truck } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, ProductGrid } from "@/components/ProductCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { useStore } from "@/lib/store";
import { formatNaira } from "@shared/markethub";
import { categoryImage } from "@/lib/category-images";
import type { ProductCardData } from "@/lib/types";

function Section({
  title,
  icon,
  to,
  products,
  onAdd,
  onWish,
  wishlist,
}: {
  title: string;
  icon: React.ReactNode;
  to: string;
  products: ProductCardData[];
  onAdd: (p: ProductCardData) => void;
  onWish: (p: ProductCardData) => void;
  wishlist: string[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="mh-section-title flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductGrid>
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={onAdd}
            onToggleWishlist={onWish}
            wishlisted={wishlist.includes(p.id)}
          />
        ))}
      </ProductGrid>
    </section>
  );
}

export default function Home() {
  const home = trpc.catalog.home.useQuery();
  const { addToCart, toggleWishlist, wishlist } = useStore();

  if (home.isLoading) return <LoadingState label="Loading the storefront…" />;
  if (home.isError) return <div className="mh-container py-10"><ErrorState message={home.error.message} onRetry={() => home.refetch()} /></div>;
  const data = home.data!;

  return (
    <div className="mh-container pb-16">
      <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-primary to-violet text-white">
        <div className="grid gap-6 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge className="bg-white/20 text-white backdrop-blur">
              <Sparkles className="h-3 w-3" /> Shop 10 departments
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need, delivered across Nigeria.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-white/85 sm:text-base">
              Shop electronics, phones, computers, fashion, beauty, home, groceries, sports and baby — all priced in Naira.
              Pay by bank transfer and our team verifies it for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/products">Start shopping</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link to="/products?discounted=1">Today's deals</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> Free delivery over {formatNaira(100000)}</span>
              <span className="inline-flex items-center gap-1.5"><Tag className="h-4 w-4" /> NGN pricing</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {data.featured.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group overflow-hidden rounded-2xl bg-white/10 p-3 backdrop-blur transition-colors hover:bg-white/20"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-white/10">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-medium">{p.name}</p>
                <p className="text-sm font-bold">{formatNaira(p.discountPrice ?? p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="mh-section-title">Shop by category</h2>
          <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm mh-card-hover"
            >
              <span className="block aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={categoryImage(c.slug, c.image)}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="block px-3 py-2.5 text-center text-sm font-medium leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <Section
        title="Today's deals"
        icon={<Tag className="h-5 w-5" />}
        to="/products?discounted=1"
        products={data.discounted}
        onAdd={(p) => addToCart(p.id, 1, null)}
        onWish={toggleWishlist}
        wishlist={wishlist}
      />
      <Section
        title="Best sellers"
        icon={<TrendingUp className="h-5 w-5" />}
        to="/products?sort=popular"
        products={data.bestSellers}
        onAdd={(p) => addToCart(p.id, 1, null)}
        onWish={toggleWishlist}
        wishlist={wishlist}
      />
      <Section
        title="New arrivals"
        icon={<Sparkles className="h-5 w-5" />}
        to="/products?sort=newest"
        products={data.newest}
        onAdd={(p) => addToCart(p.id, 1, null)}
        onWish={toggleWishlist}
        wishlist={wishlist}
      />
      <Section
        title="Featured picks"
        icon={<Flame className="h-5 w-5" />}
        to="/products?featured=1"
        products={data.featured}
        onAdd={(p) => addToCart(p.id, 1, null)}
        onWish={toggleWishlist}
        wishlist={wishlist}
      />

      {data.totalProducts === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="The store is being stocked"
            description="No products are published yet. An administrator can add products from the admin dashboard."
            action={<Button asChild><Link to="/admin">Open admin dashboard</Link></Button>}
          />
        </div>
      ) : null}
    </div>
  );
}
