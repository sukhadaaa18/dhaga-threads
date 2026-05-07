import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";
import api from "@/lib/api";

interface CartItem {
  product: Product;
  qty: number;
}

interface ShopState {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  setWishlist: (ids: string[]) => void;
  clearWishlist: () => void;
  cartCount: () => number;
  cartTotal: () => number;
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      addToCart: (p) =>
        set((s) => {
          const existing = s.cart.find((i) => i.product.id === p.id);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { cart: [...s.cart, { product: p, qty: 1 }] };
        }),
      removeFromCart: (id) =>
        set((s) => ({ cart: s.cart.filter((i) => i.product.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          cart: s.cart
            .map((i) => (i.product.id === id ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      clearCart: () => set({ cart: [] }),
      setWishlist: (ids) => set({ wishlist: ids }),
      clearWishlist: () => set({ wishlist: [] }),
      toggleWishlist: (id) => {
        const current = get().wishlist;
        const next = current.includes(id)
          ? current.filter((w) => w !== id)
          : [...current, id];
        
        set({ wishlist: next });

        // Sync with backend if logged in
        const user = localStorage.getItem('dhaga_user');
        if (user) {
          api.put('/auth/wishlist', { wishlist: next }).catch(e => console.error("Sync failed", e));
        }
      },
      cartCount: () => get().cart.reduce((sum, i) => sum + i.qty, 0),
      cartTotal: () =>
        get().cart.reduce((sum, i) => sum + i.qty * i.product.price, 0),
    }),
    { name: "dhaga-shop" }
  )
);
