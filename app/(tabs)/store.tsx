import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, Image, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native'
import { router }   from 'expo-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get }      from '../../src/services/api'
import { C, R, S }  from '../../src/shared/design'
import { ProductCardSkeleton } from '../../src/shared/ui/Skeleton'
import { FilterSheet } from '../../src/shared/ui/FilterSheet'

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

export default function StoreScreen() {
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [page,       setPage]       = useState(1)
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
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
    }}>

      {/* Header */}
      <View style={{
        paddingTop:        52,
        paddingHorizontal: 16,
        paddingBottom:     12,
        backgroundColor:   C.bg,
      }}>
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12,
        }}>
          <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>
            Дэлгүүр
          </Text>
          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            style={{
              backgroundColor: C.bgSection, borderRadius: R.lg,
              padding: 10, borderWidth: 1,
              borderColor: Object.keys(filters).length > 0 ? C.brand : C.border,
            }}
          >
            <Ionicons name="options-outline" size={20}
              color={Object.keys(filters).length > 0 ? C.brand : C.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{
          flexDirection:   'row',
          alignItems:      'center',
          backgroundColor: C.bgSection,
          borderRadius:    R.xl,
          paddingHorizontal: 14,
          borderWidth:     1,
          borderColor:     C.border,
        }}>
          <Ionicons name="search"
            size={18} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={t => {
              setSearch(t)
              setPage(1)
            }}
            placeholder="Бараа хайх..."
            placeholderTextColor={C.textMuted}
            style={{
              flex:    1,
              color:   C.text,
              padding: 12,
              fontSize: 14,
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
            >
              <Ionicons name="close-circle"
                size={18} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 6,
          }}
        >
          {CATS.map(c => {
            const active = category === c.slug
            return (
              <TouchableOpacity
                key={c.slug || 'all'}
                onPress={() => setCategory(
                  category === c.slug && c.slug !== '' ? '' : c.slug
                )}
                style={{
                  flexDirection:     'row',
                  alignItems:        'center',
                  paddingHorizontal: 14,
                  paddingVertical:   9,
                  borderRadius:      R.full,
                  backgroundColor:   active ? C.primary : C.bgSection,
                  borderWidth:       1,
                  borderColor:       active ? C.primary : C.border,
                  gap: 6,
                }}
              >
                <Ionicons
                  name={(active ? c.icon : c.icon + '-outline') as any}
                  size={14}
                  color={active ? C.white : C.textSub}
                />
                <Text style={{
                  color:      active ? C.white : C.textSub,
                  fontSize:   13,
                  fontWeight: active ? '700' : '500',
                }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Products grid */}
      {isLoading ? (
        <View style={{
          flexDirection: 'row',
          flexWrap:      'wrap',
          padding:       8,
        }}>
          {[1,2,3,4,5,6].map(i => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={i => i.id}
          contentContainerStyle={{
            padding:      8,
            paddingBottom: 80,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={C.brand}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(`/product/${item.id}`)
              }
              style={{
                flex:            1,
                margin:          6,
                backgroundColor: C.bgCard,
                borderRadius:    R.lg,
                overflow:        'hidden',
                borderWidth:     1,
                borderColor:     C.border,
                ...S.card,
              }}
            >
              <Image
                source={{
                  uri: item.media?.[0]?.url
                }}
                style={{
                  width:       '100%',
                  aspectRatio: 1,
                  backgroundColor: C.bgSection,
                }}
                resizeMode="cover"
              />
              <View style={{ padding: 10 }}>
                <Text
                  style={{
                    color:    C.text,
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text style={{
                  color:      C.brand,
                  fontWeight: '800',
                  fontSize:   14,
                  marginTop:  6,
                }}>
                  {item.price?.toLocaleString()}₮
                </Text>
                {item.rating > 0 && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems:    'center',
                    gap:           3,
                    marginTop:     4,
                  }}>
                    <Ionicons name="star"
                      size={11} color="#F9A825" />
                    <Text style={{
                      color:    C.textMuted,
                      fontSize: 11,
                    }}>
                      {item.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{
              alignItems: 'center',
              marginTop:  80,
            }}>
              <Ionicons name="cube-outline"
                size={64} color={C.border} />
              <Text style={{
                color:     C.textMuted,
                marginTop: 12,
                fontSize:  16,
              }}>
                Бараа олдсонгүй
              </Text>
            </View>
          }
        />
      )}

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
        type="store"
      />
    </View>
  )
}
