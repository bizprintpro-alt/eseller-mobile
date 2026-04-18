import type { ViewStyle } from 'react-native';

/**
 * Light-card tokens used by the promotional home sections that sit on
 * the dark (tabs)/index.tsx root. Section titles + labels outside the
 * card use white/rgba-white; everything inside a `H.card` uses the
 * dark text tokens (textPrimary/Sub/Hint) on white.
 */
export const H = {
  // Card surface — "white island" inside dark root
  card:          '#FFFFFF',
  cardBorder:    'rgba(0,0,0,0.07)',
  cardRadius:    16,
  cardRadiusSm:  12,

  // Text — used inside the card on white bg
  textPrimary:   '#111111',
  textSub:       '#6B7280',
  textHint:      '#9CA3AF',

  // Brand
  primary:       '#4F46E5',
  primaryDark:   '#312E81',
  primaryTint:   '#EEF2FF',
  success:       '#059669',
  warning:       '#CA8A04',
  danger:        '#EF4444',

  // 8pt spacing
  mx:   16,
  gap:  8,
  gap2: 12,

  shadow: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  6,
    elevation:     3,
  } as ViewStyle,
} as const;
