export const C = {
  // Brand
  brand:    '#E8242C',
  brandDim: 'rgba(232,36,44,0.15)',

  // Role
  buyer:    '#1A73E8',
  store:    '#0D9E5C',
  seller:   '#E37400',
  driver:   '#C62828',

  // Background
  bg:       '#0A0A0A',
  bgCard:   '#141414',
  bgSection:'#1A1A1A',

  // Border
  border:   '#222222',
  border2:  '#2A2A2A',

  // Text
  text:     '#EFEFEF',
  textSub:  '#999999',
  textMuted:'#555555',

  // Status
  success:  '#34A853',
  warning:  '#F9A825',
  error:    '#EA4335',
  gold:     '#F9A825',

  white:    '#FFFFFF',
  black:    '#000000',
};

export const R = {
  xs:   6,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 999,
};

export const S = {
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:  8,
    elevation:     6,
  },
};

export function roleColor(role: string): string {
  const map: Record<string, string> = {
    BUYER:  C.buyer,
    STORE:  C.store,
    SELLER: C.seller,
    DRIVER: C.driver,
  };
  return map[role] ?? C.brand;
}

export function roleIcon(role: string): string {
  const map: Record<string, string> = {
    BUYER:  'cart',
    STORE:  'storefront',
    SELLER: 'megaphone',
    DRIVER: 'car',
  };
  return map[role] ?? 'person';
}
