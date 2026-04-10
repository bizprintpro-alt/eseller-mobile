import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id:         string;
  name:       string;
  price:      number;
  image:      string | null;
  qty:        number;
  entityId:   string;
  entityName: string;
}

interface CartStore {
  items:  CartItem[];
  add:    (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear:  () => void;
  total:  () => number;
  count:  () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item, qty = 1) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + qty } : i,
            ),
          };
        }
        return { items: [...state.items, { ...item, qty }] };
      }),

      remove: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      update: (id, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
      })),

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name:    'cart-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
