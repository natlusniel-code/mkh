import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { formatNaira } from "@shared/markethub";

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="MarketHub home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-primary to-violet text-white shadow-sm">
        <Store className="h-5 w-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Market<span className="text-primary">Hub</span>
      </span>
    </Link>
  );
}

function SearchBar({ className }: { className?: string }) {
  const [, navigate] = useLocation();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const suggestions = trpc.catalog.searchSuggestions.useQuery(
    { q: term },
    { enabled: term.trim().length >= 2 },
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(term.trim())}`);
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={submit} className="flex w-full items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search 200+ products…"
            aria-label="Search products"
            className="h-10 rounded-full pl-9"
          />
        </div>
        <Button type="submit" className="h-10 rounded-full px-5">
          Search
        </Button>
      </form>

      {open && term.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border bg-popover shadow-xl">
          {suggestions.isLoading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : suggestions.data && suggestions.data.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {suggestions.data.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/products/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {s.image ? <img src={s.image} alt="" className="h-full w-full object-cover" /> : null}
                    </span>
                    <span className="line-clamp-1 flex-1 text-sm">{s.name}</span>
                    <span className="text-sm font-semibold">{formatNaira(s.discountPrice ?? s.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">No products match “{term}”.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const session = trpc.auth.session.useQuery();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/register">Sign up</Link>
        </Button>
      </div>
    );
  }

  const unread = session.data?.unread ?? 0;

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      <Link
        to="/account?tab=notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-muted"
        aria-label="Account menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {(user.name ?? user.email).slice(0, 1).toUpperCase()}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-xl border bg-popover py-1 shadow-xl">
          <div className="border-b px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.name ?? "Customer"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link to="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
            <User className="h-4 w-4" /> My account
          </Link>
          <Link to="/account?tab=orders" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
            <Package className="h-4 w-4" /> My orders
          </Link>
          <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
            <Heart className="h-4 w-4" /> Wishlist
          </Link>
          {session.data?.isAdmin ? (
            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-muted">
              <LayoutDashboard className="h-4 w-4" /> Admin dashboard
            </Link>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "mh-fade-up rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg",
            t.kind === "error" ? "bg-destructive" : "bg-foreground",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { cart } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const categories = trpc.catalog.categories.useQuery();
  const [location] = useLocation();

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="bg-gradient-to-r from-indigo-600 via-primary to-violet px-4 py-1.5 text-center text-xs font-medium text-white">
        Free delivery on orders over {formatNaira(100000)} · Pay by bank transfer, verified by our team
      </div>

      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mh-container flex h-16 items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Logo />

          <SearchBar className="hidden flex-1 md:block" />

          <div className="ml-auto flex items-center gap-1">
            <Link to="/wishlist" className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-muted sm:flex" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cart.count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-amber-foreground">
                  {cart.count > 9 ? "9+" : cart.count}
                </span>
              ) : null}
            </Link>
            <AccountMenu />
          </div>
        </div>

        <div className="mh-container pb-3 md:hidden">
          <SearchBar />
        </div>

        <nav className="border-t bg-muted/40">
          <div className="mh-container mh-scrollbar-none flex items-center gap-1 overflow-x-auto py-2">
            <Link to="/products" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium hover:bg-background">
              All products
            </Link>
            {(categories.data ?? []).map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>

        {mobileOpen ? (
          <div className="border-t bg-background lg:hidden">
            <div className="mh-container grid grid-cols-2 gap-1 py-3">
              {(categories.data ?? []).map((c) => (
                <Link key={c.id} to={`/products?category=${c.slug}`} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t bg-muted/30">
        <div className="mh-container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Nigeria's everyday online marketplace. 200+ products across 10 categories, priced in Naira.
            </p>
          </div>
          <div>
            <h3 className="mh-caption mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-foreground">All products</Link></li>
              <li><Link to="/categories" className="hover:text-foreground">Categories</Link></li>
              <li><Link to="/products?discounted=1" className="hover:text-foreground">Deals &amp; discounts</Link></li>
              <li><Link to="/wishlist" className="hover:text-foreground">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mh-caption mb-3">Your account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/account" className="hover:text-foreground">My account</Link></li>
              <li><Link to="/account?tab=orders" className="hover:text-foreground">Order history</Link></li>
              <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Log in</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mh-caption mb-3">Payment</h3>
            <p className="text-sm text-muted-foreground">
              Bank transfer only. Submit your transaction reference and our team verifies it — usually within a few hours.
            </p>
            <Badge variant="amber" className="mt-3">Manual verification</Badge>
          </div>
        </div>
        <div className="border-t py-5">
          <p className="mh-container text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} MarketHub. Prices in Nigerian Naira (NGN).
          </p>
        </div>
      </footer>

      <Toasts />
    </div>
  );
}
