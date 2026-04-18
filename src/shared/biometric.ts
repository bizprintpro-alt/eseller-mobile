import * as LocalAuth from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIO_FLAG_KEY = 'bio_enabled';
const BIO_PHONE_KEY = 'eseller_biometric_phone';
// Legacy key — used to hold plaintext credentials; deleted on migration.
const LEGACY_BIO_CREDS_KEY = 'eseller_biometric_creds';

export async function isBiometricAvailable(): Promise<{
  available: boolean;
  type: string;
}> {
  try {
    const hw = await LocalAuth.hasHardwareAsync();
    if (!hw) return { available: false, type: '' };
    const enrolled = await LocalAuth.isEnrolledAsync();
    if (!enrolled) return { available: false, type: '' };
    const types = await LocalAuth.supportedAuthenticationTypesAsync();
    const type = types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION)
      ? 'Face ID'
      : 'Touch ID';
    return { available: true, type };
  } catch {
    return { available: false, type: '' };
  }
}

export async function authenticateWithBiometric(
  promptMessage = 'eSeller-д нэвтрэх',
): Promise<boolean> {
  try {
    const res = await LocalAuth.authenticateAsync({
      promptMessage,
      cancelLabel: 'Болих',
      fallbackLabel: 'Нууц үг ашиглах',
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}

/**
 * Enable biometric unlock for the current session. We only persist the phone
 * (as a UI hint); the actual session JWT is already kept in SecureStore under
 * the 'token' key by the auth store. Biometric auth gates access to that JWT
 * — we never persist the user's plaintext password.
 */
export async function enableBiometric(phone: string): Promise<void> {
  await SecureStore.setItemAsync(BIO_PHONE_KEY, phone);
  await AsyncStorage.setItem(BIO_FLAG_KEY, 'true');
  // Clean up any legacy plaintext credentials from older builds
  try { await SecureStore.deleteItemAsync(LEGACY_BIO_CREDS_KEY); } catch {}
}

/**
 * After a successful biometric prompt, return the still-valid session token
 * (issued at original password login) plus the stored phone hint.
 * Returns null if biometric isn't enabled or the JWT has been cleared.
 */
export async function getBiometricSession(): Promise<{
  phone: string;
  token: string;
} | null> {
  const enabled = await AsyncStorage.getItem(BIO_FLAG_KEY);
  if (enabled !== 'true') return null;
  const phone = await SecureStore.getItemAsync(BIO_PHONE_KEY);
  const token = await SecureStore.getItemAsync('token');
  if (!phone || !token) return null;
  return { phone, token };
}

export async function isBiometricEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(BIO_FLAG_KEY);
  return v === 'true';
}

export async function disableBiometric(): Promise<void> {
  await AsyncStorage.removeItem(BIO_FLAG_KEY);
  await SecureStore.deleteItemAsync(BIO_PHONE_KEY);
  try { await SecureStore.deleteItemAsync(LEGACY_BIO_CREDS_KEY); } catch {}
}
