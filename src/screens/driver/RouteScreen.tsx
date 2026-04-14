import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../services/api'
import { useTheme } from '../../shared/useTheme'

export default function RouteScreen() {
  const { colors, accent } = useTheme()

  const { data, refetch, isRefetching } = useQuery<any>({
    queryKey: ['driver-route'],
    queryFn: () => get('/driver/orders?type=mine'),
    refetchInterval: 15000,
  })

  const orders: any[] = data?.data?.orders || data?.orders || []

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={accent} />}
    >
      <View style={{ padding: 16, paddingTop: 52 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
          Маршрут
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>
          Идэвхтэй хүргэлтүүдийн дараалал
        </Text>

        {orders.length === 0 ? (
          <View style={{
            backgroundColor: colors.bgCard, borderRadius: 12, padding: 24,
            alignItems: 'center', borderWidth: 0.5, borderColor: colors.border, gap: 12,
          }}>
            <Text style={{ fontSize: 40 }}>🗺️</Text>
            <Text style={{ fontSize: 14, color: colors.textSub, textAlign: 'center' }}>
              Идэвхтэй хүргэлт байхгүй
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
              Захиалга авсны дараа маршрут эндээс харагдана
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {orders.map((o: any, idx: number) => (
              <View key={o.id} style={{
                backgroundColor: colors.bgCard, borderRadius: 12, padding: 14,
                borderWidth: 0.5, borderColor: colors.border,
                borderLeftWidth: 4, borderLeftColor: accent,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14, backgroundColor: accent,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{idx + 1}</Text>
                  </View>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
                    #{o.id.toString().slice(-6).toUpperCase()}
                  </Text>
                  <Text style={{ marginLeft: 'auto', color: accent, fontWeight: '700' }}>
                    {(o.total || 0).toLocaleString()}₮
                  </Text>
                </View>
                {o.shop && <Text style={{ color: colors.textSub, fontSize: 12, marginBottom: 2 }}>🏪 {o.shop.name}</Text>}
                {o.deliveryAddress && (
                  <Text style={{ color: colors.textSub, fontSize: 12 }} numberOfLines={2}>
                    📍 {o.deliveryAddress}
                  </Text>
                )}
                {o.buyer?.phone && <Text style={{ color: colors.textSub, fontSize: 12 }}>📞 {o.buyer.phone}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
