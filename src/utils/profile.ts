/**
 * Profile screen helpers shared across (tabs)/(owner)/(seller)/(driver).
 */

export function getReferralLink(userId?: string | null): string {
  if (!userId) return 'https://eseller.mn/';
  return `https://eseller.mn/ref/${userId.slice(-8)}`;
}

export function getReferralCode(userId?: string | null): string {
  if (!userId) return '—';
  return userId.slice(-8).toUpperCase();
}

const TIER_LABELS: Record<string, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  DIAMOND: 'Diamond',
};

export function getTierLabel(tier?: string | null): string {
  if (!tier) return 'Silver';
  return TIER_LABELS[tier.toUpperCase()] ?? tier;
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#9E9E9E',
  GOLD: '#C0953C',
  PLATINUM: '#7F77DD',
  DIAMOND: '#0F6E56',
};

export function getTierColor(tier?: string | null): string {
  if (!tier) return '#9E9E9E';
  return TIER_COLORS[tier.toUpperCase()] ?? '#9E9E9E';
}

export function getRatingStars(rating?: number | null): string {
  const r = Math.max(0, Math.min(5, Math.floor(rating ?? 0)));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

export function formatCurrency(amount?: number | null): string {
  return ((amount ?? 0).toLocaleString('mn-MN')) + '₮';
}

export function formatCount(n?: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
