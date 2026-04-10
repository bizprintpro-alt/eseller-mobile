import { Stack } from 'expo-router';
import { C } from '../../src/shared/design';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: C.bg },
      animation: 'slide_from_bottom',
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
