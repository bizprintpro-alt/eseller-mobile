import * as Haptics from 'expo-haptics'

export function useHaptic() {
  const light = () =>
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    )

  const medium = () =>
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium
    )

  const success = () =>
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    )

  const error = () =>
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    )

  const warning = () =>
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning
    )

  return { light, medium, success, error, warning }
}
