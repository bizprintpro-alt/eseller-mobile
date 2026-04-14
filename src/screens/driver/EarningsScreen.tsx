import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../services/api'
import { useTheme } from '../../shared/useTheme'
import { Skeleton } from '../../shared/ui/Skeleton'

export default function DriverEarningsScreen() {
  const { colors, accent } = useTheme()

  const { data, isLoading, refetch, isRefetching } = useQuery<any>({
    queryKey: ['driver-revenue'],
    queryFn: () => get('/driver/revenue'),
  })

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={accent} />}
    >
      <View style={{ padding: 16, paddingTop: 52 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
          💰 Орлого
        </Text>

        {isLoading ? (
          <View style={{ gap: 10 }}>
            <Skeleton width="100%" height={120} borderRadius={16} />
            <Skeleton width="100%" height={60} borderRadius={12} />
            <Skeleton width="100%" height={60} borderRadius={12} />
            <Skeleton width="100%" height={60} borderRadius={12} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{
              backgroundColor: accent, borderRadius: 16, padding: 20, alignItems: 'center',
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Нийт орлого</Text>
              <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 6 }}>
                {(data?.totalRevenue ?? 0).toLocaleString()}₮
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>
                {data?.totalDeliveries ?? 0} хүргэлт
              </Text>
            </View>

            {[
              { label: 'Өнөөдөр', value: data?.todayRevenue ?? 0 },
              { label: 'Энэ сар', value: data?.monthRevenue ?? 0 },
              { label: 'Нийт хүргэлт', value: data?.totalDeliveries ?? 0, unit: ' удаа' },
            ].map(row => (
              <View key={row.label} style={{
                backgroundColor: colors.bgCard, borderRadius: 12, padding: 16,
                borderWidth: 0.5, borderColor: colors.border,
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <Text style={{ color: colors.textSub, fontSize: 14 }}>{row.label}</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                  {row.value.toLocaleString()}{row.unit ?? '₮'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
