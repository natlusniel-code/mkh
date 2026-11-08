import { Link, Redirect, useLocation } from "wouter";
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  UserPlus,
  Users,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/states";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Admin shell. The role check is enforced server-side on every adminProcedure;
 * this guard only keeps non-admins out of the UI (and shows them the door).
 *
 * The admin area is deliberately a DIFFERENT shell from the storefront: a large
 * indigo/violet banner sits at the very top so there is never any doubt which
 * side of the app you are in, and the storefront's bottom navigation is not
 * rendered here (see BottomNav — it hides itself on /admin routes too).
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const session = trpc.auth.session.useQuery();
  const [location] = useLocation();

  if (isLoading || session.isLoading) return <LoadingState label="Checking access…" />;
  if (!user) return <Redirect to="/login" />;
  if (!session.data?.isAdmin) {
    return (
      <div className="mh-container py-16">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-bold">Administrators only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have admin access. If you believe this is a mistake, ask an existing
            administrator to promote you — or create an administrator account with the admin sign-up
            code.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              to="/admin/register"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" /> Create an administrator account
            </Link>
            <Link to="/" className="text-sm font-medium text-primary hover:underline">
              Back to the store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const unread = session.data.unread ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── ADMIN BANNER ──────────────────────────────────────────────────────
          Large, prominent and NON-sticky: it identifies the admin landing page
          at a glance without fighting the storefront's hide-on-scroll header
          behaviour, and it scrolls away with the page. */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:py-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                Administrator area
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                MarketHub Admin
              </h1>
              <p className="mt-0.5 text-sm text-white/80">
                Admin landing page — products, orders, payments and customers.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25">
                Signed in as {user.name ?? user.email}
              </span>
              <Link
                to="/admin/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm transition-opacity hover:opacity-90"
              >
                <UserPlus className="h-3.5 w-3.5" /> Create admin account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-primary to-violet text-white">
              <Store className="h-4 w-4" />
            </span>
            <span className="font-extrabold tracking-tight">
              Market<span className="text-primary">Hub</span>
            </span>
          </Link>
          <Badge variant="default" className="hidden sm:inline-flex">Admin</Badge>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/admin/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted" aria-label="Admin notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
            <Link to="/" className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              View store
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 p-4">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = "exact" in item && item.exact ? location === item.to : location.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <nav className="mb-4 flex gap-1 overflow-x-auto lg:hidden mh-scrollbar-none">
            {NAV.map((item) => {
              const active = "exact" in item && item.exact ? location === item.to : location.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
                    active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
