import React, { useState } from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity, Image,
  Dimensions, Alert,
} from 'react-native'
import { router, useLocalSearchParams }
  from 'expo-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get, post } from '../../src/services/api'
import { useCart }   from '../../src/store/cart'
import { useAuth }   from '../../src/store/auth'
import { C, R, F, S } from '../../src/shared/design'
import { Skeleton }  from '../../src/shared/ui/Skeleton'

const { width } = Dimensions.get('window')

interface ReviewItem {
  id:           string
  rating:       number
  title?:       string | null
  comment?:     string | null
  buyerName?:   string | null
  isVerified?:  boolean
  sellerReply?: string | null
  createdAt:    string
}

interface ReviewsResponse {
  reviews: ReviewItem[]
  total:   number
  breakdown: { rating: number; count: number }[]
  hasMore: boolean
}

interface RelatedProduct {
  id:          string
  name:        string
  price:       number
  salePrice?:  number | null
  images?:     string[] | null
  emoji?:      string | null
  rating?:     number | null
  reviewCount?: number | null
}

interface RelatedResponse {
  products: RelatedProduct[]
}

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

  const { data: reviewsData } = useQuery<ReviewsResponse>({
    queryKey: ['product-reviews', id],
    // axios response interceptor unwraps res.data at runtime, so the
    // runtime shape is the review payload even though the static type
    // of `get()` still says AxiosResponse. Double cast to bridge.
    queryFn:  () => get(`/products/${id}/reviews?limit=5`) as unknown as Promise<ReviewsResponse>,
    enabled:  !!id,
  })

  const { data: relatedData } = useQuery<RelatedResponse>({
    queryKey: ['product-related', id],
    queryFn:  () => get(`/products/${id}/related?limit=6`) as unknown as Promise<RelatedResponse>,
    enabled:  !!id,
  })

  const p      = product as any
  const images = p?.images || p?.media || []

  // Start-or-resume conversation with the shop. Backend find-or-creates
  // so a buyer tapping the button twice still lands on the same thread.
  // Sends product context so the seller sees what the buyer is asking
  // about (mirrors the web chat widget payload).
  const startChat = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('AUTH_REQUIRED')
      if (!p?.shop?.id) throw new Error('NO_SHOP')
      const price = p.salePrice ?? p.price
      return post('/chat/conversations', {
        shopId:        p.shop.id,
        customerId:    user.id,
        customerName:  user.name || 'Хэрэглэгч',
        productName:   p.name,
        productPrice:  price,
      }) as unknown as Promise<{ id: string }>
    },
    onSuccess: (conv) => {
      router.push({ pathname: '/chat/[id]', params: { id: conv.id } } as any)
    },
    onError: (err: Error) => {
      if (err.message === 'AUTH_REQUIRED') {
        router.push('/(auth)/login' as any)
        return
      }
      Alert.alert('Чат эхлүүлж чадсангүй', 'Дахин оролдоно уу')
    },
  })

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
      // Cart labels shop ownership under the legacy `entityId/entityName`
      // keys. API returns this as `shop.id/shop.name`, so map them here.
      entityId:   p.shop?.id   || '',
      entityName: p.shop?.name || '',
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
            accessibilityRole="button"
            accessibilityLabel="Буцах"
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
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Хадгалснаас хасах' : 'Хадгалах'}
            accessibilityState={{ selected: saved }}
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
            {/* Price block — if salePrice is set and lower than price,
                show salePrice as the big brand-colored number and strike
                through the original price next to it. Matches web
                ProductDetailClient (AUDIT M1). */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, flexShrink: 1 }}>
              <Text style={{ color: C.brand, fontSize: 28, fontWeight: '900' }}>
                {(p?.salePrice ?? p?.price)?.toLocaleString()}₮
              </Text>
              {p?.salePrice != null && p?.salePrice < p?.price && (
                <Text style={{
                  color: C.textMuted,
                  fontSize: 16,
                  fontWeight: '500',
                  textDecorationLine: 'line-through',
                }}>
                  {p.price.toLocaleString()}₮
                </Text>
              )}
            </View>
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

          {/* Entity-specific details — mirrors web ProductDetailClient
              per-entityType layouts (AUDIT M2). Rendered above the generic
              Quantity block so category-relevant specs (apartment area,
              service duration, pre-order batch progress) surface first.
              Falls through for STORE / legacy products. */}
          {p?.entityType === 'REAL_ESTATE' && <RealEstateDetails p={p} />}
          {p?.entityType === 'SERVICE'     && <ServiceDetails     p={p} />}
          {p?.entityType === 'PRE_ORDER'   && <PreOrderDetails    p={p} />}

          {/* Quantity — hidden for REAL_ESTATE (buying units of a flat
              makes no sense) and PRE_ORDER (one slot per buyer). Stays
              visible for SERVICE so buyers can book multiple sessions. */}
          {p?.entityType !== 'REAL_ESTATE' && p?.entityType !== 'PRE_ORDER' && (
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
          )}

          {/* Delivery info — per-product fee + ETA, mirrors web storefront
              ModalBody. Skipped entirely for dropship products because the
              yellow dropship card below already covers shipping semantics
              (and dropship.estimatedShippingDaysMin/Max is in days, not mins).
              Also skipped when both fields are empty so legacy products
              without delivery metadata don't render an empty card. */}
          {!p?.dropship && (p?.deliveryFee != null || p?.estimatedMins != null) && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              marginBottom: 16,
              backgroundColor: C.bgSection,
              borderRadius: R.lg,
              padding: 12,
              borderWidth: 1,
              borderColor: C.border,
            }}>
              {p?.deliveryFee != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="car-outline" size={16} color={C.textSub} />
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>
                    {p.deliveryFee === 0 ? 'Үнэгүй хүргэлт' : `${p.deliveryFee.toLocaleString()}₮ хүргэлт`}
                  </Text>
                </View>
              )}
              {p?.deliveryFee != null && p?.estimatedMins != null && (
                <View style={{ width: 1, height: 14, backgroundColor: C.border }} />
              )}
              {p?.estimatedMins != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="time-outline" size={16} color={C.textSub} />
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>
                    ~{p.estimatedMins} мин
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Dropship badges — shown only for products imported from AliExpress / CJ.
              Sits above the description so the buyer sees the shipping caveats
              before reading the product copy. Matches Amazon-style "Import from"
              convention: origin + ETA + customs disclaimer. */}
          {p?.dropship && (
            <View style={{
              backgroundColor: '#FEF3C7',
              borderRadius: R.lg,
              padding: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#FDE68A',
              gap: 8,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="earth" size={18} color="#92400E" />
                <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 14 }}>
                  Олон улсаас хүргэнэ
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time-outline" size={16} color="#92400E" />
                <Text style={{ color: '#78350F', fontSize: 13 }}>
                  Хүргэх хугацаа: {p.dropship.estimatedShippingDaysMin || 15}–{p.dropship.estimatedShippingDaysMax || 30} хоног
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <Ionicons name="information-circle-outline" size={16} color="#92400E" style={{ marginTop: 1 }} />
                <Text style={{ color: '#78350F', fontSize: 12, flex: 1, lineHeight: 17 }}>
                  Гаалийн хураамж, импортын татвар барааны үнэд багтаагүй. Хэрэглэгч тусад нь төлөх магадлалтай.
                </Text>
              </View>
              {p.dropship.supplierName && (
                <Text style={{ color: '#78350F', fontSize: 11, opacity: 0.75 }}>
                  Нийлүүлэгч: {p.dropship.supplierName.toUpperCase()}
                </Text>
              )}
            </View>
          )}

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

          {/* Reviews section — matches web ReviewSection parity (audit C7).
              Hidden entirely when there are no reviews so the screen doesn't
              render an empty "0 үнэлгээ" block. */}
          {reviewsData && reviewsData.total > 0 && (
            <ReviewSection data={reviewsData} avgRating={p?.rating ?? 0} />
          )}

          {/* Store — links to /storefront/[slug]. The API returns the
              seller's shop as `shop: { id, name, slug, logo }`. Requires
              a slug so we don't navigate to /storefront/undefined. */}
          {p?.shop?.slug && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/storefront/${p.shop.slug}` as any)
              }
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: C.bgCard, borderRadius: R.lg,
                padding: 14, marginBottom: 16, gap: 12,
                borderWidth: 1, borderColor: C.border,
              }}
            >
              {p.shop.logo ? (
                <Image
                  source={{ uri: p.shop.logo }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <View style={{
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: C.primary,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: C.white, fontSize: 20, fontWeight: '700' }}>
                    {p.shop.name?.[0] || '?'}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>
                  {p.shop.name}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                  Дэлгүүр харах
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.border} />
            </TouchableOpacity>
          )}

          {/* Chat-with-seller — parity with web chat widget (AUDIT M1c).
              Tap → find-or-create conversation with product context, then
              open chat screen.
              Hidden when the product has no shop (herder / orphan listings). */}
          {p?.shop?.id && (
            <TouchableOpacity
              onPress={() => startChat.mutate()}
              disabled={startChat.isPending}
              accessibilityRole="button"
              accessibilityLabel={`Худалдагчтай чатлах${p.shop.name ? `: ${p.shop.name}` : ''}`}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: C.bgCard, borderRadius: R.lg,
                padding: 14, marginBottom: 16, gap: 12,
                borderWidth: 1, borderColor: C.brand,
                opacity: startChat.isPending ? 0.6 : 1,
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: C.brand,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="chatbubbles" size={18} color={C.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>
                  Худалдагчтай чатлах
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                  {p.shop.name || 'Асуух зүйл байвал шууд бичнэ үү'}
                </Text>
              </View>
              <Ionicons
                name={startChat.isPending ? 'hourglass-outline' : 'chevron-forward'}
                size={18}
                color={C.brand}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Related products — same-category feed, matches web parity (AUDIT M1b).
            Placed outside the padded Info container so the horizontal
            ScrollView can bleed to the screen edges. Hidden when the
            endpoint returned nothing. */}
        {relatedData && relatedData.products.length > 0 && (
          <RelatedSection products={relatedData.products} currentId={id as string} />
        )}

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
          accessibilityRole="button"
          accessibilityLabel={`Сагсанд нэмэх, ${qty} ширхэг`}
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
          accessibilityRole="button"
          accessibilityLabel={`Шууд захиалах, ${qty} ширхэг`}
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

function ReviewSection({ data, avgRating }: { data: ReviewsResponse; avgRating: number }) {
  // Backend returns only the rating buckets that actually have reviews,
  // so fill in the missing rows with 0 counts for a stable 5-bar layout.
  const countsByRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const b of data.breakdown) countsByRating[b.rating] = b.count

  return (
    <View style={{
      backgroundColor: C.bgCard, borderRadius: R.lg,
      padding: 16, marginBottom: 16,
      borderWidth: 1, borderColor: C.border,
    }}>
      <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>
        Үнэлгээ ({data.total})
      </Text>

      {/* Summary row: big avg on the left, breakdown bars on the right */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <View style={{ alignItems: 'center', minWidth: 80 }}>
          <Text style={{ fontSize: 32, fontWeight: '900', color: C.text }}>
            {(avgRating || 0).toFixed(1)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Ionicons
                key={n}
                name={n <= Math.round(avgRating) ? 'star' : 'star-outline'}
                size={12}
                color="#F59E0B"
              />
            ))}
          </View>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          {[5, 4, 3, 2, 1].map((r) => {
            const count = countsByRating[r]
            const pct = data.total > 0 ? (count / data.total) * 100 : 0
            return (
              <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: C.textMuted, fontSize: 11, width: 10 }}>{r}</Text>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <View style={{
                  flex: 1, height: 6, borderRadius: 3, backgroundColor: C.bgSection,
                  overflow: 'hidden',
                }}>
                  <View style={{ width: `${pct}%`, height: '100%', backgroundColor: '#F59E0B' }} />
                </View>
                <Text style={{ color: C.textMuted, fontSize: 11, width: 24, textAlign: 'right' }}>
                  {count}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* Individual reviews */}
      <View style={{ gap: 12 }}>
        {data.reviews.map((r) => <ReviewRow key={r.id} r={r} />)}
      </View>

      {data.hasMore && (
        <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          +{data.total - data.reviews.length} бусад үнэлгээ
        </Text>
      )}
    </View>
  )
}

function ReviewRow({ r }: { r: ReviewItem }) {
  const when = new Date(r.createdAt).toLocaleDateString('mn-MN')
  return (
    <View style={{
      backgroundColor: C.bgSection, borderRadius: R.md,
      padding: 12, borderWidth: 0.5, borderColor: C.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>
            {r.buyerName || 'Хэрэглэгч'}
          </Text>
          {r.isVerified && (
            <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 1 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Ionicons
              key={n}
              name={n <= r.rating ? 'star' : 'star-outline'}
              size={12}
              color={n <= r.rating ? '#F59E0B' : C.border}
            />
          ))}
        </View>
      </View>
      {r.title ? (
        <Text style={{ color: C.text, fontWeight: '600', fontSize: 13, marginBottom: 4 }}>
          {r.title}
        </Text>
      ) : null}
      {r.comment ? (
        <Text style={{ color: C.textSub, fontSize: 13, lineHeight: 19 }}>
          {r.comment}
        </Text>
      ) : null}
      {r.sellerReply ? (
        <View style={{
          marginTop: 8, paddingTop: 8, paddingLeft: 10,
          borderLeftWidth: 2, borderLeftColor: C.brand,
        }}>
          <Text style={{ color: C.brand, fontWeight: '700', fontSize: 11, marginBottom: 2 }}>
            Худалдагчийн хариу
          </Text>
          <Text style={{ color: C.textSub, fontSize: 12, lineHeight: 17 }}>
            {r.sellerReply}
          </Text>
        </View>
      ) : null}
      <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 6 }}>{when}</Text>
    </View>
  )
}

function RelatedSection({ products, currentId }: { products: RelatedProduct[]; currentId: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{
        ...F.h4,
        color: C.text,
        marginBottom: 12,
        paddingHorizontal: 16,
      }}>
        Төстэй бараа
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {products.map((rp) => (
          <RelatedCard key={rp.id} product={rp} currentId={currentId} />
        ))}
      </ScrollView>
    </View>
  )
}

function RelatedCard({ product, currentId }: { product: RelatedProduct; currentId: string }) {
  const display = product.salePrice ?? product.price
  const image = product.images?.[0]
  // router.replace (not push) so the back button still returns to the
  // originating screen rather than walking through the chain of related
  // products the user tapped through.
  const handlePress = () => {
    if (product.id === currentId) return
    router.replace({ pathname: '/product/[id]', params: { id: product.id } } as any)
  }
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        width: 140,
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
      }}
    >
      <View style={{
        width: '100%',
        height: 140,
        backgroundColor: C.bgSection,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {image ? (
          <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : product.emoji ? (
          <Text style={{ fontSize: 48 }}>{product.emoji}</Text>
        ) : (
          <Ionicons name="image-outline" size={32} color={C.border} />
        )}
      </View>
      <View style={{ padding: 10, gap: 4 }}>
        <Text numberOfLines={2} style={{ color: C.text, fontSize: 12, fontWeight: '600', minHeight: 32 }}>
          {product.name}
        </Text>
        <Text style={{ color: C.brand, fontSize: 14, fontWeight: '800' }}>
          {display?.toLocaleString()}₮
        </Text>
        {product.rating != null && product.rating > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="star" size={11} color="#F9A825" />
            <Text style={{ color: C.textMuted, fontSize: 11 }}>
              {product.rating.toFixed(1)} ({product.reviewCount || 0})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

// ─── Entity-specific detail sections (AUDIT M2) ─────────────────────
// Mirror of web `ProductDetailClient` per-entityType layouts. Each
// component renders a self-contained card/block above the Quantity +
// Delivery sections. Fields are all optional — if the row has no
// relevant data the sub-blocks simply don't render.

function SpecCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{
      flex: 1, minWidth: '47%', flexDirection: 'row', alignItems: 'center',
      gap: 10, padding: 12, borderRadius: R.lg,
      backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    }}>
      <Ionicons name={icon} size={20} color={C.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.textMuted, fontSize: 11 }}>{label}</Text>
        <Text style={{ color: C.text, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  )
}

function SpecPill({ icon, value, iconColor }: { icon: any; value: string; iconColor?: string }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: R.full,
      backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    }}>
      <Ionicons name={icon} size={14} color={iconColor || C.textSub} />
      <Text style={{ color: C.text, fontSize: 12, fontWeight: '600' }}>{value}</Text>
    </View>
  )
}

function RealEstateDetails({ p }: { p: any }) {
  const price    = p.salePrice ?? p.price
  const hasSpecs = p.area || p.rooms || p.floor || p.district
  if (!hasSpecs && !p.area) return null
  return (
    <View style={{ marginBottom: 16, gap: 10 }}>
      {hasSpecs && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {p.area     && <SpecCard icon="resize-outline"  label="Талбай" value={`${p.area}м²`} />}
          {p.rooms    && <SpecCard icon="bed-outline"     label="Өрөө"   value={`${p.rooms}`} />}
          {p.floor    && (
            <SpecCard
              icon="business-outline"
              label="Давхар"
              value={`${p.floor}${p.totalFloors ? '/' + p.totalFloors : ''}`}
            />
          )}
          {p.district && <SpecCard icon="location-outline" label="Дүүрэг" value={p.district} />}
        </View>
      )}
      {p.area && price > 0 && (
        <Text style={{ color: C.textMuted, fontSize: 13 }}>
          м²-ийн үнэ: <Text style={{ color: C.text, fontWeight: '700' }}>
            {Math.round(price / p.area).toLocaleString()}₮
          </Text>
        </Text>
      )}
    </View>
  )
}

function ServiceDetails({ p }: { p: any }) {
  const hasPills = p.duration || p.rating || p.district
  if (!hasPills) return null
  return (
    <View style={{ marginBottom: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {p.duration && <SpecPill icon="time-outline"     value={`${p.duration} мин`} />}
        {p.rating   && <SpecPill icon="star"             value={`${p.rating}`} iconColor="#F9A825" />}
        {p.district && <SpecPill icon="location-outline" value={p.district} />}
      </View>
      {p.availableSlots != null && p.availableSlots > 0 && (
        <Text style={{ color: C.textMuted, fontSize: 13 }}>
          Захиалах боломжтой цаг: <Text style={{ color: C.text, fontWeight: '700' }}>
            {p.availableSlots}
          </Text>
        </Text>
      )}
    </View>
  )
}

function PreOrderDetails({ p }: { p: any }) {
  const current  = Number(p.currentBatch) || 0
  const min      = Number(p.minBatch) || 1
  const progress = Math.min(Math.round((current / min) * 100), 100)
  // deliveryEstimate is stored as a date string on the Product model; if
  // it parses to a valid date, compute days left — otherwise treat it as
  // free-form text and render it under the bar.
  const deadline   = p.deliveryEstimate ? new Date(p.deliveryEstimate) : null
  const hasValidDate = deadline && !isNaN(deadline.getTime())
  const daysLeft   = hasValidDate
    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000))
    : null
  const price    = p.salePrice ?? p.price
  const advance  = p.advancePercent
    ? Math.round((price * p.advancePercent) / 100)
    : null

  return (
    <View style={{ marginBottom: 16, gap: 10 }}>
      <View style={{
        padding: 14, borderRadius: R.lg, gap: 8,
        backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>
            Захиалга цугласан
          </Text>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: '800' }}>
            {current}/{min}
          </Text>
        </View>
        <View style={{
          height: 10, borderRadius: 5, overflow: 'hidden',
          backgroundColor: C.bgSection,
        }}>
          <View style={{
            width: `${progress}%`, height: '100%',
            backgroundColor: C.brand, borderRadius: 5,
          }} />
        </View>
        {daysLeft !== null && (
          <Text style={{ color: C.textMuted, fontSize: 12 }}>
            {daysLeft} хоног үлдсэн
          </Text>
        )}
        {!hasValidDate && p.deliveryEstimate && (
          <Text style={{ color: C.textMuted, fontSize: 12 }}>
            Хүргэлт: {p.deliveryEstimate}
          </Text>
        )}
      </View>
      {advance != null && (
        <Text style={{ color: C.textMuted, fontSize: 13 }}>
          Урьдчилгаа: <Text style={{ color: C.text, fontWeight: '700' }}>
            {p.advancePercent}% ({advance.toLocaleString()}₮)
          </Text>
        </Text>
      )}
    </View>
  )
}
