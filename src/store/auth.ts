import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { post } from '../services/api';

interface User {
  _id?:    string;
  id?:     string;
  name:    string;
  email:   string;
  phone?:  string;
  avatar?: string | null;
  role:    string;
}

interface AuthStore {
  user:      User | null;
  token:     string | null;
  role:      string;
  loading:   boolean;

  login:        (email: string, pass: string) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  logout:       () => Promise<void>;
  setRole:      (role: string) => void;
  checkBio:     () => Promise<boolean>;
  loginWithBio: () => Promise<boolean>;
}

// Backend role → app role mapping
function mapRole(backendRole?: string): string {
  const map: Record<string, string> = {
    buyer:     'BUYER',
    seller:    'STORE',
    affiliate: 'SELLER',
    delivery:  'DRIVER',
    admin:     'BUYER',
  };
  return map[backendRole || 'buyer'] || 'BUYER';
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user:    null,
      token:   null,
      role:    'BUYER',
      loading: false,

      // POST /auth/login (Express backend)
      login: async (email, password) => {
        set({ loading: true });
        try {
          const res: any = await post('/auth/login', { email, password });
          const token = res.token;
          const user = res.user;
          await SecureStore.setItemAsync('token', token);
          set({
            user,
            token,
            role:    mapRole(user?.role),
            loading: false,
          });
        } catch (e: any) {
          set({ loading: false });
          throw new Error(e?.message || 'Нэвтрэх амжилтгүй');
        }
      },

      // OTP — backend дээр одоогоор байхгүй, stub
      loginWithOTP: async (_phone, _otp) => {
        set({ loading: true });
        try {
          // TODO: Backend-д OTP endpoint нэмэгдмэгц идэвхжүүлнэ
          throw new Error('OTP нэвтрэлт одоогоор боломжгүй байна. Имэйлээр нэвтэрнэ үү.');
        } catch (e: any) {
          set({ loading: false });
          throw e;
        }
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ user: null, token: null, role: 'BUYER' });
      },

      setRole: (role) => set({ role }),

      checkBio: async () => {
        try {
          const hw = await LocalAuth.hasHardwareAsync();
          const en = await LocalAuth.isEnrolledAsync();
          return hw && en;
        } catch {
          return false;
        }
      },

      loginWithBio: async () => {
        try {
          const result = await LocalAuth.authenticateAsync({
            promptMessage:         'Нэвтрэхийн тулд',
            cancelLabel:           'Болих',
            disableDeviceFallback: false,
          });
          return result.success;
        } catch {
          return false;
        }
      },
    }),
    {
      name:    'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
      }),
    },
  ),
);
