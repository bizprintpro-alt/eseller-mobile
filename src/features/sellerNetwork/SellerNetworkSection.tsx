// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Seller-network read-only dashboard section (PR103)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Renders a composed seller-network dashboard view fetched from the
// Sarana BFF (`/api/seller/dashboard`, served by PR102, sourced from
// PR101 Negd S2S adapter).
//
// Strict read-only:
//   • NO `Withdraw` / `Payout` / `Гаргах` button anywhere.
//   • `payableMnt` rendered DISABLED with a "not available yet" label,
//     never as an actionable balance.
//   • Dry-run amounts clearly labelled "тооцоолсон / dry-run, төлөгдөх биш".
//   • Lead card shows REDACTED summaries only — no customer name /
//     phone / email / note (the BFF response does not return them).
//   • No referral rotate / invite create / lead mutate buttons.
//   • Composed from `useSellerDashboard()`; no client-side wallet or
//     commission math.
//
// Drop into `app/(seller)/dashboard.tsx` as a child of the existing
// ScrollView. The component handles its own loading / stale / error /
// offline UX.

import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, F } from '../../shared/design';
import { useSellerDashboard } from '../../hooks/useSellerDashboard';
import {
  describeSellerError,
  type SellerWalletSummary,
  type SellerReferralSummary,
  type SellerLeadSummary,
  type SellerCommissionSummary,
  type SellerMeResponse,
} from '../../api/sellerDashboard';

const fmtMnt = (n: number | null | undefined) =>
  ((n ?? 0).toLocaleString() + '₮');

// ─── Top-level section ───────────────────────────────────────────────────

export function SellerNetworkSection() {
  const q = useSellerDashboard();

  return (
    <View style={{ margin: 12, marginTop: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text style={{ ...F.h4, color: C.text }}>Худалдагчийн сүлжээ</Text>
        <SectionStatus query={q} />
      </View>

      {q.isLoading ? (
        <View style={{ padding: 24, alignItems: 'center', backgroundColor: C.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: C.border }}>
          <ActivityIndicator color={C.seller} />
          <Text style={{ color: C.textSub, marginTop: 8, fontSize: 13 }}>Ачааллаж байна…</Text>
        </View>
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : q.data ? (
        <View style={{ gap: 10 }}>
          <ProfileStatusCard me={q.data.me} />
          <WalletCard wallet={q.data.walletSummary} />
          <CommissionCard commission={q.data.commissionSummary} />
          <ReferralCard referral={q.data.referralSummary} />
          <LeadCard lead={q.data.leadSummary} />
          <NextActionsCard
            warnings={q.data.warnings}
            nextActions={q.data.nextActions}
          />
        </View>
      ) : null}
    </View>
  );
}

// ─── Header status (stale / fresh) ───────────────────────────────────────

function SectionStatus({ query }: { query: ReturnType<typeof useSellerDashboard> }) {
  if (query.isFetching) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <ActivityIndicator size="small" color={C.textSub} />
        <Text style={{ color: C.textSub, fontSize: 11 }}>Шинэчилж байна…</Text>
      </View>
    );
  }
  if (query.isStale && query.data) {
    return (
      <View
        style={{
          backgroundColor: C.goldDim,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: R.full,
        }}
      >
        <Text style={{ color: C.warning, fontSize: 10, fontWeight: '700' }}>ХУУЧИРСАН</Text>
      </View>
    );
  }
  return null;
}

// ─── Cards ───────────────────────────────────────────────────────────────

function ProfileStatusCard({ me }: { me: SellerMeResponse }) {
  const status = me.resellerProfile.status;
  const kyc = me.resellerProfile.kycStatus;
  const verified = me.identityLink?.status === 'VERIFIED';
  return (
    <Card>
      <CardTitle icon="person-circle" title="Профайл" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Badge label={`Төлөв: ${mnSellerStatus(status)}`} tone={statusTone(status)} />
        <Badge label={`KYC: ${mnKycStatus(kyc)}`} tone={kycTone(kyc)} />
        <Badge
          label={verified ? 'Identity баталгаажсан' : 'Identity баталгаажаагүй'}
          tone={verified ? 'success' : 'muted'}
        />
      </View>
      {me.warnings.map((w, i) => (
        <Note key={i} text={w} tone="warning" />
      ))}
    </Card>
  );
}

function WalletCard({ wallet }: { wallet: SellerWalletSummary }) {
  const showWarnings = wallet.warnings.length > 0;
  return (
    <Card>
      <CardTitle icon="wallet" title="Орлогын тооцоо" />
      <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 8 }}>
        Серверээс тооцоологдсон. Гар утаснаас тооцохгүй.
      </Text>

      <Row>
        <Bucket
          label="Тооцоолсон"
          value={fmtMnt(wallet.estimatedMnt)}
          tone="info"
          hint="Dry-run, төлөгдөх биш"
        />
        <Bucket
          label="Хяналтанд"
          value={fmtMnt(wallet.inReviewMnt)}
          tone="warning"
          hint="Шалгаж байна"
        />
      </Row>
      <Row>
        <Bucket
          label="Зөвшөөрөгдсөн (төлөгдөөгүй)"
          value={fmtMnt(wallet.approvedNotPayableMnt)}
          tone="info"
          hint="Хүлээгдэж байна"
        />
        <DisabledPayableBucket value={fmtMnt(wallet.payableMnt)} />
      </Row>

      {wallet.excludedMnt > 0 && (
        <Note text={`Хасагдсан: ${fmtMnt(wallet.excludedMnt)}`} tone="muted" />
      )}
      {showWarnings &&
        wallet.warnings.map((w, i) => (
          <Note key={i} text={w} tone="muted" />
        ))}

      <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 8 }}>
        Сүүлд тооцоолсон: {wallet.lastComputedAt ? new Date(wallet.lastComputedAt).toLocaleString('mn-MN') : '—'}
      </Text>
    </Card>
  );
}

