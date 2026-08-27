import { create } from 'zustand';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  subscriptionTier?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  fetchUser: () => Promise<void>;
  registerInit: (data: {
    email: string;
    phone: string;
    password: string;
    role: string;
  }) => Promise<{ registrationToken: string; userId: string }>;
  registerSelfie: (registrationToken: string, selfie: File) => Promise<void>;
  /** @deprecated use registerInit + registerSelfie */
  register: (data: {
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setToken: (token: string) => {
    Cookies.set('accessToken', token, { expires: 7 });
  },
  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;

    Cookies.set('accessToken', accessToken, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });

    set({ user, isAuthenticated: true });
  },
  registerInit: async (data) => {
    const response = await api.post('/auth/register-init', data);
    return response.data.data;
  },
  registerSelfie: async (registrationToken, selfie) => {
    const formData = new FormData();
    formData.append('registrationToken', registrationToken);
    formData.append('selfie', selfie);

    const response = await api.post('/auth/register-selfie', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const { user, accessToken, refreshToken } = response.data.data;
    Cookies.set('accessToken', accessToken, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });
    set({ user, isAuthenticated: true });
  },
  register: async (data) => {
    const init = await api.post('/auth/register-init', data);
    return init.data;
  },
  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
}));
