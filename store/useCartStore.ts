"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  unit: string;
  quantity: number;
  shopId: string;
  shopName: string;
  stockQty?: number;
  imageUrl?: string | null;
}

type CartState = {
  items: CartItem[];
  selectedProductIds: string[];
  hasHydrated: boolean;
};

type CartActions = {
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  removeByShop: (shopId: string) => void;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;
  toggleSelectItem: (productId: string) => void;
  setSelectedProductIds: (ids: string[]) => void;
  bringToFront: (productId: string) => void;
};

/**
 * Nhóm items theo shop_id — checkout sẽ lặp qua từng group để tạo N order.
 */
export const groupCartByShop = (items: CartItem[]) => {
  const groups = new Map<string, { shopId: string; shopName: string; items: CartItem[] }>();
  for (const item of items) {
    const g = groups.get(item.shopId);
    if (g) {
      g.items.push(item);
    } else {
      groups.set(item.shopId, {
        shopId: item.shopId,
        shopName: item.shopName,
        items: [item],
      });
    }
  }
  return Array.from(groups.values());
};

export const useCartStore = create<CartState & CartActions>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        selectedProductIds: [],
        hasHydrated: false,

        addItem: (item, quantity) =>
          set((state) => {
            const existing = state.items.find((i) => i.productId === item.productId);
            if (existing) {
              const max = item.stockQty ?? Number.POSITIVE_INFINITY;
              const nextQty = Math.min(max, existing.quantity + quantity);
              return {
                items: state.items.map((i) =>
                  i.productId === item.productId
                    ? { ...i, ...item, quantity: nextQty }
                    : i,
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity }] };
          }),

        updateQuantity: (productId, delta) =>
          set((state) => ({
            items: state.items
              .map((i) => {
                if (i.productId !== productId) return i;
                const max = i.stockQty ?? Number.POSITIVE_INFINITY;
                const nextQty = Math.max(1, Math.min(max, i.quantity + delta));
                return { ...i, quantity: nextQty };
              })
              .filter((i) => i.quantity > 0),
          })),

        setQuantity: (productId, qty) =>
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, qty) }
                : i,
            ),
          })),

        removeItem: (productId) =>
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
            selectedProductIds: state.selectedProductIds.filter((id) => id !== productId),
          })),

        removeByShop: (shopId) =>
          set((state) => {
            const removed = state.items.filter((i) => i.shopId === shopId).map((i) => i.productId);
            return {
              items: state.items.filter((i) => i.shopId !== shopId),
              selectedProductIds: state.selectedProductIds.filter((id) => !removed.includes(id)),
            };
          }),

        clear: () => set({ items: [], selectedProductIds: [] }),

        toggleSelectItem: (productId) =>
          set((state) => ({
            selectedProductIds: state.selectedProductIds.includes(productId)
              ? state.selectedProductIds.filter((id) => id !== productId)
              : [...state.selectedProductIds, productId],
          })),

        setSelectedProductIds: (ids) => set({ selectedProductIds: ids }),

        bringToFront: (productId) =>
          set((state) => {
            const idx = state.items.findIndex((i) => i.productId === productId);
            if (idx <= 0) return {};
            const item = state.items[idx];
            const rest = state.items.filter((_, i) => i !== idx);
            return { items: [item, ...rest] };
          }),

        setHasHydrated: (v) => set({ hasHydrated: v }),
      }),
      {
        name: "consumer-cart",
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
        partialize: (state) => ({ items: state.items }),
      },
    ),
  ),
);

/** Tổng số lượng item (không phải số dòng) — dùng cho badge. */
export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

/** Tổng tiền hàng (chưa tính ship). */
export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectSelectedSubtotal = (state: CartState & CartActions) =>
  state.items
    .filter((i) => state.selectedProductIds.includes(i.productId))
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
