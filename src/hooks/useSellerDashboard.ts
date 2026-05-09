// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Seller dashboard react-query hooks (PR103)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Read-only only. No `useMutation` is exported from this file by design
// — PR103 mobile MUST NOT mutate any seller dashboard state. The
// existing client-app `useMutation` calls live elsewhere (cart, OTP,
// etc.) and are not affected.
//
// Stale-time policy:
//   wallet / commission ≤ 30 s   (money-like; per PR91 §F.4 / PR98)
//   referral / lead     ≤ 60 s
//   me                  ≤ 60 s
//
// `gcTime` (cache retention) is left at the global default (5 min)
// from app/_layout.tsx — sufficient for the dashboard refresh cadence.

import { useQuery } from '@tanstack/react-query';
import {
  getSellerMe,
  getSellerDashboard,
  getSellerWalletSummary,
  getSellerReferralSummary,
  getSellerLeadSummary,
  getSellerCommissionSummary,
} from '../api/sellerDashboard';

const STALE = {
  walletAndCommission: 30 * 1000, // 30 s
  referralAndLead: 60 * 1000, // 60 s
  me: 60 * 1000, // 60 s
} as const;

export function useSellerMe() {
  return useQuery({
    queryKey: ['seller', 'me'],
    queryFn: getSellerMe,
    staleTime: STALE.me,
  });
}

export function useSellerDashboard() {
  return useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: getSellerDashboard,
    // Composed view follows the strictest TTL in the bundle.
    staleTime: STALE.walletAndCommission,
  });
}

export function useSellerWalletSummary() {
  return useQuery({
    queryKey: ['seller', 'wallet-summary'],
    queryFn: getSellerWalletSummary,
    staleTime: STALE.walletAndCommission,
  });
}

export function useSellerReferralSummary() {
  return useQuery({
    queryKey: ['seller', 'referral-summary'],
    queryFn: getSellerReferralSummary,
    staleTime: STALE.referralAndLead,
  });
}

export function useSellerLeadSummary() {
  return useQuery({
    queryKey: ['seller', 'lead-summary'],
    queryFn: getSellerLeadSummary,
    staleTime: STALE.referralAndLead,
  });
}

export function useSellerCommissionSummary() {
  return useQuery({
    queryKey: ['seller', 'commission-summary'],
    queryFn: getSellerCommissionSummary,
    staleTime: STALE.walletAndCommission,
  });
}
