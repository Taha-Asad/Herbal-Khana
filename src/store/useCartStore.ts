import { create } from "zustand";

interface CartItem {
  id: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  recalcTotal: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalItems: 0,

  addItem: (item) =>
    set((state) => {
      const items = [...state.items, item];
      return {
        items,
        totalItems: items.reduce((s, i) => s + i.quantity, 0),
      };
    }),

  removeItem: (id) =>
    set((state) => {
      const items = state.items.filter((i) => i.id !== id);
      return {
        items,
        totalItems: items.reduce((s, i) => s + i.quantity, 0),
      };
    }),

  recalcTotal: () =>
    set((state) => ({
      totalItems: state.items.reduce((s, i) => s + i.quantity, 0),
    })),
}));
