import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Dimensions, FlatList, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../src/store/auth'
import { useCart } from '../../src/store/cart'
import { get } from '../../src/services/api'
import { C, R, F, S } from '../../src/shared/design'

import { Skeleton } from '../../src/shared/ui/Skeleton'
import { LiveCarousel } from '../components/LiveCarousel'
import { StoriesRow } from '../components/home/StoriesRow'
import { FlashSaleRow } from '../components/home/FlashSaleRow'
import { GoldCta } from '../components/home/GoldCta'
import { AiShopperCard } from '../components/home/AiShopperCard'
import { BnplBanner } from '../components/home/BnplBanner'
import { HerderRow } from '../components/home/HerderRow'

const { width } = Dimensions.get('window')
const CARD_W = 156

const QA_ITEMS = [
  { icon: 'bag-outline' as const, label: 'Захиалах', color: '#4338CA', bg: '#EEF2FF', route: '/orders' },
  { icon: 'car-outline' as const, label: 'Хүргэлт', color: '#EA580C', bg: '#FFF7ED', route: '/track/search' },
  { icon: 'cash-outline' as const, label: 'Хэтэвч', color: '#059669', bg: '#ECFDF5', route: '/(customer)/wallet' },
  { icon: 'star-outline' as const, label: 'Gold', color: '#CA8A04', bg: '#FEF9C3', route: '/(customer)/tier-details' },
  { icon: 'heart-outline' as const, label: 'Wishlist', color: '#E11D48', bg: '#FFF1F2', route: '/(customer)/wishlist' },
  { icon: 'chatbubble-outline' as const, label: 'Чат', color: '#2563EB', bg: '#EFF6FF', route: '/chat/list' },
  { icon: 'globe-outline' as const, label: 'Dropship', color: '#16A34A', bg: '#F0FDF4', route: '/(customer)/herder' },
  { icon: 'lock-closed-outline' as const, label: 'BNPL', color: '#7C3AED', bg: '#FAF5FF', route: '/(customer)/bnpl' },
]

const SERVICE_ITEMS = [
  {
    icon: 'radio-button-on' as const,
    color: '#EF4444',
    name: 'Live',
    sub: 'Шууд дамжуулалт',
    route: '/(customer)/live',
  },
  {
    icon: 'card' as const,
    color: '#2563EB',
    name: 'Төлбөр',
    sub: 'QPay, SocialPay',
    route: '/(customer)/wallet',
  },
  {
    icon: 'leaf' as const,
    color: '#059669',
    name: 'Малчны',
    sub: 'Шинэ бараа',
    route: '/(customer)/herder',
  },
  {
    icon: 'people' as const,
    color: '#7C3AED',
    name: 'Referral',
    sub: 'Найзаа урих',
    route: '/(customer)/become-seller',
  },
]

