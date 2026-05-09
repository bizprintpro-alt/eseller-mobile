import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../src/services/api'
import { C, R, F } from '../../src/shared/design'
import { useSellerCommissionSummary } from '../../src/hooks/useSellerDashboard'
import { describeSellerError } from '../../src/api/sellerDashboard'

export default function SellerEarningsScreen() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['seller-earnings'],
    queryFn: () => get('/affiliate/commissions'),
  })

  const commissions = (data as any)?.commissions || (Array.isArray(data) ? data : [])
  const stats = (data as any)?.stats || {}

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Орлого</Text>
      </View>

      {/* Balance card */}
      <View style={{ margin: 12, borderRadius: R.xl, padding: 24, backgroundColor: C.seller + '12', borderWidth: 1, borderColor: C.seller + '30' }}>
        <Text style={{ color: C.seller, fontSize: 13, fontWeight: '600' }}>НИЙТ ОРЛОГО</Text>
        <Text style={{ color: C.seller, fontSize: 36, fontWeight: '900', marginTop: 8 }}>{(stats.totalEarned || 0).toLocaleString()}₮</Text>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 16 }}>
          <View>
            <Text style={{ color: C.seller + '80', fontSize: 12 }}>Энэ сар</Text>
            <Text style={{ color: C.seller, fontWeight: '700' }}>{(stats.thisMonth || 0).toLocaleString()}₮</Text>
          </View>
          <View>
            <Text style={{ color: C.seller + '80', fontSize: 12 }}>Хүлээгдэж буй</Text>
            <Text style={{ color: C.seller, fontWeight: '700' }}>{(stats.pending || 0).toLocaleString()}₮</Text>
          </View>
        </View>
      </View>

      {/* Seller-network commission (PR103) — read-only, dry-run only.
          Sourced from Sarana BFF /api/seller/commission-summary, which
          proxies Negd's S2S adapter. NOT payable. NO withdraw. */}
      <SellerNetworkCommissionSection />

      {/* Commission list */}
      <View style={{ margin: 12 }}>
        <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>Гүйлгээний түүх</Text>
        {commissions.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 48 }}>💸</Text>
            <Text style={{ color: C.textSub, marginTop: 12 }}>Гүйлгээ байхгүй байна</Text>
          </View>
        ) : commissions.map((c: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '600' }}>{c.productName || 'Захиалга'}</Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('mn-MN') : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ color: C.secondary, fontWeight: '800', fontSize: 16 }}>+{(c.amount || 0).toLocaleString()}₮</Text>
              <View style={{ backgroundColor: (c.status === 'paid' ? C.secondary : C.warning) + '20', borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: c.status === 'paid' ? C.secondary : C.warning, fontSize: 11, fontWeight: '600' }}>
                  {c.status === 'paid' ? 'Төлөгдсөн' : 'Хүлээгдэж буй'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

// ─── Seller-network commission summary (PR103) ─────────────────────────
// Read-only. Dry-run amounts only. NOT payable. NO withdraw button.

function SellerNetworkCommissionSection() {
  const q = useSellerCommissionSummary()
  const fmt = (n: number) => n.toLocaleString() + '₮'

  return (
    <View style={{ margin: 12, marginBottom: 4 }}>
      <Text style={{ ...F.h4, color: C.text, marginBottom: 8 }}>Худалдагчийн сүлжээ — шимтгэл (dry-run)</Text>
      <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 10 }}>
        Серверээс тооцоологдсон. Бүх мөр dry-run, төлөгдөх биш.
      </Text>
      <View style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border }}>
        {q.isLoading ? (
          <View style={{ alignItems: 'center', padding: 12 }}>
            <ActivityIndicator color={C.seller} />
            <Text style={{ color: C.textSub, marginTop: 6, fontSize: 12 }}>Ачааллаж байна…</Text>
          </View>
        ) : q.isError ? (
          <Text style={{ color: C.error, fontSize: 12 }}>
            {describeSellerError(q.error).message}
          </Text>
        ) : q.data ? (
          <>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <KvBox label="Тооцоолсон" count={q.data.totals.dryRun} amount={fmt(q.data.proposedAmountsMnt.dryRun)} />
              <KvBox label="Шалгаж буй" count={q.data.totals.needsReview} amount={fmt(q.data.proposedAmountsMnt.inReview)} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <KvBox label="Зөвшөөрөгдсөн" count={q.data.totals.approvedForFuturePosting} amount={fmt(q.data.proposedAmountsMnt.approvedNotPayable)} />
              <KvBox label="Хасагдсан" count={q.data.totals.excluded} amount={'—'} />
            </View>
            <View
              style={{
                marginTop: 10,
                padding: 10,
                backgroundColor: C.bgSection,
                borderRadius: R.md,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: C.border,
              }}
            >
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '700' }}>
                Олгогдох (төлөх): {fmt(q.data.payableAmountMnt)}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 4 }}>
                Одоогоор боломжгүй. effective=false invariant.
              </Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  )
}

function KvBox({ label, count, amount }: { label: string; count: number; amount: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bgSection, borderRadius: R.md, padding: 10, borderWidth: 1, borderColor: C.border }}>
      <Text style={{ color: C.textMuted, fontSize: 10 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 16, fontWeight: '800', marginTop: 2 }}>{count}</Text>
      <Text style={{ color: C.textSub, fontSize: 11, marginTop: 2 }}>{amount}</Text>
    </View>
  )
}