function DisabledPayableBucket({ value }: { value: string }) {
  // The payable bucket is INTENTIONALLY disabled. PR97 era: payableMnt
  // is sourced ONLY from effective=true rows, of which there are zero.
  // Showing a "Withdraw" button here is forbidden by PR103 spec.
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bgSection,
        borderRadius: R.md,
        padding: 12,
        opacity: 0.6,
        borderWidth: 1,
        borderColor: C.border,
        borderStyle: 'dashed',
      }}
    >
      <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '700' }}>
        Олгогдох (төлөх)
      </Text>
      <Text style={{ color: C.textSub, fontSize: 18, fontWeight: '800', marginTop: 4 }}>
        {value}
      </Text>
      <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 4 }}>
        Одоогоор боломжгүй
      </Text>
    </View>
  );
}

function CommissionCard({ commission }: { commission: SellerCommissionSummary }) {
  return (
    <Card>
      <CardTitle icon="cash" title="Шимтгэлийн тооцоо (dry-run)" />
      <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 8 }}>
        Бүх мөр dry-run, төлөгдөх биш. effective=false.
      </Text>
      <Row>
        <Stat label="Тооцоолсон" value={String(commission.totals.dryRun)} tone="info" />
        <Stat label="Шалгаж буй" value={String(commission.totals.needsReview)} tone="warning" />
      </Row>
      <Row>
        <Stat label="Зөвшөөрөгдсөн" value={String(commission.totals.approvedForFuturePosting)} tone="success" />
        <Stat label="Хасагдсан" value={String(commission.totals.excluded)} tone="muted" />
      </Row>
      <View style={{ marginTop: 10 }}>
        <KV label="Тооцоолсон дүн" value={fmtMnt(commission.proposedAmountsMnt.dryRun)} />
        <KV label="Шалгалтанд буй дүн" value={fmtMnt(commission.proposedAmountsMnt.inReview)} />
        <KV label="Зөвшөөрөгдсөн (төлөгдөөгүй)" value={fmtMnt(commission.proposedAmountsMnt.approvedNotPayable)} />
      </View>
      {commission.warnings.map((w, i) => (
        <Note key={i} text={w} tone="muted" />
      ))}
    </Card>
  );
}