const ENTITY_TYPES = [
  { type: 'STORE',        icon: 'storefront', name: 'Дэлгүүр',   color: '#E8242C' },
  { type: 'REAL_ESTATE',  icon: 'home',       name: 'Үл хөдлөх', color: '#2563EB' },
  { type: 'AUTO',         icon: 'car',        name: 'Авто',       color: '#16A34A' },
  { type: 'SERVICE',      icon: 'cut',        name: 'Үйлчилгээ', color: '#7C3AED' },
  { type: 'CONSTRUCTION', icon: 'construct',  name: 'Барилга',    color: '#0891B2' },
  { type: 'PRE_ORDER',    icon: 'cube',       name: 'Pre-order',  color: '#D97706' },
  { type: 'DIGITAL',      icon: 'laptop',     name: 'Дижитал',    color: '#6366F1' },
]

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
    }}>
      <Text style={{ ...F.h3, color: C.text }}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={{
          flexDirection: 'row', alignItems: 'center', gap: 2,
        }}>
          <Text style={{ color: C.primary, fontSize: 13, fontWeight: '600' }}>
            Бүгдийг харах
          </Text>
          <Ionicons name="chevron-forward" size={14} color={C.primary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

function PromotedBadge() {
  return (
    <View style={{
      position: 'absolute', top: 8, left: 8, zIndex: 1,
      backgroundColor: C.gold, borderRadius: R.sm,
      paddingHorizontal: 6, paddingVertical: 2,
      flexDirection: 'row', alignItems: 'center', gap: 3,
    }}>
      <Ionicons name="flash" size={9} color={C.black} />
      <Text style={{ color: C.black, fontSize: 9, fontWeight: '800' }}>
        ОНЦГОЙ
      </Text>
    </View>
  )
}

// ═══════════════════════════════════
// STORE OWNER — Dashboard
// ═══════════════════════════════════

function StoreDashboard() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['store-dashboard'],
    queryFn: () => get('/seller/analytics'),
  })

  const stats = (data as any) || {}

  const CARDS = [
    { icon: 'cash' as const, label: 'Борлуулалт', value: (stats.totalRevenue || 0).toLocaleString() + '₮', color: '#E8242C' },
    { icon: 'receipt' as const, label: 'Захиалга', value: String(stats.totalOrders || 0), color: '#1A73E8' },
    { icon: 'cube' as const, label: 'Бараа', value: String(stats.totalProducts || 0), color: '#34A853' },
    { icon: 'star' as const, label: 'Үнэлгээ', value: (stats.rating || 0).toFixed(1), color: '#F9A825' },
  ]

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.store} />}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: C.text }}>
          Дэлгүүрийн самбар
        </Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>Хяналтын самбар</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10 }}>
        {CARDS.map((c, i) => (
          <View key={i} style={{ width: '47%', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, borderLeftWidth: 3, borderLeftColor: c.color, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name={c.icon} size={24} color={c.color} />
            <Text style={{ color: c.color, fontSize: 22, fontWeight: '900', marginTop: 8 }}>{c.value}</Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ margin: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 }}>Хурдан үйлдэл</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[
            { icon: 'add-circle' as const, label: 'Бараа нэмэх', color: C.store, route: '/(tabs)/store' },
            { icon: 'receipt' as const, label: 'Захиалгууд', color: '#1A73E8', route: '/orders' },
            { icon: 'people' as const, label: 'Борлуулагчид', color: '#7C3AED', route: '/(seller)/products' },
            { icon: 'bar-chart' as const, label: 'Тайлан', color: '#F9A825', route: '/(seller)/earnings' },
          ].map((a, i) => (
            <TouchableOpacity key={i} onPress={() => router.push(a.route as any)}
              style={{ width: '47%', backgroundColor: a.color + '15', borderRadius: R.lg, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: a.color + '30' }}>
              <Ionicons name={a.icon} size={26} color={a.color} />
              <Text style={{ color: C.text, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

// ═══════════════════════════════════
// ROUTER — Role-аар ялгах (STORE-only legacy;
// DRIVER/SELLER now route to their own groups)
// ═══════════════════════════════════

export default function HomeScreen() {
  const { role } = useAuth()

  // STORE → store dashboard (legacy; STORE usually routes to /(owner))
  if (role === 'STORE') return <StoreDashboard />

  // BUYER / default → home feed
  return <BuyerHome />
}

function BuyerHome() {
  const { user, role } = useAuth()
  const { count } = useCart()
  const [bannerIdx, setBannerIdx] = useState(0)
  const bannerRef = useRef<ScrollView>(null)

  // API queries
  const { data: featuredData, isLoading: loadingFeatured, refetch } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => get('/search?limit=10&sort=newest&featured=true'),
  })

  const { data: newData, isLoading: loadingNew } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => get('/search?limit=10&sort=newest'),
  })

  const { data: storesData, isLoading: loadingStores } = useQuery({
    queryKey: ['featured-stores'],
    queryFn: () => get('/entities?limit=10&featured=true'),
  })

  const { data: feedData } = useQuery({
    queryKey: ['feed-preview'],
    queryFn: () => get('/feed?limit=6'),
  })

  const featuredProducts = (featuredData as any)?.products || []
  const newProducts = (newData as any)?.products || []
  const stores = (storesData as any)?.entities || (Array.isArray(storesData) ? storesData : [])
  const feedPosts = (feedData as any)?.posts ?? (Array.isArray(feedData) ? feedData : [])

  const displayBanners = [
    { id: '1', title: 'Монголын нэгдсэн платформ',
      subtitle: '10,000+ бараа, 500+ дэлгүүр', color: '#1A0000',
      gradient: ['#2D0000', '#1A0000'] as const },
    { id: '2', title: 'Дэлгүүрээ онцлоорой',
      subtitle: 'Онцгой байршилд гарч борлуулалтаа нэмэгдүүлээрэй', color: '#001A2D',
      gradient: ['#002D4A', '#001A2D'] as const },
    { id: '3', title: 'Gold гишүүн болох',
      subtitle: 'Онцгой эрх, хямдрал, урамшуулал', color: '#1A1400',
      gradient: ['#2D1F00', '#1A1100'] as const },
  ]

  useEffect(() => {
    const i = setInterval(() => {
      setBannerIdx((prev) => {
        const next = (prev + 1) % displayBanners.length
        bannerRef.current?.scrollTo({ x: next * (width - 24), animated: true })
        return next
      })
    }, 3500)
    return () => clearInterval(i)
  }, [])

  const handleRefresh = () => { refetch() }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingFeatured} onRefresh={handleRefresh} tintColor={C.brand} />
        }
      >
        {/* ═══ HEADER ═══ */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
          gap: 10,
        }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: -0.5 }}>
            eseller<Text style={{ color: C.brand }}>.mn</Text>
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push('/cart' as any)}
            style={{ position: 'relative' }}
          >
            <Ionicons name="cart-outline" size={24} color={C.text} />
            {count() > 0 && (
              <View style={{
                position: 'absolute', top: -4, right: -4,
                backgroundColor: C.brand, borderRadius: 8,
                minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: C.white, fontSize: 9, fontWeight: '700' }}>{count()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/search' as any)}>
            <Ionicons name="search-outline" size={22} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* ═══ HERO BANNER ═══ */}
        <View style={{
          height: 170, marginHorizontal: 12, borderRadius: R.xl,
          overflow: 'hidden', marginBottom: 16,
        }}>
          <ScrollView
            ref={bannerRef} horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (width - 24)))
            }
          >
            {displayBanners.map((b) => (
              <View key={b.id} style={{
                width: width - 24, height: 170, justifyContent: 'flex-end',
              }}>
                <LinearGradient
                  colors={[...b.gradient]}
                  style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}
                >
                  <Text style={{ color: C.white, fontSize: 20, fontWeight: '800' }}>
                    {b.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
                    {b.subtitle}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
          <View style={{ position: 'absolute', bottom: 10, right: 12, flexDirection: 'row', gap: 5 }}>
            {displayBanners.map((_, i) => (
              <View key={i} style={{
                width: i === bannerIdx ? 16 : 6, height: 6, borderRadius: 3,
                backgroundColor: i === bannerIdx ? C.white : 'rgba(255,255,255,0.4)',
              }} />
            ))}
          </View>
        </View>

        {/* ═══ SEARCH BAR ═══ */}
        <TouchableOpacity
          onPress={() => router.push('/search' as any)}
          style={{
            flexDirection: 'row', alignItems: 'center',
            marginHorizontal: 12, marginBottom: 20,
            backgroundColor: C.bgSection, borderRadius: R.xl,
            padding: 14, gap: 10, borderWidth: 1, borderColor: C.border,
          }}
        >
          <Ionicons name="search" size={18} color={C.textMuted} />
          <Text style={{ color: C.textMuted, fontSize: 14, flex: 1 }}>
            Бараа, дэлгүүр хайх...
          </Text>
        </TouchableOpacity>

        {/* ═══ QUICK ACTION GRID — Toki style ═══ */}
        <View style={{
          marginHorizontal: 16,
          marginBottom: 14,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 12,
          borderWidth: 0.5,
          borderColor: 'rgba(0,0,0,0.06)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
            {QA_ITEMS.map(item => (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                style={{
                  width: '25%',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: item.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 5,
                }}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#374151',
                  textAlign: 'center',
                }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══ STORIES (24h) ═══ */}
        <StoriesRow />

        {/* ═══ FLASH SALE ═══ */}
        <FlashSaleRow />

        {/* ═══ LIVE CAROUSEL ═══ */}
        <LiveCarousel />

        {/* ═══ GOLD CTA ═══ */}
        <GoldCta />

        {/* ═══ AI SHOPPER ═══ */}
        <AiShopperCard />

        {/* ═══ SERVICE GRID ═══ */}
        <View style={{
          marginHorizontal: 16,
          marginBottom: 12,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          {SERVICE_ITEMS.map(svc => (
            <TouchableOpacity
              key={svc.route}
              onPress={() => router.push(svc.route as any)}
              style={{
                width: '48%',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                borderWidth: 0.5,
                borderColor: 'rgba(0,0,0,0.06)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View style={{
                width: 38, height: 38,
                borderRadius: 10,
                backgroundColor: svc.color + '18',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Ionicons name={svc.icon} size={20} color={svc.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: '#111111',
                }}>
                  {svc.name}
                </Text>
                <Text style={{
                  fontSize: 10,
                  color: '#9CA3AF',
                  marginTop: 1,
                }}>
                  {svc.sub}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══ БҮХ ҮЙЛЧИЛГЭЭ ═══ */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/store' as any)}
          style={{
            marginHorizontal: 16,
            marginBottom: 14,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            borderWidth: 0.5,
            borderColor: 'rgba(0,0,0,0.06)',
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
          }}>
            Бүх үйлчилгээ
          </Text>
        </TouchableOpacity>

        {/* ═══ ENTITY TYPES ═══ */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title="Ангилал" />
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          >
            {ENTITY_TYPES.map((e) => (
              <TouchableOpacity
                key={e.type}
                onPress={() => router.push({ pathname: '/(tabs)/store' as any, params: { category: e.type } })}
                style={{
                  alignItems: 'center', backgroundColor: C.bgSection,
                  borderRadius: R.xl, paddingVertical: 14, paddingHorizontal: 14,
                  minWidth: 72, borderWidth: 1, borderColor: e.color + '30',
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: e.color + '18',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                }}>
                  <Ionicons name={e.icon as any} size={22} color={e.color} />
                </View>
                <Text style={{ color: C.textSub, fontSize: 11, fontWeight: '500', textAlign: 'center' }}>
                  {e.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ═══ ОНЦГОЙ БАРАА (PROMOTED - ТӨЛБӨРТЭЙ) ═══ */}
        {featuredProducts.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <SectionHeader
              title="Онцгой бараа"
              onSeeAll={() => router.push('/(tabs)/store' as any)}
            />
            <FlatList
              horizontal showsHorizontalScrollIndicator={false}
              data={featuredProducts}
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={{
                    width: CARD_W, backgroundColor: C.bgCard, borderRadius: R.lg,
                    overflow: 'hidden', borderWidth: 1,
                    borderColor: C.gold + '40', ...S.card,
                  }}
                >
                  <PromotedBadge />
                  <Image
                    source={{ uri: item.images?.[0] || item.media?.[0]?.url }}
                    style={{ width: CARD_W, height: CARD_W, backgroundColor: C.bgSection }}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 10 }}>
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '500' }} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.entityName && (
                      <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 3 }} numberOfLines={1}>
                        {item.entityName}
                      </Text>
                    )}
                    <View style={{
                      flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'space-between', marginTop: 6,
                    }}>
                      <Text style={{ color: C.brand, fontWeight: '800', fontSize: 14 }}>
                        {item.price?.toLocaleString()}₮
                      </Text>
                      {item.rating > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Ionicons name="star" size={10} color={C.gold} />
                          <Text style={{ color: C.textMuted, fontSize: 10 }}>
                            {item.rating?.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* ═══ BNPL BANNER ═══ */}
        <BnplBanner />

        {/* ═══ ОНЦГОЙ ДЭЛГҮҮРҮҮД (PROMOTED - ТӨЛБӨРТЭЙ) ═══ */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Онцгой дэлгүүрүүд"
            onSeeAll={() => router.push('/(tabs)/store' as any)}
          />
          {loadingStores ? (
            <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} width={200} height={120} borderRadius={R.lg} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              horizontal showsHorizontalScrollIndicator={false}
              data={stores}
              keyExtractor={(s: any) => s.id || s._id}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
              renderItem={({ item: s }: any) => (
                <TouchableOpacity
                  onPress={() => router.push(`/storefront/${s.storefrontSlug || s.slug || s.id}` as any)}
                  style={{
                    width: 200, backgroundColor: C.bgCard, borderRadius: R.lg,
                    overflow: 'hidden', borderWidth: 1,
                    borderColor: C.gold + '30', ...S.card,
                  }}
                >
                  {/* Store banner */}
                  <LinearGradient
                    colors={[C.primary + '30', C.bgCard]}
                    style={{
                      height: 60, justifyContent: 'center',
                      alignItems: 'center', position: 'relative',
                    }}
                  >
                    <View style={{
                      position: 'absolute', top: 6, right: 6,
                      backgroundColor: C.gold, borderRadius: R.sm,
                      paddingHorizontal: 5, paddingVertical: 1,
                      flexDirection: 'row', alignItems: 'center', gap: 2,
                    }}>
                      <Ionicons name="flash" size={8} color={C.black} />
                      <Text style={{ color: C.black, fontSize: 8, fontWeight: '800' }}>
                        ОНЦГОЙ
                      </Text>
                    </View>
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: C.primary,
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 2, borderColor: C.bgCard,
                    }}>
                      {s.logoUrl ? (
                        <Image source={{ uri: s.logoUrl }}
                          style={{ width: 44, height: 44, borderRadius: 22 }} />
                      ) : (
                        <Text style={{ color: C.white, fontSize: 18, fontWeight: '700' }}>
                          {s.name?.[0]}
                        </Text>
                      )}
                    </View>
                  </LinearGradient>

                  <View style={{ padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
                      {s.name}
                    </Text>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center',
                      gap: 4, marginTop: 4,
                    }}>
                      <Ionicons name="star" size={11} color={C.gold} />
                      <Text style={{ color: C.textMuted, fontSize: 11 }}>
                        {s.rating?.toFixed(1) || '5.0'}
                      </Text>
                      <Text style={{ color: C.border2, fontSize: 11 }}>·</Text>
                      <Text style={{ color: C.textMuted, fontSize: 11 }}>
                        {s.productCount || 0} бараа
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{
                  width: width - 24, alignItems: 'center', padding: 24,
                  backgroundColor: C.bgCard, borderRadius: R.lg,
                  borderWidth: 1, borderColor: C.border, marginHorizontal: 0,
                }}>
                  <Ionicons name="storefront-outline" size={36} color={C.textMuted} />
                  <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 8 }}>
                    Дэлгүүрээ онцлоорой
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
                    Нүүр хуудсанд гарч борлуулалтаа нэмэгдүүл
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* ═══ ХЕРДЭР БУЛАН ═══ */}
        <HerderRow />

        {/* ═══ ШИНЭ БАРАА ═══ */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Шинэ бараа"
            onSeeAll={() => router.push('/(tabs)/store' as any)}
          />
          {loadingNew ? (
            <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
              {[1, 2, 3].map(i => (
                <View key={i} style={{
                  width: CARD_W, backgroundColor: C.bgSection,
                  borderRadius: R.lg, height: 230,
                }} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              horizontal showsHorizontalScrollIndicator={false}
              data={newProducts}
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={{
                    width: CARD_W, backgroundColor: C.bgCard, borderRadius: R.lg,
                    overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...S.card,
                  }}
                >
                  <Image
                    source={{ uri: item.images?.[0] || item.media?.[0]?.url }}
                    style={{ width: CARD_W, height: CARD_W, backgroundColor: C.bgSection }}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 10 }}>
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '500' }} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 14, marginTop: 6 }}>
                      {item.price?.toLocaleString()}₮
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: C.textMuted, padding: 16 }}>Бараа байхгүй байна</Text>
              }
            />
          )}
        </View>

        {/* ═══ ЗАРЫН БУЛАН ═══ */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader
            title="Зарын булан"
            onSeeAll={() => router.push('/(tabs)/feed' as any)}
          />
          <View style={{ paddingHorizontal: 12 }}>
            {(feedPosts).slice(0, 5).map((p: any, idx: number) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => router.push(`/feed/${p.id}` as any)}
                style={{
                  flexDirection: 'row', backgroundColor: C.bgCard,
                  borderRadius: R.lg, marginBottom: 10, overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: p.featured ? C.gold + '40' : C.border,
                }}
              >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: p.media?.[0]?.url || p.images?.[0] }}
                    style={{ width: 100, height: 100, backgroundColor: C.bgSection }}
                    resizeMode="cover"
                  />
                  {p.featured && (
                    <View style={{
                      position: 'absolute', top: 4, left: 4,
                      backgroundColor: C.gold, borderRadius: R.xs,
                      paddingHorizontal: 4, paddingVertical: 1,
                    }}>
                      <Text style={{ color: C.black, fontSize: 8, fontWeight: '800' }}>
                        ОНЦГОЙ
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                  <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>
                    {p.title || p.name}
                  </Text>
                  <Text style={{ color: C.brand, fontWeight: '800', fontSize: 15, marginTop: 5 }}>
                    {p.price ? p.price.toLocaleString() + '₮' : 'Үнэ тохиролцоно'}
                  </Text>
                  {p.district && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
                      <Ionicons name="location-outline" size={11} color={C.textMuted} />
                      <Text style={{ color: C.textMuted, fontSize: 11 }}>{p.district}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══ PROMOTE CTA ═══ */}
        <View style={{ paddingHorizontal: 12, marginBottom: 100 }}>
          <TouchableOpacity
            onPress={() => router.push('/promote' as any)}
            style={{
              backgroundColor: C.gold + '10', borderRadius: R.xl,
              padding: 20, borderWidth: 1, borderColor: C.gold + '30',
              flexDirection: 'row', alignItems: 'center', gap: 14,
            }}
          >
            <View style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: C.gold + '20',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="rocket" size={24} color={C.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.gold, fontWeight: '700', fontSize: 15 }}>
                Бараа, дэлгүүрээ онцлоорой
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                Нүүр хуудсанд гарч борлуулалтаа нэмэгдүүлээрэй
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.gold} />
          </TouchableOpacity>
        </View>

      </ScrollView>

    </View>
  )
}

