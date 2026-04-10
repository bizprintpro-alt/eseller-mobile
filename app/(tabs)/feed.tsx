import {
  View, Text, FlatList,
  TouchableOpacity, Image, ScrollView,
  RefreshControl,
} from 'react-native'
import { router }   from 'expo-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get }      from '../../src/services/api'
import { C, R, F, S } from '../../src/shared/design'
import { FeedItemSkeleton } from '../../src/shared/ui/Skeleton'

const FEED_CATS = [
  { slug:'',                  name:'Бүгд',       icon:'grid' },
  { slug:'auto-moto',         name:'Авто',       icon:'car' },
  { slug:'real-estate-feed',  name:'Үл хөдлөх',  icon:'home' },
  { slug:'electronics',       name:'Электроник',  icon:'phone-portrait' },
  { slug:'fashion',           name:'Хувцас',      icon:'shirt' },
  { slug:'services-feed',     name:'Үйлчилгээ',  icon:'construct' },
  { slug:'jobs-feed',         name:'Ажлын зар',   icon:'briefcase' },
  { slug:'furniture',         name:'Тавилга',     icon:'bed' },
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
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Header */}
      <View style={{
        paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text style={{ ...F.h2, color: C.text }}>
          Зарын булан
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={{
            backgroundColor: C.bgSection, borderRadius: R.lg,
            padding: 9, borderWidth: 1, borderColor: C.border,
          }}>
            <Ionicons name="search-outline" size={20} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12, paddingBottom: 10, gap: 6,
          }}
        >
          {FEED_CATS.map(c => {
            const active = category === c.slug
            return (
              <TouchableOpacity
                key={c.slug || 'all'}
                onPress={() => setCategory(c.slug)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 14, paddingVertical: 9,
                  borderRadius: R.full, gap: 6,
                  backgroundColor: active ? C.primary : C.bgSection,
                  borderWidth: 1,
                  borderColor: active ? C.primary : C.border,
                }}
              >
                <Ionicons
                  name={(active ? c.icon : c.icon + '-outline') as any}
                  size={14}
                  color={active ? C.white : C.textSub}
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

      {/* Feed list */}
      {isLoading ? (
        <View style={{ padding: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <FeedItemSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p: any) => p.id}
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={C.brand}
            />
          }
          renderItem={({ item }: any) => (
            <TouchableOpacity
              onPress={() => router.push(`/feed/${item.id}` as any)}
              style={{
                flexDirection: 'row', backgroundColor: C.bgCard,
                borderRadius: R.lg, marginBottom: 10, overflow: 'hidden',
                borderWidth: 1,
                borderColor: item.featured ? C.gold + '40' : C.border,
              }}
            >
              {/* Image */}
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: item.media?.[0]?.url || item.images?.[0] }}
                  style={{
                    width: 110, height: 110, backgroundColor: C.bgSection,
                  }}
                  resizeMode="cover"
                />
                {item.featured && (
                  <View style={{
                    position: 'absolute', top: 4, left: 4,
                    backgroundColor: C.gold, borderRadius: R.xs,
                    paddingHorizontal: 4, paddingVertical: 1,
                    flexDirection: 'row', alignItems: 'center', gap: 2,
                  }}>
                    <Ionicons name="flash" size={8} color={C.black} />
                    <Text style={{ color: C.black, fontSize: 8, fontWeight: '800' }}>
                      ОНЦГОЙ
                    </Text>
                  </View>
                )}
                {item.imageCount > 1 && (
                  <View style={{
                    position: 'absolute', bottom: 4, right: 4,
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: R.sm,
                    paddingHorizontal: 5, paddingVertical: 2,
                    flexDirection: 'row', alignItems: 'center', gap: 2,
                  }}>
                    <Ionicons name="images" size={10} color={C.white} />
                    <Text style={{ color: C.white, fontSize: 9, fontWeight: '600' }}>
                      {item.imageCount}
                    </Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                <Text
                  style={{ color: C.text, fontWeight: '600', fontSize: 14 }}
                  numberOfLines={2}
                >
                  {item.title || item.name}
                </Text>
                <Text style={{
                  color: C.brand, fontWeight: '800', fontSize: 16, marginTop: 5,
                }}>
                  {item.price
                    ? item.price.toLocaleString() + '₮'
                    : 'Үнэ тохиролцоно'
                  }
                </Text>
                <View style={{
                  flexDirection: 'row', gap: 10, marginTop: 5, alignItems: 'center',
                }}>
                  {item.district && (
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 3,
                    }}>
                      <Ionicons name="location-outline" size={11} color={C.textMuted} />
                      <Text style={{ color: C.textMuted, fontSize: 11 }}>
                        {item.district}
                      </Text>
                    </View>
                  )}
                  {item.createdAt && (
                    <Text style={{ color: C.textMuted, fontSize: 11 }}>
                      {timeAgo(item.createdAt)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="megaphone-outline" size={64} color={C.border} />
              <Text style={{ color: C.textMuted, marginTop: 12, fontSize: 16 }}>
                Зар байхгүй байна
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>
                Эхний зараа нэмээрэй!
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/feed/create' as any)}
                style={{
                  backgroundColor: C.brand, borderRadius: R.lg,
                  paddingHorizontal: 24, paddingVertical: 12, marginTop: 20,
                }}
              >
                <Text style={{ color: C.white, fontWeight: '700' }}>
                  Зар нэмэх
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Floating + button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          router.push('/feed/create' as any)
        }}
        style={{
          position: 'absolute', bottom: 90, right: 16,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: C.brand,
          alignItems: 'center', justifyContent: 'center',
          ...S.elevated, shadowColor: C.brand,
        }}
      >
        <Ionicons name="add" size={28} color={C.white} />
      </TouchableOpacity>
    </View>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Саяхан'
  if (mins < 60) return `${mins} мин`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} цаг`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} өдөр`
  return new Date(dateStr).toLocaleDateString('mn-MN')
}
