import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get } from '../../src/services/api'
import { C, R, F } from '../../src/shared/design'

export default function SellerDashboard() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: () => get('/affiliate/earnings'),
  })

  // Stock alert
  const { data: productsData } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => get('/products/my?status=active'),
  })
  const lowStock = ((productsData as any)?.products || []).filter((p: any) => (p.stock ?? p.inventory ?? 999) < 5)

  const stats = (data as any)?.stats || (data as any) || {}

  const CARDS = [
    { icon: 'cash' as const, label: 'Нийт орлого', value: (stats.totalEarned || 0).toLocaleString() + '₮', color: '#E8242C' },
    { icon: 'trending-up' as const, label: 'Энэ сар', value: (stats.thisMonth || 0).toLocaleString() + '₮', color: '#1A73E8' },
    { icon: 'time' as const, label: 'Хүлээгдэж буй', value: (stats.pending || 0).toLocaleString() + '₮', color: '#F9A825' },
    { icon: 'cart' as const, label: 'Борлуулалт', value: String(stats.totalSales || stats.totalOrders || 0), color: '#34A853' },
  ]

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Самбар</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>Борлуулагчийн хяналтын самбар</Text>
      </View>

      {/* Stock alert */}
      {lowStock.length > 0 && (
        <TouchableOpacity onPress={() => router.push('/(seller)/products' as any)}
          style={{ marginHorizontal: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EA433515', borderRadius: R.lg, padding: 14, borderWidth: 0.5, borderColor: '#EA433533' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="warning" size={20} color="#EA4335" />
            <Text style={{ color: '#EA4335', fontSize: 13, fontWeight: '700' }}>⚠️ {lowStock.length} бараа дуусах дөхөж байна</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EA4335" />
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10 }}>
        {CARDS.map((c, i) => (
          <View key={i} style={{ width: '47%', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, borderLeftWidth: 3, borderLeftColor: c.color, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name={c.icon} size={24} color={c.color} />
            <Text style={{ color: c.color, fontSize: 20, fontWeight: '900', marginTop: 8 }}>{c.value}</Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ margin: 12 }}>
        <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>Хурдан үйлдэл</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { icon: 'link' as const, label: 'Линк үүсгэх', route: '/(seller)/products' },
            { icon: 'stats-chart' as const, label: 'Орлого харах', route: '/(seller)/earnings' },
          ].map((a, i) => (
            <TouchableOpacity key={i} onPress={() => router.push(a.route as any)}
              style={{ flex: 1, backgroundColor: C.bgSection, borderRadius: R.lg, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border }}>
              <Ionicons name={a.icon} size={24} color={C.seller} />
              <Text style={{ color: C.text, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ margin: 12, marginTop: 4 }}>
        <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>Сүүлийн орлогууд</Text>
        {((data as any)?.recent || (data as any)?.commissions || []).slice(0, 5).map((c: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border }}>
            <View>
              <Text style={{ color: C.text, fontWeight: '600' }}>{c.productName || 'Захиалга'}</Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('mn-MN') : ''}</Text>
            </View>
            <Text style={{ color: C.secondary, fontWeight: '800', fontSize: 16 }}>+{(c.amount || 0).toLocaleString()}₮</Text>
          </View>
        ))}
        {!((data as any)?.recent?.length || (data as any)?.commissions?.length) && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 40 }}>💸</Text>
            <Text style={{ color: C.textSub, marginTop: 8 }}>Одоогоор орлого байхгүй</Text>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}
