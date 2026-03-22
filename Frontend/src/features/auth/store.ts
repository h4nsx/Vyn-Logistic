import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Update this interface
interface User {
  name: string;
  email: string;
  initials: string;
  role: string; // <--- Add this line
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => {
        set({ isAuthenticated: false, user: null, token: null });
        localStorage.removeItem('vyn-auth-storage');
      },
    }),
    {
      name: 'vyn-auth-storage',
    }
  )
);