import {
  View, Text, FlatList,
  TouchableOpacity, Image, ScrollView,
  RefreshControl,
} from 'react-native'
import { router }   from 'expo-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get }      from '../../src/services/api'
import { C, R }     from '../../src/shared/design'
import { FeedItemSkeleton } from '../../src/shared/ui/Skeleton'

const FEED_CATS = [
  { slug:'',           name:'Бүгд',      icon:'flame' },
  { slug:'auto-moto',  name:'Авто',      icon:'car' },
  { slug:'real-estate-feed', name:'Үл хөдлөх', icon:'home' },
  { slug:'electronics',name:'Электроник',icon:'phone-portrait' },
  { slug:'fashion',    name:'Хувцас',    icon:'shirt' },
  { slug:'services-feed',name:'Үйлчилгээ',icon:'construct' },
  { slug:'jobs-feed',  name:'Ажил',      icon:'briefcase' },
]

export default function FeedScreen() {
  const [category, setCategory] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['feed', category],
    queryFn:  () =>
      get(`/feed?category=${category}&limit=20`),
  })

  const posts = (data as any)?.posts ||
    (Array.isArray(data) ? data : [])

  return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
    }}>

      {/* Header */}
      <View style={{
        paddingTop:    52,
        paddingHorizontal: 16,
        paddingBottom: 12,
      }}>
        <Text style={{
          color:      C.text,
          fontSize:   20,
          fontWeight: '800',
        }}>
          Зарын булан
        </Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          gap: 8,
          alignItems: 'center',
        }}
      >
        {FEED_CATS.map(c => {
          const active = category === c.slug
          return (
            <TouchableOpacity
              key={c.slug}
              onPress={() => setCategory(c.slug)}
              style={{
                flexDirection:     'row',
                alignItems:        'center',
                paddingHorizontal: 14,
                paddingVertical:   8,
                borderRadius:      R.full,
                backgroundColor:   active
                  ? C.brand : C.bgSection,
                borderWidth:       1,
                borderColor:       active
                  ? C.brand : C.border,
                gap: 5,
              }}
            >
              <Ionicons
                name={c.icon as any}
                size={13}
                color={active ? C.white : C.textSub}
              />
              <Text style={{
                color:      active
                  ? C.white : C.textSub,
                fontSize:   12,
                fontWeight: '600',
              }}>
                {c.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Зарын жагсаалт */}
      <FlatList
        data={posts}
        keyExtractor={(p: any) => p.id}
        contentContainerStyle={{
          padding:      10,
          paddingBottom: 80,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={C.brand}
          />
        }
        renderItem={({ item }: any) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/feed/${item.id}` as any)
            }
            style={{
              flexDirection:   'row',
              backgroundColor: C.bgCard,
              borderRadius:    R.lg,
              marginBottom:    10,
              overflow:        'hidden',
              borderWidth:     1,
              borderColor:     C.border,
            }}
          >
            <Image
              source={{
                uri: item.media?.[0]?.url ||
                     item.images?.[0]
              }}
              style={{
                width:           110,
                height:          110,
                backgroundColor: C.bgSection,
              }}
              resizeMode="cover"
            />
            <View style={{
              flex:           1,
              padding:        12,
              justifyContent: 'center',
            }}>
              <Text
                style={{
                  color:      C.text,
                  fontWeight: '600',
                  fontSize:   14,
                }}
                numberOfLines={2}
              >
                {item.title || item.name}
              </Text>
              <Text style={{
                color:      C.brand,
                fontWeight: '800',
                fontSize:   16,
                marginTop:  6,
              }}>
                {item.price
                  ? item.price.toLocaleString()+'₮'
                  : 'Үнэ тохиролцоно'
                }
              </Text>
              <View style={{
                flexDirection: 'row',
                gap:           10,
                marginTop:     6,
              }}>
                {item.district && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems:    'center',
                    gap: 3,
                  }}>
                    <Ionicons
                      name="location"
                      size={11}
                      color={C.textMuted}
                    />
                    <Text style={{
                      color:    C.textMuted,
                      fontSize: 11,
                    }}>
                      {item.district}
                    </Text>
                  </View>
                )}
                <Text style={{
                  color:    C.textMuted,
                  fontSize: 11,
                }}>
                  {new Date(item.createdAt)
                    .toLocaleDateString('mn-MN')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            marginTop:  80,
          }}>
            <Ionicons
              name="list-outline"
              size={64}
              color={C.border}
            />
            <Text style={{
              color:     C.textMuted,
              marginTop: 12,
              fontSize:  16,
            }}>
              Зар байхгүй байна
            </Text>
            <Text style={{
              color:    C.textMuted,
              fontSize: 13,
              marginTop: 6,
            }}>
              Эхний зараа нэмээрэй!
            </Text>
          </View>
        }
      />
    </View>
  )
}
