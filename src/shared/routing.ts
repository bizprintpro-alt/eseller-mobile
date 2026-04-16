import { router } from 'expo-router';

/**
 * Route a freshly-authenticated user to their home group based on
 * the backend `role` field (lowercase) returned in the login response.
 *
 * Backend role mapping:
 *   buyer      → /(tabs)              — default buyer home
 *   seller     → /(owner)/dashboard    — shop owner (STORE in app)
 *   store      → /(owner)/dashboard    — legacy alias
 *   owner      → /(owner)/dashboard    — legacy alias
 *   affiliate  → /(seller)/dashboard   — commission marketer
 *   delivery   → /(driver)/deliveries  — courier
 *   driver     → /(driver)/deliveries  — alias
 *   admin      → /(tabs)
 */
export function routeByRole(role: string | null | undefined): void {
  const r = (role ?? '').toLowerCase();

  if (r === 'store' || r === 'owner') {
    router.replace('/(owner)/dashboard' as never);
    return;
  }
  if (r === 'affiliate') {
    router.replace('/(seller)/dashboard' as never);
    return;
  }
  if (r === 'delivery' || r === 'driver') {
    router.replace('/(driver)/deliveries' as never);
    return;
  }
  // buyer / admin / unknown
  router.replace('/(tabs)' as never);
}

