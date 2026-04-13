import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get, put } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

const STATUSES = [
  { key: '', label: 'Бүгд' },
  { key: 'PENDING', label: 'Хүлээгдэж' },
  { key: 'CONFIRMED', label: 'Баталгаажсан' },
  { key: 'PREPARING', label: 'Бэлтгэж' },
  { key: 'SHIPPED', label: 'Хүргэлтэнд' },
  { key: 'DELIVERED', label: 'Хүргэгдсэн' },
]

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F9A825',
  CONFIRMED: '#1A73E8',
  PREPARING: '#7C3AED',
  SHIPPED: '#0891B2',
  DELIVERED: '#34A853',
  CANCELLED: C.brand,
}

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'SHIPPED',
}

const NEXT_LABEL: Record<string, string> = {
  CONFIRMED: 'Батлах',
  PREPARING: 'Бэлтгэх',
  SHIPPED: 'Илгээх',
}

export default function OwnerOrders() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('')

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['owner-orders', filter],
    queryFn: () => get(`/seller/orders${filter ? `?status=${filter}` : ''}`),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      put(`/seller/orders/${id}/status`, { status }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      qc.invalidateQueries({ queryKey: ['owner-orders'] })
    },
  })

  const orders = (data as any)?.orders || (Array.isArray(data) ? data : [])

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>Захиалгууд</Text>
      </View>

      {/* Status filter */}
      <FlatList
        horizontal
        data={STATUSES}
        keyExtractor={s => s.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8, marginBottom: 12 }}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            onPress={() => setFilter(s.key)}
            style={{
              paddingHorizontal: 16, paddingVertical: 8, borderRadius: R.full,
              backgroundColor: filter === s.key ? C.brand : C.bgSection,
              borderWidth: 1, borderColor: filter === s.key ? C.brand : C.border,
            }}
          >
            <Text style={{ color: filter === s.key ? '#fff' : C.textSub, fontSize: 13, fontWeight: '600' }}>{s.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Orders list */}
      <FlatList
        data={orders}
        keyExtractor={(o: any) => o.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
        renderItem={({ item: o }) => {
          const sc = STATUS_COLOR[o.status] || C.textSub
          const ns = NEXT_STATUS[o.status]
          return (
            <View style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>#{o.trackingCode}</Text>
                <View style={{ backgroundColor: sc + '20', borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: sc, fontSize: 12, fontWeight: '600' }}>{o.status}</Text>
                </View>
              </View>
              <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 4 }}>👤 {o.user?.name || 'Хэрэглэгч'}</Text>
              <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 12 }}>📍 {o.deliveryAddress || '—'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: C.brand, fontWeight: '900', fontSize: 18 }}>{o.totalAmount?.toLocaleString()}₮</Text>
                {ns && (
                  <TouchableOpacity
                    onPress={() => updateMutation.mutate({ id: o.id, status: ns })}
                    style={{ backgroundColor: C.brand, borderRadius: R.md, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{NEXT_LABEL[ns]}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={{ color: C.textSub, marginTop: 12, fontSize: 16 }}>Захиалга байхгүй байна</Text>
          </View>
        }
      />
    </View>
  )
}
