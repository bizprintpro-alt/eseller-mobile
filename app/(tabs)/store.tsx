import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, Image, ScrollView,
  RefreshControl, Alert,
} from 'react-native'
import { router }   from 'expo-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get, del } from '../../src/services/api'
import { useAuth }  from '../../src/store/auth'
import { C, R, F, S } from '../../src/shared/design'
import { ProductCardSkeleton } from '../../src/shared/ui/Skeleton'
import { FilterSheet } from '../../src/shared/ui/FilterSheet'

// ═══════════════════════════════════
// BUYER — Дэлгүүр хайх, бараа үзэх
// ═══════════════════════════════════

const CATS = [
  { slug:'',              icon:'grid',             name:'Бүгд' },
  { slug:'electronics',   icon:'phone-portrait',   name:'Электроник' },
  { slug:'fashion',       icon:'shirt',            name:'Хувцас' },
  { slug:'home-living',   icon:'home',             name:'Гэр ахуй' },
  { slug:'beauty-health', icon:'sparkles',         name:'Гоо сайхан' },
  { slug:'kids-toys',     icon:'happy',            name:'Хүүхэд' },
  { slug:'auto-moto',     icon:'car',              name:'Авто' },
  { slug:'sports-travel', icon:'football',         name:'Спорт' },
  { slug:'food',          icon:'fast-food',        name:'Хүнс' },
  { slug:'digital',       icon:'laptop',           name:'Дижитал' },
  { slug:'books',         icon:'book',             name:'Ном' },
  { slug:'construction',  icon:'construct',        name:'Барилга' },
  { slug:'services',      icon:'build',            name:'Үйлчилгээ' },
]

