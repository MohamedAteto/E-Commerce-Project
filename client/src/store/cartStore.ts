import { create } from 'zustand';
import { Cart } from '../types';
import { api } from '../services/api';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.get('/cart');
      set({ cart: res.data.data.cart, isLoading: false });
    } catch {
      set({ cart: null, isLoading: false });
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/cart/items', { productId, quantity });
      set({ cart: res.data.data.cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to add item', isLoading: false });
      throw err;
    }
  },

  updateItem: async (itemId: string, quantity: number) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      set({ cart: res.data.data.cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update item', isLoading: false });
      throw err;
    }
  },

  removeItem: async (itemId: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.delete(`/cart/items/${itemId}`);
      set({ cart: res.data.data.cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove item', isLoading: false });
      throw err;
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.delete('/cart');
      set({ cart: res.data.data.cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to clear cart', isLoading: false });
      throw err;
    }
  },
}));
