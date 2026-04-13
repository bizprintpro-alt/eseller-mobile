import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { get } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

const PERIODS = [
  { key: 'day', label: 'Өнөөдөр' },
  { key: 'week', label: '7 хоног' },
  { key: 'month', label: 'Сар' },
]

export default function OwnerAnalytics() {
  const [period, setPeriod] = useState('week')

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['owner-analytics', period],
    queryFn: () => get(`/seller/analytics?period=${period}`),
  })

  const stats = (data as any)?.stats || (data as any) || {}
  const tops = (data as any)?.topProducts || []

  const CARDS = [
    { label: 'Орлого', color: '#E8242C', value: (stats.revenue || 0).toLocaleString() + '₮' },
    { label: 'Захиалга', color: '#1A73E8', value: stats.orders || 0 },
    { label: 'Дундаж үнэ', color: '#7C3AED', value: (stats.avgOrder || 0).toLocaleString() + '₮' },
    { label: 'Буцаалт', color: '#F9A825', value: stats.returns || 0 },
  ]

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
    >
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>Тайлан</Text>
      </View>

      {/* Period picker */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 16 }}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            onPress={() => setPeriod(p.key)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: R.lg, alignItems: 'center',
              backgroundColor: period === p.key ? C.brand : C.bgSection,
              borderWidth: 1, borderColor: period === p.key ? C.brand : C.border,
            }}
          >
            <Text style={{ color: period === p.key ? '#fff' : C.textSub, fontSize: 13, fontWeight: '600' }}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10, marginBottom: 8 }}>
        {CARDS.map((c, i) => (
          <View key={i} style={{ width: '47%', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, borderLeftWidth: 3, borderLeftColor: c.color, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: c.color, fontSize: 22, fontWeight: '900' }}>{c.value}</Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Top products */}
      <View style={{ margin: 12 }}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Шилдэг бараанууд</Text>
        {tops.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32, backgroundColor: C.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: C.textSub }}>Өгөгдөл байхгүй</Text>
          </View>
        ) : (
          tops.map((p: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: C.textSub, fontWeight: '700', fontSize: 16, minWidth: 24 }}>#{i + 1}</Text>
                <View>
                  <Text style={{ color: C.text, fontWeight: '600' }} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>{p.sold} борлуулсан</Text>
                </View>
              </View>
              <Text style={{ color: C.brand, fontWeight: '800' }}>{(p.revenue || 0).toLocaleString()}₮</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}
