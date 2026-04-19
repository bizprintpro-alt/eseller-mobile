/**
 * Static feature-flag defaults read from EXPO_PUBLIC_* env vars at bundle
 * time. These are the *fallback* values — the effective runtime values
 * come from `remoteFlags.ts`, which overlays a cached remote-config
 * response on top of these defaults.
 *
 * Do NOT import these constants in UI code. Use the `useMalchnaasEnabled`
 * / `usePilotAimags` hooks (or the `getMalchnaas*` snapshots) so ops can
 * flip pilot aimags without shipping a new build.
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

/**
 * Build-time default for the Малчнаас шууд kill-switch.
 * Pilot went live — default to ON so the "Малчны булан" section shows on
 * first boot before the /config/mobile round-trip completes. Ops can still
 * flip it off from the backend remote-config.
 */
export const MALCHNAAS_ENABLED_DEFAULT = boolFlag('EXPO_PUBLIC_MALCHNAAS_ENABLED', true);

/**
 * Build-time default pilot aimag list. Overridable via
 * `EXPO_PUBLIC_MALCHNAAS_PILOT_AIMAGS="AKH,TOV,SEL"` (comma-separated codes).
 */
export const MALCHNAAS_PILOT_AIMAGS_DEFAULT: readonly string[] = csvFlag(
  'EXPO_PUBLIC_MALCHNAAS_PILOT_AIMAGS',
  ['AKH', 'TOV', 'SEL'],
);
