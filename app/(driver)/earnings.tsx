import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../src/services/api'
import { C, R, F } from '../../src/shared/design'

export default function DriverEarningsScreen() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['driver-earnings'],
    queryFn: () => get('/driver/revenue'),
  })

  const stats = (data as any)?.stats || (data as any) || {}
  const history = (data as any)?.history || (data as any)?.orders || []

  const CARDS = [
    { label: 'Нийт орлого', value: (stats.totalEarned || stats.total || 0).toLocaleString() + '₮', color: '#E8242C' },
    { label: 'Энэ сар', value: (stats.thisMonth || stats.month || 0).toLocaleString() + '₮', color: '#1A73E8' },
    { label: 'Энэ долоо хоног', value: (stats.thisWeek || stats.week || 0).toLocaleString() + '₮', color: '#34A853' },
    { label: 'Нийт хүргэлт', value: String(stats.totalDeliveries || stats.deliveryCount || 0), color: '#F9A825' },
  ]

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Орлого</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10 }}>
        {CARDS.map((c, i) => (
          <View key={i} style={{ width: '47%', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, borderLeftWidth: 3, borderLeftColor: c.color, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: c.color, fontSize: 20, fontWeight: '900' }}>{c.value}</Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ margin: 12 }}>
        <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>Гүйлгээний түүх</Text>
        {history.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 48 }}>💸</Text>
            <Text style={{ color: C.textSub, marginTop: 12 }}>Гүйлгээ байхгүй байна</Text>
          </View>
        ) : history.map((h: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border }}>
            <View>
              <Text style={{ color: C.text, fontWeight: '600' }}>#{h.orderNumber || h.trackingCode || 'Хүргэлт'}</Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{h.createdAt ? new Date(h.createdAt).toLocaleDateString('mn-MN') : ''}</Text>
            </View>
            <Text style={{ color: C.secondary, fontWeight: '800', fontSize: 16 }}>+{(h.deliveryFee || h.amount || 0).toLocaleString()}₮</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
