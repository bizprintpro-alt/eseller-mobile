import { View, Text, FlatList, TouchableOpacity, Image, Alert, Share } from 'react-native'
import { useQuery, useMutation } from '@tanstack/react-query'
import { get, post } from '../../services/api'
import { useTheme } from '../../shared/useTheme'
import { ProductCardSkeleton } from '../../shared/ui/Skeleton'
import { useHaptic } from '../../shared/hooks/useHaptic'

export default function AffiliateProductsScreen() {
  const { colors, accent } = useTheme()
  const haptic = useHaptic()

  const { data, isLoading } = useQuery<any>({
    queryKey: ['affiliate-products'],
    queryFn: () => get('/products?limit=40'),
  })

  const createLink = useMutation({
    mutationFn: (productId: string) => post('/affiliate/links', { productId }),
    onSuccess: async (res: any) => {
      haptic.success()
      const url = `https://eseller.mn/r/${res?.code ?? ''}`
      await Share.share({ message: `eSeller.mn\n${url}`, title: 'eSeller.mn' })
    },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  })

  const products: any[] = data?.products ?? data?.items ?? data ?? []

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{
        padding: 16, paddingTop: 52, backgroundColor: colors.bgCard,
        borderBottomWidth: 0.5, borderBottomColor: colors.border,
      }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>📦 Бараа сонгох</Text>
        <Text style={{ fontSize: 12, color: colors.textSub, marginTop: 2 }}>
          Линк үүсгэж share хийхэд зориулсан
        </Text>
      </View>

      <FlatList
        data={isLoading ? ([1, 2, 3, 4, 5, 6] as any[]) : products}
        keyExtractor={(item: any, i) => (item?.id ?? String(i))}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }: any) => {
          if (isLoading) {
            return (
              <View style={{ flex: 1, margin: 4 }}>
                <ProductCardSkeleton />
              </View>
            )
          }
          return (
            <View style={{
              flex: 1, margin: 4, backgroundColor: colors.bgCard, borderRadius: 12,
              borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden',
            }}>
              <View style={{
                height: 120, backgroundColor: colors.bgSection,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 32 }}>📦</Text>
                )}
              </View>
              <View style={{ padding: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 3 }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: accent }}>
                  {(item.price ?? 0).toLocaleString()}₮
                </Text>
                <TouchableOpacity
                  onPress={() => { haptic.medium(); createLink.mutate(item.id) }}
                  disabled={createLink.isPending}
                  style={{
                    backgroundColor: accent, borderRadius: 6, padding: 7,
                    alignItems: 'center', marginTop: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>🔗 Линк авах</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}
