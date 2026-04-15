import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { post } from '../services/api';

/**
 * Request permission, create Android channels, fetch Expo push token,
 * and register it with the backend. Returns the token or null.
 */
export async function registerPushToken(): Promise<string | null> {
  try {
    // Simulators/emulators don't receive push
    if (!Device.isDevice) {
      console.warn('[Push] Simulator — push notification ажиллахгүй');
      return null;
    }

    // Permission
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('[Push] Permission олгогдсонгүй');
      return null;
    }

    // Android channels — importance tiers per notification category
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Ерөнхий',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B3A5C',
      });
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Захиалга',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E67E22',
      });
      await Notifications.setNotificationChannelAsync('delivery', {
        name: 'Хүргэлт',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#27AE60',
      });
    }

    // Resolve EAS projectId from app.json (extra.eas.projectId)
    const projectId =
      (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId ??
      (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenData.data;

    // Server-д хадгалах (fire-and-forget — backend register endpoint exists)
    await post('/push/register', {
      token,
      platform: Platform.OS,
    }).catch((e) => console.warn('[Push] Token register failed:', e?.message));

    return token;
  } catch (e) {
    console.warn('[Push] registerPushToken error:', e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Map a received notification's `data.type` to an in-app route.
 * Called from notification tap handler in the root layout.
 */
export function resolveNotificationRoute(
  response: Notifications.NotificationResponse,
): string {
  const data = (response.notification.request.content.data ?? {}) as Record<string, string>;

  // Explicit screen override wins
  if (data.screen) return data.screen;

  const routes: Record<string, string> = {
    order_new: '/(owner)/orders',
    order_confirmed: '/orders',
    order_paid: '/orders',
    delivery_start: '/(driver)/deliveries',
    delivery_done: '/orders',
    payment_success: '/(customer)/wallet',
    promo: '/(tabs)',
    gold_expiry: '/(tabs)/gold',
    flash_sale: '/(customer)/flash-sale',
    live_start: '/(customer)/live',
    'seller-orders': '/(owner)/orders',
  };

  return routes[data.type] ?? '/(tabs)';
}

/** Keep the older export name working — used elsewhere. */
export function setupNotificationListeners(
  onNotification: (n: Notifications.Notification) => void,
  onResponse: (r: Notifications.NotificationResponse) => void,
) {
  const sub1 = Notifications.addNotificationReceivedListener(onNotification);
  const sub2 = Notifications.addNotificationResponseReceivedListener(onResponse);
  return () => {
    sub1.remove();
    sub2.remove();
  };
}
