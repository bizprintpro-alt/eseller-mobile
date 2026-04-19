import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import { post, get, setOnUnauthorized } from '../services/api';

/** Backend role as returned by the Express API. */
export type BackendRole =
  | 'buyer'
  | 'seller'
  | 'affiliate'
  | 'delivery'
  | 'admin'
  | 'herder'       // Малчнаас шууд — direct-from-herder seller
  | 'coordinator'; // local sum coordinator helping herders onboard

/** App-side role used by the UI (RoleSwitcherBar pills, route guards). */
export type AppRole = 'BUYER' | 'STORE' | 'SELLER' | 'DRIVER' | 'HERDER' | 'COORDINATOR';

interface User {
  _id?:    string;
  id?:     string;
  name:    string;
  email:   string;
  phone?:  string;
  avatar?: string | null;
  role:    BackendRole | string;
}

interface AuthStore {
  user:      User | null;
  token:     string | null;
  role:      AppRole;
  loading:   boolean;

  login:          (identifier: string, pass: string) => Promise<void>;
  loginWithOTP:   (phone: string, otp: string) => Promise<void>;
  restoreSession: (token: string) => Promise<void>;
  logout:         () => Promise<void>;
  setRole:        (role: AppRole) => void;
  checkBio:       () => Promise<boolean>;
  loginWithBio:   () => Promise<boolean>;
}

// Backend role → app role mapping
function mapRole(backendRole?: string): AppRole {
  const map: Record<string, AppRole> = {
    buyer:       'BUYER',
    seller:      'STORE',
    affiliate:   'SELLER',
    delivery:    'DRIVER',
    admin:       'BUYER',
    herder:      'HERDER',
    coordinator: 'COORDINATOR',
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

      // Restore a session using a previously issued JWT (e.g. after biometric unlock).
      // Verifies the token with the backend before marking the user as logged in.
      restoreSession: async (token: string) => {
        set({ loading: true });
        try {
          await SecureStore.setItemAsync('token', token);
          const res: any = await get('/auth/me');
          const user = res?.user || res;
          if (!user || !user.email) throw new Error('Сесс хүчингүй');
          set({
            user,
            token,
            role: mapRole(user?.role),
            loading: false,
          });
        } catch (e: any) {
          await SecureStore.deleteItemAsync('token');
          set({ user: null, token: null, role: 'BUYER', loading: false });
          throw new Error(e?.message || 'Сесс сэргээх амжилтгүй');
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

// axios 401 алдаа дээр auth state-г цэвэрлэх.
// api.ts-аас auth.ts руу шууд импорт хийвэл circular dep болно,
// тиймээс callback registration-ээр холбоно.
setOnUnauthorized(() => {
  SecureStore.deleteItemAsync('token').catch(() => {});
  useAuth.setState({ user: null, token: null, role: 'BUYER' });
});
