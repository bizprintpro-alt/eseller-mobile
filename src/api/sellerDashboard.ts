// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Seller dashboard API client (PR103)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Calls the Sarana eSeller BFF read-only seller proxy routes (PR102),
// which themselves call the Negd internal S2S adapter (PR101). Mobile
// MUST NOT call Negd directly. The Sarana BFF carries the S2S
// integration key server-side; mobile only uses its existing Bearer
// token via the shared axios client in `src/services/api.ts`.
//
// All endpoints are GET-only and read-only. There are no mutation
// helpers in this file — PR103 mobile MUST NOT mutate seller dashboard
// data, MUST NOT compute wallet/commission client-side, MUST NOT show
// payout/withdraw UI.
//
// Response shape (PR98/PR101/PR102 envelope):
//
//   { ok: true,  data: <payload>, correlationId, responseVersion: "seller-dashboard.v1",
//     bff: "sarana-eseller", upstream: "negd" }
//
// or on error:
//
//   { ok: false, error: { code, message, retryable, supportHint },
//     correlationId, responseVersion, bff, upstream }
//
// The legacy axios response interceptor only unwraps `{ success: bool }`
// envelopes, so this newer `{ ok }` shape passes through unchanged. The
// helpers below read `.data` from the envelope (or throw a typed error).

import { get, ApiError } from '../services/api';

// ─── Envelope ────────────────────────────────────────────────────────────

export type SellerErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NO_IDENTITY_LINK'
  | 'NO_SELLER_PROFILE'
  | 'SELLER_NOT_APPROVED'
  | 'SELLER_SUSPENDED'
  | 'DASHBOARD_NOT_READY'
  | 'STALE_COMPUTATION'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'BFF_UPSTREAM_UNAVAILABLE'
  | 'IDENTITY_BRIDGE_UNAVAILABLE'
  | 'S2S_AUTH_FAILED'
  | 'S2S_NOT_CONFIGURED'
  | 'S2S_TIMESTAMP_INVALID'
  | 'NO_LINKED_USER';

export interface SellerErrorDetail {
  code: SellerErrorCode;
  message: string;
  retryable?: boolean;
  supportHint?: string | null;
}

export interface SellerEnvelopeSuccess<T> {
  ok: true;
  data: T;
  correlationId?: string;
  responseVersion?: string;
  bff?: string;
  upstream?: string;
}

export interface SellerEnvelopeFailure {
  ok: false;
  error: SellerErrorDetail;
  correlationId?: string;
  responseVersion?: string;
  bff?: string;
  upstream?: string;
}

export type SellerEnvelope<T> = SellerEnvelopeSuccess<T> | SellerEnvelopeFailure;

/**
 * Error thrown when the BFF returns a structured `{ ok: false, error }`
 * envelope. Carries the code so feature code can branch on
 * NO_IDENTITY_LINK / NO_SELLER_PROFILE / etc. without parsing strings.
 */
export class SellerApiError extends Error {
  code: SellerErrorCode;
  correlationId?: string;
  retryable?: boolean;

  constructor(detail: SellerErrorDetail, correlationId?: string) {
    super(detail.message || detail.code);
    this.code = detail.code;
    this.correlationId = correlationId;
    this.retryable = detail.retryable;
  }
}

function unwrap<T>(envelope: unknown): T {
  // Fallback messages are user-facing — errorMessageForCode() returns
  // err.message verbatim for INTERNAL_ERROR, so these strings can reach
  // the UI. Keep them in Mongolian to stay consistent with the rest of
  // the seller shell copy.
  if (!envelope || typeof envelope !== 'object') {
    throw new SellerApiError(
      { code: 'INTERNAL_ERROR', message: 'Сервэрийн хариу хоосон байна.' },
      undefined,
    );
  }
  const e = envelope as SellerEnvelope<T>;
  if (e.ok && 'data' in e) return e.data;
  if (!e.ok) {
    throw new SellerApiError(
      e.error ?? { code: 'INTERNAL_ERROR', message: 'Сервэрийн алдаа гарлаа.' },
      e.correlationId,
    );
  }
  throw new SellerApiError(
    { code: 'INTERNAL_ERROR', message: 'Сервэрийн өгөгдөл буруу байна.' },
    undefined,
  );
}

