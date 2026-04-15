import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../src/services/api'
import { C, R, F } from '../../src/shared/design'

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
