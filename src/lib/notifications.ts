import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { post } from '../services/api'

export async function registerPushToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') return null

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'eseller',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    const token = await Notifications.getExpoPushTokenAsync()

    // Server-т хадгалах
    await post('/push/register', {
      token: token.data,
      platform: Platform.OS,
    }).catch(() => {})

    return token.data
  } catch {
    return null
  }
}

export function setupNotificationListeners(
  onNotification: (n: Notifications.Notification) => void,
  onResponse: (r: Notifications.NotificationResponse) => void
) {
  const sub1 = Notifications.addNotificationReceivedListener(onNotification)
  const sub2 = Notifications.addNotificationResponseReceivedListener(onResponse)
  return () => { sub1.remove(); sub2.remove() }
}