// ─── Response shapes (mirror PR98/PR101 helper return types) ─────────────

export interface SellerMeResponse {
  user: {
    id: string;
    role: string;
    displayName: string | null;
  };
  resellerProfile: {
    id: string;
    displayName: string | null;
    status: string; // "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED"
    kycStatus: string;
  };
  financeEligibility: string; // "NOT_AVAILABLE" in PR97 era
  identityLink: {
    provider: string;
    status: string;
    verifiedAt: string | null;
  } | null;
  warnings: string[];
}

export interface SellerWalletSummary {
  estimatedMnt: number;
  inReviewMnt: number;
  approvedNotPayableMnt: number;
  payableMnt: number; // ALWAYS 0 in PR97 era (effective=true rows only)
  paidOutMnt: number; // ALWAYS 0 (no payout flow exists)
  excludedMnt: number;
  sourceCounts: {
    dryRun: number;
    needsReview: number;
    approvedForFuturePosting: number;
    excluded: number;
    cancelled: number;
    effective: number; // ALWAYS 0 in PR97 era
  };
  invariants: {
    effectiveZeroExpected: boolean;
    payableSourcedOnlyFromEffectiveTrue: true;
  };
  warnings: string[];
  lastComputedAt: string;
}

export interface SellerReferralSummary {
  activeReferralCode: {
    id: string;
    code: string;
    activeFrom: string;
    rotationCount: number;
    abuseFlag: boolean;
  } | null;
  referralCodeCounts: {
    active: number;
    rotated: number;
    revoked: number;
    disabledForAbuse: number;
  };
  inviteLinkCounts: {
    active: number;
    expired: number;
    revoked: number;
    disabledForAbuse: number;
    totalUseCount: number;
  };
  warnings: string[];
}

export interface SellerLeadSummary {
  totals: {
    new: number;
    qualified: number;
    contacted: number;
    convertedToRequest: number;
    rejected: number;
    expired: number;
    duplicate: number;
    spam: number;
  };
  recentLeads: Array<{
    id: string;
    status: string;
    intent: string;
    source: string;
    createdAt: string;
    hasRegisteredCustomer: boolean;
    hasConvertedRequest: boolean;
    // NOTE: customer phone/email/name/note are NEVER exposed by the
    // BFF response. The UI must NOT request them.
  }>;
  warnings: string[];
}

export interface SellerCommissionSummary {
  effectiveZeroInvariant: boolean; // ALWAYS true in PR97 era
  totals: {
    dryRun: number;
    needsReview: number;
    approvedForFuturePosting: number;
    excluded: number;
    cancelled: number;
    effective: number; // ALWAYS 0 in PR97 era
  };
  proposedAmountsMnt: {
    dryRun: number;
    inReview: number;
    approvedNotPayable: number;
  };
  payableAmountMnt: number; // ALWAYS 0 in PR97 era
  recentTransactions: Array<{
    id: string;
    status: string;
    type: string;
    eligibilityReason: string | null;
    exclusionReason: string | null;
    amountMnt: number;
    effective: boolean;
    createdAt: string;
  }>;
  warnings: string[];
}

export interface SellerDashboardResponse {
  me: SellerMeResponse;
  referralSummary: SellerReferralSummary;
  leadSummary: SellerLeadSummary;
  commissionSummary: SellerCommissionSummary;
  walletSummary: SellerWalletSummary;
  notificationsSummary: {
    deferred: boolean;
    reason?: string;
  };
  warnings: string[];
  nextActions: Array<{
    code: string;
    message: string;
  }>;
}

// ─── API helpers (GET-only, no mutations) ────────────────────────────────

export async function getSellerMe(): Promise<SellerMeResponse> {
  const env = await get('/seller/me');
  return unwrap<SellerMeResponse>(env);
}

export async function getSellerDashboard(): Promise<SellerDashboardResponse> {
  const env = await get('/seller/dashboard');
  return unwrap<SellerDashboardResponse>(env);
}

export async function getSellerWalletSummary(): Promise<SellerWalletSummary> {
  const env = await get('/seller/wallet-summary');
  return unwrap<SellerWalletSummary>(env);
}

