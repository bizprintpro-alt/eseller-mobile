import React, { useState } from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity, Image,
  Dimensions, Alert,
} from 'react-native'
import { router, useLocalSearchParams }
  from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get }       from '../../src/services/api'
import { useCart }   from '../../src/store/cart'
import { useAuth }   from '../../src/store/auth'
import { C, R, F, S } from '../../src/shared/design'
import { Skeleton }  from '../../src/shared/ui/Skeleton'

const { width } = Dimensions.get('window')

export default function ProductDetailScreen() {
  const { id }              = useLocalSearchParams()
  const { add, items }      = useCart()
  const { user }            = useAuth()
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty]       = useState(1)
  const [saved, setSaved]   = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn:  () => get(`/products/${id}`),
    enabled:  !!id,
  })

  const p      = product as any
  const images = p?.images || p?.media || []

  const handleAddToCart = () => {
    if (!p) return

    // Stock-ыг backend-ээс `stock` эсвэл `quantity` талбараар өгнө.
    // 0 бол outOfStock — undefined/null бол хязгааргүй (legacy data).
    const stock: number | undefined =
      typeof p.stock === 'number' ? p.stock
      : typeof p.quantity === 'number' ? p.quantity
      : undefined

    if (stock === 0) {
      Alert.alert('Барагдсан', 'Энэ бараа одоогоор дууссан байна')
      return
    }

    if (stock !== undefined) {
      const existingQty = items.find((i) => i.id === p.id)?.qty || 0
      if (existingQty + qty > stock) {
        const remaining = Math.max(stock - existingQty, 0)
        Alert.alert(
          'Үлдэгдэл хүрэхгүй',
          remaining > 0
            ? `Та сагсанд ${existingQty} ширхэг оруулсан. Үлдэгдэл: ${remaining} ширхэг`
            : `Сагсанд хамгийн их тоо хэдийн нэмэгдсэн байна (${stock} ширхэг)`,
        )
        return
      }
    }

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    )
    add({
      id:         p.id,
      name:       p.name,
      price:      p.price,
      image:      images[0]?.url || null,
      entityId:   p.entityId || '',
      entityName: p.entity?.name || '',
    }, qty)
    Alert.alert('Сагсанд нэмлээ',
      `${p.name} x ${qty}`,
      [
        { text:'Үргэлжлүүлэх' },
        { text:'Сагс харах',
          onPress: () => router.push('/cart' as any) },
      ]
    )
  }

  if (isLoading) return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Skeleton width="100%" height={340} borderRadius={0} />
      <View style={{ padding: 16, gap: 12 }}>
        <Skeleton width="80%" height={24} />
        <Skeleton width="40%" height={28} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="70%"  height={14} />
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Image carousel */}
        <View style={{ height: 340, backgroundColor: C.bgCard }}>
          <ScrollView
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e =>
              setImgIdx(Math.round(
                e.nativeEvent.contentOffset.x / width
              ))
            }
          >
            {images.length > 0
              ? images.map((img: any, i: number) => (
                <Image key={i}
                  source={{ uri: img.url }}
                  style={{ width, height: 340 }}
                  resizeMode="cover"
                />
              ))
              : (
                <View style={{
                  width, height: 340,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: C.bgSection,
                }}>
                  <Ionicons name="image-outline" size={72} color={C.border} />
                </View>
              )
            }
          </ScrollView>

          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute', top: 48, left: 16,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: R.full, width: 40, height: 40,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setSaved(!saved)
            }}
            style={{
              position: 'absolute', top: 48, right: 16,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: R.full, width: 40, height: 40,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={20}
              color={saved ? C.brand : C.white}
            />
          </TouchableOpacity>

          {/* Image dots */}
          {images.length > 1 && (
            <View style={{
              position: 'absolute', bottom: 12, left: 0, right: 0,
              flexDirection: 'row', justifyContent: 'center', gap: 6,
            }}>
              {images.map((_: any, i: number) => (
                <View key={i} style={{
                  width: i === imgIdx ? 20 : 7, height: 7, borderRadius: 4,
                  backgroundColor: i === imgIdx ? C.white : 'rgba(255,255,255,0.4)',
                }} />
              ))}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: 16 }}>
          <Text style={{ ...F.h2, color: C.text, marginBottom: 10 }}>
            {p?.name}
          </Text>

          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 16,
          }}>
            <Text style={{ color: C.brand, fontSize: 28, fontWeight: '900' }}>
              {p?.price?.toLocaleString()}₮
            </Text>
            {p?.rating > 0 && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: C.bgSection, borderRadius: R.full,
                paddingHorizontal: 12, paddingVertical: 6,
              }}>
                <Ionicons name="star" size={14} color="#F9A825" />
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>
                  {p.rating.toFixed(1)}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 12 }}>
                  ({p.reviewCount || 0})
                </Text>
              </View>
            )}
          </View>

          {/* Quantity */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 16,
            marginBottom: 16, backgroundColor: C.bgSection,
            borderRadius: R.lg, padding: 12,
          }}>
            <Text style={{ color: C.textSub, fontWeight: '600', flex: 1 }}>
              Тоо ширхэг
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (qty > 1) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setQty(q => q - 1)
                }
              }}
              style={{
                backgroundColor: C.bgCard, borderRadius: R.md,
                width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: C.border,
              }}
            >
              <Ionicons name="remove" size={18} color={C.text} />
            </TouchableOpacity>
            <Text style={{
              color: C.text, fontSize: 18, fontWeight: '700',
              minWidth: 30, textAlign: 'center',
            }}>
              {qty}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const stock: number | undefined =
                  typeof p?.stock === 'number' ? p.stock
                  : typeof p?.quantity === 'number' ? p.quantity
                  : undefined
                if (stock !== undefined && qty >= stock) return
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setQty(q => q + 1)
              }}
              style={{
                backgroundColor: C.brand, borderRadius: R.md,
                width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={18} color={C.white} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          {p?.description && (
            <View style={{
              backgroundColor: C.bgCard, borderRadius: R.lg,
              padding: 16, marginBottom: 16,
              borderWidth: 1, borderColor: C.border,
            }}>
              <Text style={{ ...F.h4, color: C.text, marginBottom: 8 }}>
                Тайлбар
              </Text>
              <Text style={{ color: C.textSub, lineHeight: 22, fontSize: 14 }}>
                {p.description}
              </Text>
            </View>
          )}

          {/* Store */}
          {p?.entity && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/storefront/${p.entity.storefrontSlug}` as any)
              }
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: C.bgCard, borderRadius: R.lg,
                padding: 14, marginBottom: 16, gap: 12,
                borderWidth: 1, borderColor: C.border,
              }}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: C.primary,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: C.white, fontSize: 20, fontWeight: '700' }}>
                  {p.entity.name?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>
                  {p.entity.name}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                  Дэлгүүр харах
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.border} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom buttons */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', padding: 16, paddingBottom: 32,
        gap: 10, backgroundColor: 'rgba(18,18,18,0.95)',
        borderTopWidth: 1, borderTopColor: C.border,
      }}>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={{
            flex: 1, backgroundColor: C.bgSection, borderRadius: R.lg,
            padding: 16, alignItems: 'center', borderWidth: 1.5,
            borderColor: C.brand, flexDirection: 'row',
            justifyContent: 'center', gap: 6,
          }}
        >
          <Ionicons name="cart-outline" size={18} color={C.brand} />
          <Text style={{ color: C.brand, fontWeight: '700', fontSize: 15 }}>
            Сагслах
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!user) {
              router.push('/(auth)/login' as any)
              return
            }
            router.push({
              pathname: '/checkout' as any,
              params: { productId: id as string, qty: qty.toString() }
            })
          }}
          style={{
            flex: 2, backgroundColor: C.brand, borderRadius: R.lg,
            padding: 16, alignItems: 'center', flexDirection: 'row',
            justifyContent: 'center', gap: 6,
            ...S.elevated, shadowColor: C.brand,
          }}
        >
          <Ionicons name="flash" size={18} color={C.white} />
          <Text style={{ color: C.white, fontWeight: '800', fontSize: 16 }}>
            Захиалах
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