function ReferralCard({ referral }: { referral: SellerReferralSummary }) {
  const code = referral.activeReferralCode;
  return (
    <Card>
      <CardTitle icon="megaphone" title="Урих код / линк" />
      {code ? (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: C.textMuted, fontSize: 11 }}>Идэвхтэй код</Text>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginTop: 2 }}>
            {code.code}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
            Эхэлсэн: {new Date(code.activeFrom).toLocaleDateString('mn-MN')} · Ротаци: {code.rotationCount}
          </Text>
        </View>
      ) : (
        <Note text="Идэвхтэй код одоогоор байхгүй." tone="muted" />
      )}
      <Row>
        <Stat label="Идэвхтэй линк" value={String(referral.inviteLinkCounts.active)} tone="success" />
        <Stat label="Дууссан / цуцлагдсан" value={String(referral.inviteLinkCounts.expired + referral.inviteLinkCounts.revoked + referral.inviteLinkCounts.disabledForAbuse)} tone="muted" />
      </Row>
      <KV label="Хэрэглэгдсэн нийт" value={String(referral.inviteLinkCounts.totalUseCount)} />
      <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 6 }}>
        Зөвхөн харах. Код / линкийг гар утаснаас үүсгэх / эргүүлэх / цуцлах боломжгүй.
      </Text>
    </Card>
  );
}

function LeadCard({ lead }: { lead: SellerLeadSummary }) {
  const t = lead.totals;
  return (
    <Card>
      <CardTitle icon="people" title="Lead" />
      <Row>
        <Stat label="Шинэ" value={String(t.new)} tone="info" />
        <Stat label="Хариу авсан" value={String(t.contacted)} tone="warning" />
      </Row>
      <Row>
        <Stat label="Хүсэлт болсон" value={String(t.convertedToRequest)} tone="success" />
        <Stat label="Татгалзсан / spam" value={String(t.rejected + t.spam)} tone="muted" />
      </Row>
      {lead.recentLeads.length > 0 ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 6 }}>
            Сүүлийн {lead.recentLeads.length} (PII хааж харуулсан)
          </Text>
          {lead.recentLeads.slice(0, 5).map((l) => (
            <View
              key={l.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: 0.5,
                borderBottomColor: C.border,
              }}
            >
              <Text style={{ color: C.text, fontSize: 12 }}>
                {mnLeadStatus(l.status)} · {l.source}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 11 }}>
                {new Date(l.createdAt).toLocaleDateString('mn-MN')}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Note text="Lead одоогоор байхгүй." tone="muted" />
      )}
      <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 8 }}>
        Хэрэглэгчийн утас / имэйл / нэр / тэмдэглэлийг харуулахгүй.
      </Text>
    </Card>
  );
}

function NextActionsCard({
  warnings,
  nextActions,
}: {
  warnings: string[];
  nextActions: Array<{ code: string; message: string }>;
}) {
  if (warnings.length === 0 && nextActions.length === 0) return null;
  return (
    <Card>
      <CardTitle icon="information-circle" title="Анхааруулга / дараагийн алхам" />
      {warnings.map((w, i) => (
        <Note key={`w${i}`} text={w} tone="warning" />
      ))}
      {nextActions.map((a, i) => (
        <Note
          key={`a${i}`}
          text={a.message}
          tone="info"
        />
      ))}
    </Card>
  );
}

// ─── Building blocks ─────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      {children}
    </View>
  );
}

