/**
 * Feature flags. Values are read from EXPO_PUBLIC_* env vars at bundle time.
 * Default OFF — opt-in by setting the corresponding env before `expo start`.
 */

function boolFlag(name: string, fallback = false): boolean {
  const v = (process.env as Record<string, string | undefined>)[name];
  if (v === undefined || v === null || v === '') return fallback;
  return v === '1' || v.toLowerCase() === 'true';
}

function csvFlag(name: string, fallback: readonly string[]): readonly string[] {
  const v = (process.env as Record<string, string | undefined>)[name];
  if (!v) return fallback;
  return v.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
}

/** "Малчнаас шууд" — direct-from-herder marketplace (PRD v1.0). */
export const MALCHNAAS_ENABLED = boolFlag('EXPO_PUBLIC_MALCHNAAS_ENABLED', false);

/**
 * Pilot aimag codes for the Phase-1 rollout (PRD v1.0 §8).
 * Herder onboarding is hard-gated to these codes so we don't accept
 * applications we can't fulfill logistically. Override via
 * `EXPO_PUBLIC_MALCHNAAS_PILOT_AIMAGS="AKH,TOV,SEL"` (comma-separated codes).
 */
export const MALCHNAAS_PILOT_AIMAGS: readonly string[] = csvFlag(
  'EXPO_PUBLIC_MALCHNAAS_PILOT_AIMAGS',
  ['AKH', 'TOV', 'SEL'],
);

export function isPilotAimag(code: string | null | undefined): boolean {
  if (!code) return false;
  return MALCHNAAS_PILOT_AIMAGS.includes(code.toUpperCase());
}
