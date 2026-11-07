import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";

export default function Categories() {
  const query = trpc.catalog.categories.useQuery();

  return (
    <div className="mh-container py-6 pb-16">
      <PageHeader title="Shop by category" description="Ten departments, 200+ products — all priced in Naira." />

      {query.isLoading ? (
        <LoadingState label="Loading categories…" />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (query.data ?? []).length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No categories yet" description="Categories are added by an administrator from the admin dashboard." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(query.data ?? []).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm mh-card-hover"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-primary to-violet text-xl font-bold text-white">
                {c.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{c.name}</h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-1 text-xs font-medium text-primary">{c.productCount} products</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
