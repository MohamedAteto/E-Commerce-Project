import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  welcomeVisible: boolean;
  checkAuth: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<User>;
  dismissWelcome: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  welcomeVisible: false,

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.get('/auth/me');
      set({ user: res.data.data.user, isInitialized: true, isLoading: false });
    } catch {
      set({ user: null, isInitialized: true, isLoading: false });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/login', credentials);
      const user = res.data.data.user;
      set({ user, isLoading: false, welcomeVisible: true });
      return user;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/register', data);
      const user = res.data.data.user;
      set({ user, isLoading: false, welcomeVisible: true });
      return user;
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null });
    } catch {
      set({ user: null });
    }
  },

  dismissWelcome: () => set({ welcomeVisible: false }),

  clearError: () => set({ error: null }),
}));
