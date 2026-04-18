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

  login:        (identifier: string, pass: string) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  logout:       () => Promise<void>;
  setRole:      (role: string) => void;
  checkBio:     () => Promise<boolean>;
  loginWithBio: () => Promise<boolean>;
}

// Backend role → app role mapping
function mapRole(backendRole?: string): string {
  const map: Record<string, string> = {
    buyer:       'BUYER',
    seller:      'STORE',
    affiliate:   'SELLER',
    delivery:    'DRIVER',
    admin:       'BUYER',
    herder:      'HERDER',      // Малчнаас шууд — direct-from-herder seller
    coordinator: 'COORDINATOR', // local sum coordinator helping herders onboard
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
      login: async (identifier, password) => {
        set({ loading: true });
        try {
          // Detect phone (digits only, 8 chars) vs email
          const isPhone = /^\d{8,}$/.test(identifier.trim());
          const body = isPhone
            ? { phone: identifier.trim(), password }
            : { email: identifier.trim().toLowerCase(), password };
          const res: any = await post('/auth/login', body);
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

      // OTP нэвтрэлт
      loginWithOTP: async (phone: string, otp: string) => {
        set({ loading: true });
        try {
          const res: any = await post('/auth/otp/verify', { phone, code: otp });
          if (res?.token && res?.user) {
            await SecureStore.setItemAsync('token', res.token);
            const mappedRole = mapRole(res.user.role);
            set({ user: res.user, token: res.token, role: mappedRole, loading: false });
          } else {
            throw new Error('OTP баталгаажуулалт амжилтгүй');
          }
        } catch (e: any) {
          set({ loading: false });
          throw e;
        }
      },

      // OTP илгээх
      sendOTP: async (phone: string) => {
        const res: any = await post('/auth/otp/send', { phone });
        return res;
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
