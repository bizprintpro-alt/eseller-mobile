// Cold-start session gate.
//
// Flow:
//   1. Read SecureStore('token').
//   2. If absent → status = 'unauthenticated'. Caller renders the normal
//      tree; protected routes redirect to /(auth)/login as usual.
//   3. If present and biometric is enabled → run the biometric prompt.
//      a) success → restoreSession(token) → 'authenticated' or
//         'session-invalid' if /auth/me rejects the token.
//      b) cancel/fail → 'biometric-failed'. Caller should keep the user on
//         the unlock UI (don't auto-route to anywhere authenticated).
//   4. If present but biometric is NOT enabled → call restoreSession(token)
//      silently → 'authenticated' or 'session-invalid'.
//
// Reasoning: zustand's `persist` does NOT (and must not) carry the token —
// the token lives in SecureStore. Without this gate, cold start would hand
// out a stale `user` snapshot with no token, the first API call would 401,
// and the axios 401 interceptor would wipe SecureStore — destroying any
// hope of restoring via biometric.
//
// All steps log under [gate] in __DEV__.

import * as SecureStore from 'expo-secure-store';
import {
  authenticateWithBiometric,
  isBiometricAvailable,
  isBiometricEnabled,
} from './biometric';
import { useAuth } from '../store/auth';

const log = (...args: unknown[]) => {
  if (__DEV__) console.log('[gate]', ...args);
};

export type SessionGateStatus =
  | 'authenticated'
  | 'unauthenticated'
  | 'session-invalid'
  | 'biometric-failed';

export interface SessionGateResult {
  status: SessionGateStatus;
  /** If biometric prompt ran, the underlying error code from
   *  expo-local-authentication (e.g. 'user_cancel'). */
  biometricError?: string;
}

export async function runSessionGate(): Promise<SessionGateResult> {
  log('start');
  const token = await SecureStore.getItemAsync('token');
  log('token present:', !!token);

  if (!token) {
    return { status: 'unauthenticated' };
  }

  const bioEnabled = await isBiometricEnabled();
  log('bio enabled flag:', bioEnabled);

  // Path A — biometric required. Only prompt if hardware is actually present
  // and an enrollment exists; otherwise we'd just confuse the user.
  if (bioEnabled) {
    const bio = await isBiometricAvailable();
    log('bio status:', bio);

    if (bio.available) {
      const auth = await authenticateWithBiometric('eSeller-д нэвтрэх');
      log('bio auth:', auth);
      if (!auth.success) {
        return { status: 'biometric-failed', biometricError: auth.error };
      }
      // Fallthrough to restoreSession below.
    } else {
      // Bio was enabled but hardware/enrollment is gone (factory reset, removed
      // fingerprint, etc). Fall through to silent restore — the JWT is still
      // valid; the user just lost the unlock convenience.
      log('bio enabled but unavailable, falling through to silent restore. reason:', bio.reason);
    }
  }

  // Path B — silent restore (or biometric just succeeded).
  try {
    await useAuth.getState().restoreSession(token);
    log('restoreSession succeeded');
    return { status: 'authenticated' };
  } catch (e) {
    log('restoreSession threw:', (e as Error)?.message);
    // restoreSession already cleaned up auth state; SecureStore wipe depends
    // on whether the failure was transient (network/5xx) or terminal (401).
    return { status: 'session-invalid' };
  }
}
