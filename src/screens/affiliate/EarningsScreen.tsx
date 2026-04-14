import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../services/api'
import { useTheme } from '../../shared/useTheme'
import { Skeleton } from '../../shared/ui/Skeleton'

export default function AffiliateEarningsScreen() {
  const { colors, accent } = useTheme()

  const { data, isLoading, refetch, isRefetching } = useQuery<any>({
    queryKey: ['affiliate-earnings'],
    queryFn: () => get('/affiliate/earnings'),
  })

  const history: any[] = data?.recentConversions ?? []

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={accent} />}
    >
      <View style={{ padding: 16, paddingTop: 52 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
          💰 Таталт & Комисс
        </Text>

        {isLoading ? (
          <View style={{ gap: 10 }}>
            <Skeleton width="100%" height={140} borderRadius={16} />
            <Skeleton width="100%" height={60} borderRadius={12} />
            <Skeleton width="100%" height={60} borderRadius={12} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{ backgroundColor: accent, borderRadius: 16, padding: 20, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Нийт комисс</Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
                {(data?.totalEarnings ?? 0).toLocaleString()}₮
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 }}>
                Хүлээгдэж буй: {(data?.pendingEarnings ?? 0).toLocaleString()}₮
              </Text>
            </View>

            {history.length === 0 ? (
              <View style={{
                backgroundColor: colors.bgCard, borderRadius: 12, padding: 24,
                borderWidth: 0.5, borderColor: colors.border, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
                <Text style={{ color: colors.textSub, fontSize: 13 }}>Түүх хараахан байхгүй</Text>
              </View>
            ) : (
              history.map((item: any) => (
                <View key={item.id} style={{
                  backgroundColor: colors.bgCard, borderRadius: 12, padding: 14,
                  borderWidth: 0.5, borderColor: colors.border,
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                      {item.status === 'paid' ? '✅ Төлөгдсөн' : '⏳ Хүлээгдэж буй'}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSub }}>
                      {new Date(item.createdAt).toLocaleDateString('mn-MN')}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: accent }}>
                    +{(item.commission ?? 0).toLocaleString()}₮
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
