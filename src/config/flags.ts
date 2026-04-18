/**
 * Feature flags. Values are read from EXPO_PUBLIC_* env vars at bundle time.
 * Default OFF — opt-in by setting the corresponding env before `expo start`.
 */

function boolFlag(name: string, fallback = false): boolean {
  const v = (process.env as Record<string, string | undefined>)[name];
  if (v === undefined || v === null || v === '') return fallback;
  return v === '1' || v.toLowerCase() === 'true';
}

/** "Малчнаас шууд" — direct-from-herder marketplace (PRD v1.0). */
export const MALCHNAAS_ENABLED = boolFlag('EXPO_PUBLIC_MALCHNAAS_ENABLED', false);
