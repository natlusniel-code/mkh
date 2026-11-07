import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { guestToken } from "./guest";
import type { ProductCardData } from "./types";

// Storefront-wide state: the live cart, the wishlist, and the toast queue.
// Cart identity is resolved server-side (session user, else the guest token).
type StoreValue = {
  cart: { lines: any[]; subtotal: number; deliveryFee: number; total: number; count: number };
  cartLoading: boolean;
  addToCart: (productId: string, qty?: number, variantId?: string | null) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  wishlist: string[];
  toggleWishlist: (product: ProductCardData) => Promise<void>;
  toast: (message: string, kind?: "success" | "error") => void;
  toasts: { id: number; message: string; kind: "success" | "error" }[];
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const token = useMemo(() => guestToken(), []);
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: "success" | "error" }[]>([]);

  const cartQuery = trpc.cart.get.useQuery({ guestToken: user ? null : token });
  const wishlistQuery = trpc.wishlist.list.useQuery(undefined, { enabled: Boolean(user) });

  const addM = trpc.cart.add.useMutation();
  const setQtyM = trpc.cart.setQty.useMutation();
  const removeM = trpc.cart.remove.useMutation();
  const clearM = trpc.cart.clear.useMutation();
  const toggleWishM = trpc.wishlist.toggle.useMutation();

  const toast = useCallback((message: string, kind: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([utils.cart.get.invalidate(), utils.auth.session.invalidate()]);
  }, [utils]);

  const value = useMemo<StoreValue>(() => {
    const wishlist = (wishlistQuery.data ?? []).map((p) => p.id);
    return {
      cart: cartQuery.data ?? { lines: [], subtotal: 0, deliveryFee: 0, total: 0, count: 0 },
      cartLoading: cartQuery.isLoading,
      addToCart: async (productId, qty = 1, variantId = null) => {
        try {
          await addM.mutateAsync({ productId, qty, variantId, guestToken: user ? null : token });
          await refresh();
          toast("Added to cart");
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not add to cart", "error");
        }
      },
      setQty: async (itemId, qty) => {
        try {
          await setQtyM.mutateAsync({ itemId, qty, guestToken: user ? null : token });
          await refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not update quantity", "error");
        }
      },
      removeItem: async (itemId) => {
        try {
          await removeM.mutateAsync({ itemId, guestToken: user ? null : token });
          await refresh();
          toast("Removed from cart");
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not remove item", "error");
        }
      },
      clearCart: async () => {
        await clearM.mutateAsync({ guestToken: user ? null : token });
        await refresh();
      },
      wishlist,
      toggleWishlist: async (product) => {
        if (!user) {
          toast("Log in to save items to your wishlist", "error");
          return;
        }
        try {
          const res = await toggleWishM.mutateAsync({ productId: product.id });
          await utils.wishlist.list.invalidate();
          toast(res.added ? "Saved to wishlist" : "Removed from wishlist");
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not update wishlist", "error");
        }
      },
      toast,
      toasts,
    };
  }, [cartQuery.data, cartQuery.isLoading, wishlistQuery.data, user, token, addM, setQtyM, removeM, clearM, toggleWishM, refresh, toast, toasts, utils]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
