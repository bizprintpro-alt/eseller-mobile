import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Share } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

export default function SellerProductsScreen() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => get('/affiliate/links'),
  })

  const products = (data as any)?.links || (data as any)?.products || (Array.isArray(data) ? data : [])

  const shareProduct = async (p: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await Share.share({
      message: `${p.name || p.productName} — ${(p.price || 0).toLocaleString()}₮\nhttps://eseller.mn/product/${p.productId || p.id}?ref=me`,
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Бараанууд</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>Share хийж комисс авах</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(p: any) => p.id || p._id || p.productId}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
        renderItem={({ item: p }) => (
          <TouchableOpacity onPress={() => router.push(`/product/${p.productId || p.id}` as any)}
            style={{ flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 12, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: C.border }}>
            {p.image || p.images?.[0] ? (
              <Image source={{ uri: p.image || p.images?.[0] }} style={{ width: 72, height: 72, borderRadius: R.md, backgroundColor: C.bgSection }} resizeMode="cover" />
            ) : (
              <View style={{ width: 72, height: 72, borderRadius: R.md, backgroundColor: C.bgSection, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cube-outline" size={28} color={C.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>{p.name || p.productName}</Text>
              <Text style={{ color: C.brand, fontWeight: '800', fontSize: 15, marginTop: 4 }}>{(p.price || 0).toLocaleString()}₮</Text>
              <View style={{ backgroundColor: C.secondary + '20', borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 }}>
                <Text style={{ color: C.secondary, fontSize: 12, fontWeight: '700' }}>Комисс {p.commission || p.affiliateCommission || 10}%</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => shareProduct(p)}
              style={{ backgroundColor: C.brand, borderRadius: R.md, padding: 10, alignSelf: 'center' }}>
              <Ionicons name="share-social" size={18} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={{ color: C.textSub, marginTop: 12 }}>Бараа байхгүй байна</Text>
          </View>
        }
      />
    </View>
  )
}
