import { create } from 'zustand';
import type { User } from '../types/auth.types';
import { authApi } from '../features/auth/api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors on logout
    }
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await authApi.me();
      if (response.data?.success) {
        set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