function BuyerStoreScreen() {
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters,    setFilters]    = useState<any>({})

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['store-products', search, category, filters],
    queryFn:  () => get(
      `/search?q=${search}&category=${category}&limit=20` +
      `&minPrice=${filters.minPrice || ''}` +
      `&maxPrice=${filters.maxPrice || ''}` +
      `&sort=${filters.sortBy || 'newest'}`
    ),
  })

  const products = (data as any)?.products || []

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{
        paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
        backgroundColor: C.bg,
      }}>
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12,
        }}>
          <Text style={{ ...F.h2, color: C.text }}>Дэлгүүр</Text>
          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            style={{
              backgroundColor: C.bgSection, borderRadius: R.lg,
              padding: 10, borderWidth: 1,
              borderColor: Object.keys(filters).length > 0 ? C.primary : C.border,
            }}
          >
            <Ionicons name="options-outline" size={20}
              color={Object.keys(filters).length > 0 ? C.primary : C.text} />
          </TouchableOpacity>
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: C.bgSection, borderRadius: R.xl,
          paddingHorizontal: 14, borderWidth: 1, borderColor: C.border,
        }}>
          <Ionicons name="search" size={18} color={C.textMuted} />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Бараа хайх..." placeholderTextColor={C.textMuted}
            style={{ flex: 1, color: C.text, padding: 12, fontSize: 14 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}
        >
          {CATS.map(c => {
            const active = category === c.slug
            return (
              <TouchableOpacity
                key={c.slug || 'all'}
                onPress={() => setCategory(category === c.slug && c.slug !== '' ? '' : c.slug)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 14, paddingVertical: 9,
                  borderRadius: R.full, gap: 6,
                  backgroundColor: active ? C.primary : C.bgSection,
                  borderWidth: 1, borderColor: active ? C.primary : C.border,
                }}
              >
                <Ionicons
                  name={(active ? c.icon : c.icon + '-outline') as any}
                  size={14} color={active ? C.white : C.textSub}
                />
                <Text style={{
                  color: active ? C.white : C.textSub,
                  fontSize: 13, fontWeight: active ? '700' : '500',
                }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Products */}
      {isLoading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
          {[1,2,3,4,5,6].map(i => <ProductCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={products} numColumns={2}
          keyExtractor={i => i._id || i.id}
          contentContainerStyle={{ padding: 8, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.brand} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/product/${item._id || item.id}`)}
              style={{
                flex: 1, margin: 6, backgroundColor: C.bgCard,
                borderRadius: R.lg, overflow: 'hidden',
                borderWidth: 1, borderColor: C.border, ...S.card,
              }}
            >
              <Image
                source={{ uri: item.images?.[0] || item.media?.[0]?.url }}
                style={{ width: '100%', aspectRatio: 1, backgroundColor: C.bgSection }}
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
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Ionicons name="cube-outline" size={64} color={C.border} />
              <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 16 }}>
                Бараа олдсонгүй
              </Text>
            </View>
          }
        />
      )}

      <FilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)}
        onApply={setFilters} type="store" />
    </View>
  )
}

// ═══════════════════════════════════
// STORE OWNER — Миний бараа удирдах
// ═══════════════════════════════════

function StoreOwnerProductsScreen() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'active' | 'inactive'>('active')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-products', tab],
    queryFn: () => get(`/products/my?status=${tab}`),
    enabled: !!user,
  })

  const products = (data as any)?.products || (Array.isArray(data) ? data : [])

  const stats = {
    total:    products.length,
    active:   products.filter((p: any) => p.isActive).length,
    outStock: products.filter((p: any) => (p.stock || 0) <= 0).length,
    revenue:  products.reduce((s: number, p: any) => s + (p.soldCount || 0) * (p.price || 0), 0),
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Устгах', `"${name}" устгах уу?`, [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах', style: 'destructive',
        onPress: async () => {
          try {
            await del(`/products/${id}`)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            refetch()
          } catch (e: any) {
            Alert.alert('Алдаа', e.message)
          }
        },
      },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{
        paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
      }}>
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16,
        }}>
          <Text style={{ ...F.h2, color: C.text }}>Миний бараа</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push('/product/create' as any)
            }}
            style={{
              backgroundColor: C.store, borderRadius: R.lg,
              paddingHorizontal: 14, paddingVertical: 9,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
          >
            <Ionicons name="add" size={18} color={C.white} />
            <Text style={{ color: C.white, fontWeight: '700', fontSize: 13 }}>
              Бараа нэмэх
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Нийт', value: stats.total, color: C.primary },
            { label: 'Идэвхтэй', value: stats.active, color: C.secondary },
            { label: 'Дууссан', value: stats.outStock, color: C.error },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, backgroundColor: C.bgCard, borderRadius: R.lg,
              padding: 12, alignItems: 'center',
              borderWidth: 1, borderColor: C.border,
            }}>
              <Text style={{ color: s.color, fontSize: 22, fontWeight: '800' }}>
                {s.value}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Revenue */}
        <View style={{
          backgroundColor: C.store + '12', borderRadius: R.lg,
          padding: 14, flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', borderWidth: 1, borderColor: C.store + '30',
          marginBottom: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="trending-up" size={20} color={C.store} />
            <Text style={{ color: C.textSub, fontSize: 13 }}>Нийт борлуулалт</Text>
          </View>
          <Text style={{ color: C.store, fontWeight: '800', fontSize: 16 }}>
            {stats.revenue.toLocaleString()}₮
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['active', 'inactive'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1, paddingVertical: 10, alignItems: 'center',
                borderRadius: R.lg,
                backgroundColor: tab === t ? C.store + '15' : C.bgSection,
                borderWidth: 1,
                borderColor: tab === t ? C.store : C.border,
              }}
            >
              <Text style={{
                color: tab === t ? C.store : C.textMuted,
                fontWeight: tab === t ? '700' : '500', fontSize: 13,
              }}>
                {t === 'active' ? 'Идэвхтэй' : 'Идэвхгүй'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Product list */}
      {isLoading ? (
        <View style={{ padding: 10 }}>
          {[1,2,3].map(i => <ProductCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p: any) => p._id || p.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.store} />}
          renderItem={({ item }: any) => (
            <View style={{
              flexDirection: 'row', backgroundColor: C.bgCard,
              borderRadius: R.lg, marginBottom: 10, overflow: 'hidden',
              borderWidth: 1, borderColor: C.border,
            }}>
              <Image
                source={{ uri: item.images?.[0] || item.media?.[0]?.url }}
                style={{ width: 90, height: 90, backgroundColor: C.bgSection }}
                resizeMode="cover"
              />
              <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={{ color: C.brand, fontWeight: '800', fontSize: 15 }}>
                    {item.price?.toLocaleString()}₮
                  </Text>
                  <View style={{
                    backgroundColor: (item.stock || 0) > 0 ? C.secondary + '18' : C.error + '18',
                    borderRadius: R.sm, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Text style={{
                      color: (item.stock || 0) > 0 ? C.secondary : C.error,
                      fontSize: 10, fontWeight: '700',
                    }}>
                      {(item.stock || 0) > 0 ? `${item.stock} ширхэг` : 'Дууссан'}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <Text style={{ color: C.textMuted, fontSize: 11 }}>
                    {item.soldCount || 0} зарагдсан
                  </Text>
                  {item.allowAffiliate && (
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 2,
                    }}>
                      <Ionicons name="megaphone-outline" size={10} color={C.seller} />
                      <Text style={{ color: C.seller, fontSize: 10 }}>
                        {item.affiliateCommission || item.commission}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={{
                justifyContent: 'center', paddingRight: 10, gap: 8,
              }}>
                <TouchableOpacity
                  onPress={() => router.push(`/product/edit/${item._id || item.id}` as any)}
                  style={{
                    backgroundColor: C.primary + '15', borderRadius: R.sm,
                    padding: 8,
                  }}
                >
                  <Ionicons name="create-outline" size={16} color={C.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item._id || item.id, item.name)}
                  style={{
                    backgroundColor: C.error + '15', borderRadius: R.sm,
                    padding: 8,
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color={C.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="cube-outline" size={64} color={C.border} />
              <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 16 }}>
                Бараа байхгүй байна
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/product/create' as any)}
                style={{
                  backgroundColor: C.store, borderRadius: R.lg,
                  paddingHorizontal: 24, paddingVertical: 12, marginTop: 16,
                }}
              >
                <Text style={{ color: C.white, fontWeight: '700' }}>
                  Эхний бараагаа нэмэх
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  )
}

// ═══════════════════════════════════
// ROUTER — Role-аар ялгах
// ═══════════════════════════════════

export default function StoreScreen() {
  const { role } = useAuth()

  if (role === 'STORE') return <StoreOwnerProductsScreen />
  return <BuyerStoreScreen />
}
