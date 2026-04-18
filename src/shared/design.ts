export const C = {
  // Primary — Buyer accent (цэнхэр)
  primary:    '#1A73E8',
  primaryDim: 'rgba(26,115,232,0.15)',

  // Brand — eseller улаан (зөвхөн logo, CTA)
  brand:    '#E8242C',
  brandDim: 'rgba(232,36,44,0.15)',

  // Secondary
  secondary:   '#34A853',
  secondaryDim:'rgba(52,168,83,0.15)',

  // Gold
  gold:    '#F9A825',
  goldDim: 'rgba(249,168,37,0.15)',

  // Error
  error:    '#EA4335',
  errorDim: 'rgba(234,67,53,0.15)',

  // Role accent
  buyer:    '#1A73E8',
  store:    '#0D652D',
  seller:   '#E37400',
  driver:   '#C62828',

  // Dark mode background
  bg:       '#F0F2F8',
  bgCard:   '#FFFFFF',
  bgSection:'#EAECF2',
  bgInput:  '#FFFFFF',

  // Border
  border:   '#E5E7EB',
  border2:  '#D1D5DB',

  // Text
  text:     '#111111',
  textSub:  '#6B7280',
  textMuted:'#9CA3AF',

  // Status
  success:  '#34A853',
  warning:  '#F9A825',

  // Special
  white: '#FFFFFF',
  black: '#000000',
};

export const R = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
  full: 999,
};

export const F = {
  h1:    { fontSize: 28, fontWeight: '900' as const, letterSpacing: -0.5 },
  h2:    { fontSize: 22, fontWeight: '800' as const },
  h3:    { fontSize: 18, fontWeight: '700' as const },
  h4:    { fontSize: 16, fontWeight: '700' as const },
  body:  { fontSize: 15, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  tiny:  { fontSize: 11, fontWeight: '400' as const },
};

export const S = {
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius:  8,
    elevation:     6,
  },
  elevated: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius:  16,
    elevation:     12,
  },
};

export function roleColor(role: string): string {
  return ({
    BUYER:  C.buyer,
    STORE:  C.store,
    SELLER: C.seller,
    DRIVER: C.driver,
  } as Record<string, string>)[role] ?? C.primary;
}

export function roleIcon(role: string): string {
  return ({
    BUYER:  'cart',
    STORE:  'storefront',
    SELLER: 'megaphone',
    DRIVER: 'car',
  } as Record<string, string>)[role] ?? 'person';
}

export function roleName(role: string): string {
  return ({
    BUYER:  'Худалдан авагч',
    STORE:  'Дэлгүүр эзэн',
    SELLER: 'Борлуулагч',
    DRIVER: 'Жолооч',
  } as Record<string, string>)[role] ?? role;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME PALETTES (light + dark)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LIGHT = {
  bg:            '#FAFAFA',
  bgCard:        '#FFFFFF',
  bgSection:     '#F5F5F5',
  bgInput:       '#F0F0F0',
  border:        '#E0E0E0',
  border2:       '#EEEEEE',
  text:          '#1A1A2E',
  textSub:       '#616161',
  textMuted:     '#9E9E9E',
} as const;

export const DARK = {
  bg:       '#F0F2F8',
  bgCard:   '#FFFFFF',
  bgSection:'#EAECF2',
  bgInput:  '#FFFFFF',
  border:   '#E5E7EB',
  border2:  '#D1D5DB',
  text:     '#111111',
  textSub:  '#6B7280',
  textMuted:'#9CA3AF',
} as const;

// Role color map (lowercase role → hex)
export const ROLE_ACCENT: Record<string, string> = {
  buyer:     C.buyer,
  store:     C.store,
  owner:     C.store,
  seller:    C.store,    // backend "seller" = STORE owner in app
  affiliate: C.seller,   // backend "affiliate" = SELLER (commission)
  delivery:  C.driver,
  driver:    C.driver,
  BUYER:     C.buyer,
  STORE:     C.store,
  SELLER:    C.seller,
  DRIVER:    C.driver,
};

