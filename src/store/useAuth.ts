import { create } from 'zustand';
import api from '@/lib/api';
import { useShop } from './shop';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('dhaga_user') || 'null'),
  token: localStorage.getItem('dhaga_token'),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('dhaga_token', data.token);
    localStorage.setItem('dhaga_user', JSON.stringify(data));
    set({ user: data, token: data.token });
    
    // Restore wishlist from cloud
    if (data.wishlist) {
      useShop.getState().setWishlist(data.wishlist);
    }
  },

  signup: async (name, email, phone, password) => {
    const { data } = await api.post('/auth/signup', { name, email, phone, password });
    localStorage.setItem('dhaga_token', data.token);
    localStorage.setItem('dhaga_user', JSON.stringify(data));
    set({ user: data, token: data.token });
    
    // Initial wishlist (empty)
    useShop.getState().clearWishlist();
  },

  logout: () => {
    localStorage.removeItem('dhaga_token');
    localStorage.removeItem('dhaga_user');
    set({ user: null, token: null });
    
    // Clear wishlist on logout for privacy
    useShop.getState().clearWishlist();
  },

  checkAuth: () => {
    const token = localStorage.getItem('dhaga_token');
    const user = JSON.parse(localStorage.getItem('dhaga_user') || 'null');
    if (token && user) {
      set({ user, token });
    }
  }
}));
