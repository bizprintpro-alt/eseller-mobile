import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

export default function OwnerDashboard() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: () => get('/seller/analytics'),
  })

  const stats = (data as any)?.stats || (data as any) || {}

  const CARDS = [
    { icon: 'cash' as const, label: 'Орлого', color: C.brand, value: (stats.revenue || 0).toLocaleString() + '₮' },
    { icon: 'receipt' as const, label: 'Захиалга', color: '#1A73E8', value: stats.orders || 0 },
    { icon: 'cube' as const, label: 'Бараа', color: '#34A853', value: stats.products || 0 },
    { icon: 'eye' as const, label: 'Үзэлт', color: '#7C3AED', value: stats.views || 0 },
  ]

  const ACTIONS = [
    { icon: 'add-circle' as const, label: 'Бараа нэмэх', color: C.brand, route: '/(owner)/products' },
    { icon: 'receipt' as const, label: 'Захиалгууд', color: '#1A73E8', route: '/(owner)/orders' },
    { icon: 'bar-chart' as const, label: 'Тайлан', color: '#7C3AED', route: '/(owner)/analytics' },
    { icon: 'settings' as const, label: 'Тохиргоо', color: '#34A853', route: '/(owner)/settings' },
  ]

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
    >
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Самбар</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 2 }}>Дэлгүүрийн хяналтын самбар</Text>
      </View>

      {/* Stats cards */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10 }}>
        {CARDS.map((c, i) => (
          <View
            key={i}
            style={{
              width: '47%',
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: c.color,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Ionicons name={c.icon} size={24} color={c.color} />
            <Text style={{ color: c.color, fontSize: 22, fontWeight: '900', marginTop: 8 }}>{c.value}</Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick actions */}
      <View style={{ margin: 12 }}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Хурдан үйлдэл</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ACTIONS.map((a, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(a.route as any)}
              style={{
                width: '47%',
                backgroundColor: a.color + '15',
                borderRadius: R.lg,
                padding: 16,
                alignItems: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: a.color + '30',
              }}
            >
              <Ionicons name={a.icon} size={26} color={a.color} />
              <Text style={{ color: C.text, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent orders */}
      <View style={{ margin: 12, marginTop: 4 }}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Сүүлийн захиалгууд</Text>
        {((data as any)?.recentOrders || []).length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32, backgroundColor: C.bgCard, borderRadius: R.lg, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 36 }}>📋</Text>
            <Text style={{ color: C.textSub, marginTop: 8 }}>Захиалга байхгүй байна</Text>
          </View>
        ) : (
          ((data as any)?.recentOrders || []).map((o: any, i: number) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(`/orders` as any)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: C.bgCard,
                borderRadius: R.lg,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <View>
                <Text style={{ color: C.text, fontWeight: '600' }}>#{o.trackingCode}</Text>
                <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>{o.user?.name}</Text>
              </View>
              <Text style={{ color: C.brand, fontWeight: '800', fontSize: 16 }}>{o.totalAmount?.toLocaleString()}₮</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}