export async function getSellerReferralSummary(): Promise<SellerReferralSummary> {
  const env = await get('/seller/referral-summary');
  return unwrap<SellerReferralSummary>(env);
}

export async function getSellerLeadSummary(): Promise<SellerLeadSummary> {
  const env = await get('/seller/lead-summary');
  return unwrap<SellerLeadSummary>(env);
}

export async function getSellerCommissionSummary(): Promise<SellerCommissionSummary> {
  const env = await get('/seller/commission-summary');
  return unwrap<SellerCommissionSummary>(env);
}

// ─── Helpers for UI error mapping ────────────────────────────────────────

/**
 * Map an unknown error from a seller dashboard query to a small
 * presentation-layer descriptor. Does not include raw error messages
 * unless they look safe (no PII / no token text).
 */
export interface SellerUIError {
  /** A code the UI can branch on (matches SellerErrorCode where possible). */
  code: SellerErrorCode;
  /** A user-facing message in Mongolian. */
  message: string;
  /** correlationId from the BFF if the response carried one. */
  correlationId?: string;
  /** True when the device appears to be offline (no HTTP response). */
  isOffline: boolean;
}

export function describeSellerError(err: unknown): SellerUIError {
  if (err instanceof SellerApiError) {
    return {
      code: err.code,
      message: errorMessageForCode(err.code, err.message),
      correlationId: err.correlationId,
      isOffline: false,
    };
  }
  const apiErr = err as ApiError | undefined;
  const isOffline = !!apiErr?.isOffline;
  if (isOffline) {
    return {
      code: 'BFF_UPSTREAM_UNAVAILABLE',
      message: 'Сүлжээний холболт алдагдсан. Дахин оролдоно уу.',
      isOffline: true,
    };
  }
  const status = apiErr?.status;
  if (status === 401) {
    return { code: 'UNAUTHENTICATED', message: 'Дахин нэвтэрнэ үү.', isOffline: false };
  }
  if (status === 403) {
    return { code: 'FORBIDDEN', message: 'Хандалт хориотой.', isOffline: false };
  }
  if (status === 404) {
    return {
      code: 'NO_SELLER_PROFILE',
      message: 'Худалдагчийн профайл олдсонгүй.',
      isOffline: false,
    };
  }
  return {
    code: 'INTERNAL_ERROR',
    message: 'Сервэр түр алдаатай байна. Дахин оролдоно уу.',
    isOffline: false,
  };
}

function errorMessageForCode(code: SellerErrorCode, fallback: string): string {
  switch (code) {
    case 'UNAUTHENTICATED':
      return 'Дахин нэвтэрнэ үү.';
    case 'FORBIDDEN':
      return 'Хандалт хориотой.';
    case 'NO_IDENTITY_LINK':
      return 'Бүртгэл холбогдоогүй байна. Дэмжлэгийн багтай холбогдоно уу.';
    case 'NO_SELLER_PROFILE':
      return 'Худалдагчийн профайл олдсонгүй.';
    case 'SELLER_NOT_APPROVED':
      return 'Худалдагчийн өргөдөл татгалзагдсан.';
    case 'SELLER_SUSPENDED':
      return 'Худалдагчийн профайл түр түдгэлзүүлэгдсэн.';
    case 'DASHBOARD_NOT_READY':
      return 'Самбар бэлдэгдэж байна.';
    case 'STALE_COMPUTATION':
      return 'Мэдээлэл хуучирсан байна.';
    case 'RATE_LIMITED':
      return 'Хүсэлт олон удаа явуулсан байна. Хэсэг хүлээгээд дахин оролдоно уу.';
    case 'BFF_UPSTREAM_UNAVAILABLE':
    case 'IDENTITY_BRIDGE_UNAVAILABLE':
      return 'Үйлчилгээ түр боломжгүй байна.';
    case 'S2S_AUTH_FAILED':
    case 'S2S_NOT_CONFIGURED':
    case 'S2S_TIMESTAMP_INVALID':
    case 'NO_LINKED_USER':
    case 'INTERNAL_ERROR':
    default:
      return fallback || 'Сервэр түр алдаатай байна.';
  }
}
