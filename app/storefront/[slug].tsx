import React, { useState } from 'react'
import {
  View, Text, FlatList,
  TouchableOpacity, Image,
  ScrollView, RefreshControl,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery }   from '@tanstack/react-query'
import { Ionicons }   from '@expo/vector-icons'
import { get }        from '../../src/services/api'
import { C, R, F, S } from '../../src/shared/design'
import { ProductCardSkeleton } from '../../src/shared/ui/Skeleton'

export default function StorefrontScreen() {
  const { slug }      = useLocalSearchParams()
  const [tab, setTab] = useState<'products' | 'about'>('products')

  const { data: entity } = useQuery({
    queryKey: ['entity', slug],
    queryFn:  () => get(`/entities/${slug}`),
  })

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['storefront-products', slug],
    queryFn:  () => get(`/products?entitySlug=${slug}&limit=20`),
    enabled:  !!slug,
  })

  const e    = entity as any
  const prds = (products as any)?.products || []

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Header */}
      <View style={{
        paddingTop: 48, paddingHorizontal: 16, paddingBottom: 0,
        backgroundColor: C.bgCard,
        borderBottomWidth: 1, borderBottomColor: C.border,
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          gap: 12, marginBottom: 16,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>

          {e?.logoUrl ? (
            <Image
              source={{ uri: e.logoUrl }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : (
            <View style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: C.primary,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: C.white, fontSize: 18, fontWeight: '700' }}>
                {e?.name?.[0] || 'S'}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ ...F.h3, color: C.text }}>
              {e?.name || '...'}
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              gap: 4, marginTop: 2,
            }}>
              <Ionicons name="star" size={12} color="#F9A825" />
              <Text style={{ color: C.textMuted, fontSize: 12 }}>
                {e?.rating?.toFixed(1) || '5.0'} · {prds.length} бараа
              </Text>
            </View>
          </View>

          <TouchableOpacity style={{
            backgroundColor: C.bgSection, borderRadius: R.full,
            padding: 8, borderWidth: 1, borderColor: C.border,
          }}>
            <Ionicons name="share-social-outline" size={20} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row' }}>
          {([
            { key: 'products', label: 'Бараа' },
            { key: 'about',    label: 'Тухай' },
          ] as const).map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1, paddingVertical: 12, alignItems: 'center',
                borderBottomWidth: tab === t.key ? 2 : 0,
                borderBottomColor: C.brand,
              }}
            >
              <Text style={{
                color: tab === t.key ? C.brand : C.textMuted,
                fontWeight: tab === t.key ? '700' : '400', fontSize: 14,
              }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'products' ? (
        isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
            {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
          </View>
        ) : (
          <FlatList
            data={prds}
            numColumns={2}
            keyExtractor={p => p.id}
            contentContainerStyle={{ padding: 8, paddingBottom: 80 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.brand} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/product/${item.id}`)}
                style={{
                  flex: 1, margin: 6, backgroundColor: C.bgCard,
                  borderRadius: R.lg, overflow: 'hidden',
                  borderWidth: 1, borderColor: C.border, ...S.card,
                }}
              >
                <Image
                  source={{ uri: item.media?.[0]?.url }}
                  style={{
                    width: '100%', aspectRatio: 1,
                    backgroundColor: C.bgSection,
                  }}
                  resizeMode="cover"
                />
                <View style={{ padding: 10 }}>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: '500' }}
                    numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={{
                    color: C.brand, fontWeight: '800', fontSize: 14, marginTop: 6,
                  }}>
                    {item.price?.toLocaleString()}₮
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 80 }}>
                <Ionicons name="cube-outline" size={64} color={C.border} />
                <Text style={{ color: C.textMuted, marginTop: 16 }}>
                  Бараа байхгүй байна
                </Text>
              </View>
            }
          />
        )
      ) : (
        <ScrollView style={{ padding: 20 }}>
          <View style={{
            backgroundColor: C.bgCard, borderRadius: R.xl,
            padding: 20, borderWidth: 1, borderColor: C.border, gap: 12,
          }}>
            {e?.description && (
              <Text style={{ color: C.textSub, lineHeight: 22, fontSize: 14 }}>
                {e.description}
              </Text>
            )}
            {[
              { icon: 'location', label: e?.address },
              { icon: 'call',     label: e?.phone },
              { icon: 'mail',     label: e?.email },
              { icon: 'time',     label: e?.workingHours || '09:00 - 21:00' },
            ].filter(i => i.label).map((info, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
              }}>
                <Ionicons name={info.icon as any} size={18} color={C.textMuted} />
                <Text style={{ color: C.textSub, fontSize: 14 }}>
                  {info.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
