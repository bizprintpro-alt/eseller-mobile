import { useColorScheme } from 'react-native';
import { LIGHT, DARK, ROLE_ACCENT, C } from './design';
import { useAuth } from '../store/auth';

/**
 * useTheme — role-aware theme hook.
 *
 * Returns:
 *   • isDark  — system dark mode
 *   • colors  — LIGHT or DARK palette
 *   • accent  — role-specific accent color (buyer blue, owner green,
 *              seller orange, driver red)
 *   • card, screen — pre-composed style objects
 */
export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? DARK : LIGHT;

  const { user, role } = useAuth();
  // role is uppercase app-internal (BUYER/STORE/SELLER/DRIVER)
  // user.role is backend lowercase (buyer/seller/delivery/affiliate)
  const accent =
    ROLE_ACCENT[role] ||
    ROLE_ACCENT[user?.role || 'buyer'] ||
    C.buyer;

  return {
    isDark,
    colors,
    accent,
    role,
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
  };
}
