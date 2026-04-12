import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get, post } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

export default function DriverDeliveriesScreen() {
  const qc = useQueryClient()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['driver-orders'],
    queryFn: () => get('/buyer/orders?status=confirmed'),
    refetchInterval: 15000,
  })

  const acceptMutation = useMutation({
    mutationFn: (orderId: string) => post(`/orders/${orderId}/status`, { status: 'delivering' }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      qc.invalidateQueries({ queryKey: ['driver-orders'] })
    },
  })

  const orders = (data as any)?.orders || (Array.isArray(data) ? data : [])

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Хүргэлтүүд</Text>
          <Text style={{ color: C.textSub, fontSize: 13, marginTop: 2 }}>{orders.length} захиалга хүлээж байна</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.brand} style={{ marginTop: 60 }} size="large" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id || o._id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
          renderItem={({ item: o }) => (
            <View style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>#{o.orderNumber || o.trackingCode || o.id?.slice(-6)}</Text>
                <Text style={{ color: C.brand, fontWeight: '800', fontSize: 16 }}>{(o.total || o.totalAmount || 0).toLocaleString()}₮</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Ionicons name="location" size={14} color={C.textSub} />
                <Text style={{ color: C.textSub, fontSize: 13, flex: 1 }} numberOfLines={2}>{o.deliveryAddress || o.delivery?.address || 'Хаяг'}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Ionicons name="cube" size={14} color={C.textSub} />
                <Text style={{ color: C.textSub, fontSize: 13 }}>{o.items?.length || 0} бараа</Text>
              </View>
              <TouchableOpacity onPress={() => acceptMutation.mutate(o.id || o._id)} disabled={acceptMutation.isPending}
                style={{ backgroundColor: C.brand, borderRadius: R.md, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Хүлээн авах</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Text style={{ fontSize: 48 }}>🚗</Text>
              <Text style={{ color: C.textSub, marginTop: 12, fontSize: 16 }}>Хүргэх захиалга байхгүй байна</Text>
            </View>
          }
        />
      )}
    </View>
  )
}
