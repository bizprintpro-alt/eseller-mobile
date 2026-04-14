import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../services/api'
import { useTheme } from '../../shared/useTheme'
import { Skeleton } from '../../shared/ui/Skeleton'
import { useHaptic } from '../../shared/hooks/useHaptic'

export default function AffiliateHomeScreen() {
  const { colors, accent } = useTheme()
  const haptic = useHaptic()

  const { data, isLoading, refetch, isRefetching } = useQuery<any>({
    queryKey: ['affiliate-stats'],
    queryFn: () => get('/affiliate/earnings'),
  })

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={accent} />}
    >
      <View style={{ padding: 16, paddingTop: 52 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
          📢 Борлуулагчийн самбар
        </Text>

        {isLoading ? (
          <View style={{ gap: 10 }}>
            <Skeleton width="100%" height={140} borderRadius={16} />
            <Skeleton width="100%" height={70} borderRadius={12} />
            <Skeleton width="100%" height={180} borderRadius={12} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{ backgroundColor: accent, borderRadius: 16, padding: 20 }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Нийт комисс</Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
                {(data?.totalEarnings ?? 0).toLocaleString()}₮
              </Text>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 12 }}>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Хүлээгдэж буй</Text>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                    {(data?.pendingEarnings ?? 0).toLocaleString()}₮
                  </Text>
                </View>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Борлуулалт</Text>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                    {data?.totalConversions ?? 0}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => { haptic.light(); router.push('/(tabs)/feed' as any) }}
              style={{
                backgroundColor: colors.bgCard, borderRadius: 12, padding: 16,
                borderWidth: 0.5, borderColor: colors.border,
                flexDirection: 'row', alignItems: 'center', gap: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>🔗</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Линк үүсгэх</Text>
                <Text style={{ fontSize: 12, color: colors.textSub }}>Бараа сонгоод share хийх</Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>

            <View style={{
              backgroundColor: colors.bgCard, borderRadius: 12, padding: 16,
              borderWidth: 0.5, borderColor: colors.border,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
                Гүйцэтгэл
              </Text>
              {[
                { label: 'Нийт товшилт', value: data?.totalClicks ?? 0, unit: '' },
                { label: 'Конверси',      value: data?.conversionRate ?? '0', unit: '%' },
                { label: 'Төлөгдсөн',     value: (data?.paidEarnings ?? 0).toLocaleString(), unit: '₮' },
              ].map(item => (
                <View key={item.label} style={{
                  flexDirection: 'row', justifyContent: 'space-between',
                  paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border,
                }}>
                  <Text style={{ fontSize: 13, color: colors.textSub }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                    {item.value}{item.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