function CardTitle({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <Ionicons name={icon} size={18} color={C.seller} />
      <Text style={{ color: C.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>{children}</View>;
}

function Bucket({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: ToneKey;
  hint?: string;
}) {
  const t = TONES[tone];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.bgDim,
        borderRadius: R.md,
        padding: 12,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      <Text style={{ color: t.fg, fontSize: 11, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: t.fg, fontSize: 18, fontWeight: '800', marginTop: 4 }}>{value}</Text>
      {hint && (
        <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 4 }}>{hint}</Text>
      )}
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: ToneKey }) {
  const t = TONES[tone];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bgSection,
        borderRadius: R.md,
        padding: 10,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <Text style={{ color: C.textMuted, fontSize: 10 }}>{label}</Text>
      <Text style={{ color: t.fg, fontSize: 16, fontWeight: '800', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: C.textSub, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 12, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: ToneKey }) {
  const t = TONES[tone];
  return (
    <View
      style={{
        backgroundColor: t.bgDim,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: R.full,
      }}
    >
      <Text style={{ color: t.fg, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function Note({ text, tone }: { text: string; tone: ToneKey }) {
  const t = TONES[tone];
  return (
    <View
      style={{
        backgroundColor: t.bgDim,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: R.sm,
        marginTop: 6,
      }}
    >
      <Text style={{ color: t.fg, fontSize: 11 }}>{text}</Text>
    </View>
  );
}

function ErrorCard({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const desc = describeSellerError(error);
  return (
    <View
      style={{
        backgroundColor: C.errorDim,
        borderRadius: R.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: C.error,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="alert-circle" size={18} color={C.error} />
        <Text style={{ color: C.error, fontWeight: '700', fontSize: 14 }}>
          {desc.isOffline ? 'Офлайн горим' : 'Алдаа'}
        </Text>
      </View>
      <Text style={{ color: C.text, marginTop: 6, fontSize: 13 }}>{desc.message}</Text>
      {desc.correlationId && (
        <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 4 }}>
          Лавлах ID: {desc.correlationId}
        </Text>
      )}
      <TouchableOpacity
        onPress={onRetry}
        style={{
          marginTop: 10,
          alignSelf: 'flex-start',
          backgroundColor: C.bgCard,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: R.md,
          borderWidth: 1,
          borderColor: C.error,
        }}
      >
        <Text style={{ color: C.error, fontSize: 12, fontWeight: '700' }}>Дахин оролдох</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Tones ───────────────────────────────────────────────────────────────

type ToneKey = 'success' | 'warning' | 'info' | 'muted' | 'danger';

const TONES: Record<
  ToneKey,
  { fg: string; bgDim: string; border: string }
> = {
  success: { fg: C.secondary, bgDim: C.secondaryDim, border: C.border },
  warning: { fg: C.warning, bgDim: C.goldDim, border: C.border },
  info: { fg: C.primary, bgDim: C.primaryDim, border: C.border },
  muted: { fg: C.textSub, bgDim: C.bgSection, border: C.border },
  danger: { fg: C.error, bgDim: C.errorDim, border: C.border },
};

// ─── Mongolian status labels ─────────────────────────────────────────────

function mnSellerStatus(s: string): string {
  switch (s) {
    case 'PENDING': return 'Хүлээгдэж байна';
    case 'ACTIVE': return 'Идэвхтэй';
    case 'SUSPENDED': return 'Түр түдгэлзүүлсэн';
    case 'REJECTED': return 'Татгалзсан';
    default: return s;
  }
}

function statusTone(s: string): ToneKey {
  switch (s) {
    case 'ACTIVE': return 'success';
    case 'PENDING': return 'warning';
    case 'SUSPENDED':
    case 'REJECTED': return 'danger';
    default: return 'muted';
  }
}

function mnKycStatus(s: string): string {
  switch (s) {
    case 'NOT_STARTED': return 'Эхлээгүй';
    case 'PENDING': return 'Хүлээгдэж байна';
    case 'APPROVED': return 'Зөвшөөрсөн';
    case 'REJECTED': return 'Татгалзсан';
    case 'NEEDS_REVIEW': return 'Шалгалтанд';
    default: return s;
  }
}

function kycTone(s: string): ToneKey {
  switch (s) {
    case 'APPROVED': return 'success';
    case 'PENDING':
    case 'NEEDS_REVIEW': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'muted';
  }
}

function mnLeadStatus(s: string): string {
  switch (s) {
    case 'NEW': return 'Шинэ';
    case 'QUALIFIED': return 'Шаардлага хангасан';
    case 'CONTACTED': return 'Холбогдсон';
    case 'CONVERTED_TO_REQUEST': return 'Хүсэлт болсон';
    case 'REJECTED': return 'Татгалзсан';
    case 'EXPIRED': return 'Хугацаа дууссан';
    case 'DUPLICATE': return 'Давхардсан';
    case 'SPAM': return 'Spam';
    default: return s;
  }
}
