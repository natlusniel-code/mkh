import { Link, useLocation } from "wouter";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Mobile bottom navigation (change 5) — five tabs with the profile tab in the
 * MIDDLE. Fixed to the viewport bottom on small screens; the store layout adds
 * matching bottom padding so content is never hidden behind it.
 */
const TABS = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/", center: false },
  { to: "/products", label: "Shop", icon: LayoutGrid, match: (p: string) => p.startsWith("/products") || p.startsWith("/categories"), center: false },
  { to: "/account", label: "Profile", icon: User, match: (p: string) => p.startsWith("/account"), center: true },
  { to: "/wishlist", label: "Wishlist", icon: Heart, match: (p: string) => p.startsWith("/wishlist"), center: false },
  { to: "/cart", label: "Cart", icon: ShoppingCart, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout"), center: false },
];

export function BottomNav() {
  const [location] = useLocation();
  const { cart } = useStore();
  const { user } = useAuth();
  const session = trpc.auth.session.useQuery(undefined, { enabled: Boolean(user) });
  const unread = session.data?.unread ?? 0;

  // The admin area is a different shell with its own navigation — the storefront
  // tab bar has no business there, and its "Profile" tab would point at a
  // customer page an administrator is not looking for.
  if (location.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/85"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.match(location);
          const badge = t.to === "/cart" ? cart.count : t.to === "/account" ? unread : 0;
          return (
            <li key={t.to} className="flex">
              <Link
                to={t.to}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "relative flex items-center justify-center rounded-full transition-all",
                    t.center
                      ? "-mt-4 h-11 w-11 bg-gradient-to-br from-indigo-500 via-primary to-violet text-white shadow-lg ring-4 ring-background"
                      : "h-6 w-6",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {badge > 0 ? (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-amber-foreground">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
                <span className={cn(t.center && "mt-0.5")}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
