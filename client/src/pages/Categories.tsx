import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { categoryImage } from "@/lib/category-images";

/**
 * Categories page (changes 6 & 7) — a designed department grid with real
 * category photography instead of the old letter-avatar list. The first
 * department is featured as a wide hero tile so the page has a clear focal
 * point rather than a flat wall of identical rows.
 */
export default function Categories() {
  const query = trpc.catalog.categories.useQuery();
  const cats = query.data ?? [];
  const [hero, ...rest] = cats;

  return (
    <div className="mh-container py-6 pb-16">
      <PageHeader
        title="Shop by category"
        description="Ten departments, all priced in Naira — tap a department to browse it."
      />

      {query.isLoading ? (
        <LoadingState label="Loading categories…" />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : cats.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No categories yet" description="Categories are added by an administrator from the admin dashboard." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {hero ? (
            <Link
              to={`/products?category=${hero.slug}`}
              className="group relative block overflow-hidden rounded-3xl border bg-card shadow-sm mh-card-hover"
            >
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted sm:aspect-[16/5]">
                <img
                  src={categoryImage(hero.slug, hero.image)}
                  alt={hero.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6 sm:p-10">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    <Sparkles className="h-3 w-3" /> Featured department
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">{hero.name}</h2>
                  {hero.description ? (
                    <p className="max-w-md text-sm text-white/85 sm:text-base">{hero.description}</p>
                  ) : null}
                  <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                    Shop now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm mh-card-hover"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img
                    src={categoryImage(c.slug, c.image)}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                    <h2 className="text-lg font-bold text-white drop-shadow-sm">{c.name}</h2>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-primary transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                {c.description ? (
                  <p className="line-clamp-2 px-4 py-3 text-sm text-muted-foreground">{c.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
