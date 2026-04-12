import { useState, useEffect } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get } from '../src/services/api'
import { C, R, S } from '../src/shared/design'

export default function SearchScreen() {
  const [q, setQ] = useState('')
  const [dq, setDq] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 400)
    return () => clearTimeout(t)
  }, [q])

  const { data, isLoading } = useQuery({
    queryKey: ['search', dq],
    queryFn: () => get(`/search?q=${dq}&limit=20`),
    enabled: dq.length > 1,
  })

  const products = (data as any)?.products || []

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Search bar */}
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: R.xl, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border }}>
          <Ionicons name="search" size={18} color={C.textMuted} />
          <TextInput placeholder="Бараа, дэлгүүр хайх..." placeholderTextColor={C.textMuted} value={q} onChangeText={setQ}
            autoFocus style={{ flex: 1, color: C.text, padding: 12, fontSize: 15 }} />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ('')}>
              <Ionicons name="close-circle" size={18} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: C.brand, fontWeight: '600' }}>Болих</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={p => p.id || p._id}
          contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
          renderItem={({ item: p }) => (
            <TouchableOpacity onPress={() => router.push(`/product/${p.id || p._id}` as any)}
              style={{ flex: 1, margin: 6, backgroundColor: C.bgCard, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...S.card }}>
              <Image source={{ uri: p.images?.[0] || p.media?.[0]?.url }}
                style={{ width: '100%', aspectRatio: 1, backgroundColor: C.bgSection }} resizeMode="cover" />
              <View style={{ padding: 10 }}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: '500' }} numberOfLines={2}>{p.name}</Text>
                <Text style={{ color: C.brand, fontWeight: '800', fontSize: 15, marginTop: 4 }}>{p.price?.toLocaleString()}₮</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48 }}>{dq.length > 1 ? '😕' : '🔍'}</Text>
              <Text style={{ color: C.textSub, marginTop: 12 }}>
                {dq.length > 1 ? `"${dq}" олдсонгүй` : 'Хайх үгээ оруулна уу'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
