import { create } from 'zustand';
import api from '../../core/api/axios';

interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  commune?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; role: string; fullName: string; phone: string; commune: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set({ token: data.token, user: data.user, loading: false });
    } catch (err: any) {
      set({ loading: false });
      const msg = err?.response?.data?.error || 'Login failed';
      throw new Error(msg);
    }
  },

  register: async (input) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', input);
      set({ token: data.token, user: data.user, loading: false });
    } catch (err: any) {
      set({ loading: false });
      const msg = err?.response?.data?.error || 'Registration failed';
      throw new Error(msg);
    }
  },

  logout: () => set({ token: null, user: null }),

  setUser: (user, token) => set({ user, token }),
}));
