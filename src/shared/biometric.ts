import * as LocalAuth from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIO_FLAG_KEY = 'bio_enabled';
const BIO_CREDS_KEY = 'eseller_biometric_creds';

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

export async function saveCredentials(
  phone: string,
  password: string,
): Promise<void> {
  await SecureStore.setItemAsync(
    BIO_CREDS_KEY,
    JSON.stringify({ phone, password }),
  );
  await AsyncStorage.setItem(BIO_FLAG_KEY, 'true');
}

export async function getSavedCredentials(): Promise<{
  phone: string;
  password: string;
} | null> {
  const enabled = await AsyncStorage.getItem(BIO_FLAG_KEY);
  if (enabled !== 'true') return null;
  const raw = await SecureStore.getItemAsync(BIO_CREDS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(BIO_FLAG_KEY);
  return v === 'true';
}

export async function disableBiometric(): Promise<void> {
  await AsyncStorage.removeItem(BIO_FLAG_KEY);
  await SecureStore.deleteItemAsync(BIO_CREDS_KEY);
}
