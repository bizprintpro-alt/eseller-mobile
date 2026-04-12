import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get } from '../src/services/api'
import { C, R } from '../src/shared/design'

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Хүлээгдэж байна', color: '#F9A825' },
  paid:      { label: 'Төлөгдсөн', color: '#1A73E8' },
  confirmed: { label: 'Баталгаажсан', color: '#7C3AED' },
  preparing: { label: 'Бэлтгэж буй', color: '#0891B2' },
  delivering:{ label: 'Хүргэлтэнд', color: '#2563EB' },
  delivered: { label: 'Хүргэгдсэн', color: '#34A853' },
  completed: { label: 'Дууссан', color: '#34A853' },
  cancelled: { label: 'Цуцлагдсан', color: '#EA4335' },
}

export default function OrdersScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => get('/buyer/orders?limit=30'),
  })

  const orders = (data as any)?.orders || (Array.isArray(data) ? data : [])

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>Захиалгууд</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.brand} style={{ marginTop: 60 }} size="large" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id || o._id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
          renderItem={({ item: o }) => {
            const st = STATUS[o.status] || { label: o.status, color: C.textSub }
            return (
              <TouchableOpacity onPress={() => router.push(`/track/${o.trackingCode || o.orderNumber || o.id}` as any)}
                style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: C.text, fontWeight: '700' }}>#{o.orderNumber || o.trackingCode || o.id?.slice(-6)}</Text>
                  <View style={{ backgroundColor: st.color + '20', borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: st.color, fontSize: 11, fontWeight: '600' }}>{st.label}</Text>
                  </View>
                </View>
                <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 8 }}>{o.items?.length || 0} бараа</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: C.textMuted, fontSize: 12 }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('mn-MN') : ''}</Text>
                  <Text style={{ color: C.brand, fontWeight: '800', fontSize: 16 }}>{(o.total || o.totalAmount || 0).toLocaleString()}₮</Text>
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Text style={{ fontSize: 48 }}>📦</Text>
              <Text style={{ color: C.textSub, marginTop: 12, fontSize: 16 }}>Захиалга байхгүй байна</Text>
            </View>
          }
        />
      )}
    </View>
  )
}
