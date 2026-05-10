import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { post, get, setOnUnauthorized, isOfflineError, type ApiError } from '../services/api';

const log = (...args: unknown[]) => {
  if (__DEV__) console.log('[auth]', ...args);
};

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
        log('login start');
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
          log('login ok, role:', user?.role);
          set({
            user,
            token,
            role:    mapRole(user?.role),
            loading: false,
          });
        } catch (e: any) {
          log('login failed:', e?.message);
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

      // Restore a session using a previously issued JWT (e.g. after biometric
      // unlock or cold-start gate). Verifies the token with the backend before
      // marking the user as logged in.
      //
      // Error handling distinguishes "the token is bad" from "we couldn't reach
      // the backend". Only the former wipes SecureStore — a transient 5xx or
      // network blip used to cause `getBiometricSession()` to return null on
      // the next attempt because we'd already deleted the JWT.
      restoreSession: async (token: string) => {
        log('restoreSession start, token len:', token?.length);
        set({ loading: true });
        try {
          await SecureStore.setItemAsync('token', token);
          const res: any = await get('/auth/me');
          const user = res?.user || res;
          if (!user || !user.email) {
            log('restoreSession: /auth/me returned no usable user');
            throw new Error('Сесс хүчингүй');
          }
          log('restoreSession ok, role:', user.role);
          set({
            user,
            token,
            role: mapRole(user?.role),
            loading: false,
          });
        } catch (e: unknown) {
          const err = e as ApiError;
          const transient = isOfflineError(err) || (err.status != null && err.status >= 500);
          // Differentiated logs help reproduce-matrix debugging when a user
          // reports "logged out for no reason". A 401/403 is legitimately
          // expired credentials; offline/5xx is a transient blip we should
          // recover from on the next attempt.
          if (isOfflineError(err)) {
            log('restoreSession offline/transient', err.message);
          } else if (err.status === 401 || err.status === 403) {
            log('restoreSession 401/unauthorized — token will be wiped');
          } else {
            log('restoreSession failed:', err.message, 'status:', err.status, 'transient:', transient);
          }
          if (!transient) {
            // 401/403/404 → token is genuinely invalid; wipe so the next launch
            // doesn't keep retrying it. (The axios 401 interceptor in api.ts
            // already wipes for /auth/me, but this also covers shapes like
            // 200 + missing user that we treated as "Сесс хүчингүй" above.)
            await SecureStore.deleteItemAsync('token');
          }
          set({ user: null, token: null, role: 'BUYER', loading: false });
          throw new Error(err?.message || 'Сесс сэргээх амжилтгүй');
        }
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ user: null, token: null, role: 'BUYER' });
      },

      setRole: (role) => set({ role }),
    }),
    {
      name:    'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      // ⚠️ DO NOT persist `user` or `token` here. The token lives in SecureStore,
      // and persisting `user` without the token makes the app appear logged in
      // on cold start while every API call 401s — which then triggers the axios
      // 401 interceptor that wipes SecureStore, defeating biometric restore.
      // The cold-start gate (src/shared/sessionGate.ts) is the only path that
      // populates `user`/`token`, and it does so by verifying with /auth/me.
      partialize: (state) => ({ role: state.role }),
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
