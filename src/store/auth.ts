import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { post } from '../services/api';

interface User {
  id:     string;
  name:   string;
  email:  string;
  phone:  string;
  avatar: string | null;
  roles:  string[];
}

interface AuthStore {
  user:      User | null;
  token:     string | null;
  role:      string;
  loading:   boolean;
  biometric: boolean;

  login:        (email: string, pass: string) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  logout:       () => Promise<void>;
  setRole:      (role: string) => void;
  checkBio:     () => Promise<boolean>;
  loginWithBio: () => Promise<boolean>;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user:      null,
      token:     null,
      role:      'BUYER',
      loading:   false,
      biometric: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res: any = await post('/auth/signin', { email, password });
          await SecureStore.setItemAsync('token', res.token);
          set({
            user:    res.user,
            token:   res.token,
            role:    res.user.roles?.[0] || 'BUYER',
            loading: false,
          });
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },

      loginWithOTP: async (phone, otp) => {
        set({ loading: true });
        try {
          const res: any = await post('/auth/otp-verify', { phone, otp });
          await SecureStore.setItemAsync('token', res.token);
          set({
            user:    res.user,
            token:   res.token,
            role:    res.user.roles?.[0] || 'BUYER',
            loading: false,
          });
        } catch (e) {
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
        const hw = await LocalAuth.hasHardwareAsync();
        const en = await LocalAuth.isEnrolledAsync();
        return hw && en;
      },

      loginWithBio: async () => {
        const result = await LocalAuth.authenticateAsync({
          promptMessage:         'Нэвтрэхийн тулд',
          cancelLabel:           'Болих',
          disableDeviceFallback: false,
        });
        return result.success;
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
