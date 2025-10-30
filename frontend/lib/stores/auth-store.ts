import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User } from '../api/auth';

/**
 * Auth Store - ONLY for persisting token and user state
 * NO API calls should be made here - use TanStack Query hooks instead
 */
interface AuthState {
  user: User | null;
  token: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      setAuth: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
