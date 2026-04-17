import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, ActivityIndicator, Alert,
} from 'react-native'
import { Stack } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get, post } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

const SOURCES = [
  { id: 'aliexpress', label: 'AliExpress', color: '#FF6600' },
  { id: 'cj',        label: 'CJ Drop',    color: '#0066CC' },
]

const MARGINS = [10, 20, 30, 50]

interface DropProduct {
  supplierId:    string
  supplierName:  string
  name:          string
  supplierPrice: number
  supplierCurrency: string
  images:        string[]
  supplierUrl:   string
  supplierStock: number
  rating:        number
  orders:        number
  shipping:      string
}

export default function DropshipScreen() {
  const [query,    setQuery]    = useState('')
  const [search,   setSearch]   = useState('')
  const [source,   setSource]   = useState('aliexpress')
  const [margin,   setMargin]   = useState(20)
  const [importing, setImporting] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ products: DropProduct[] }>({
    queryKey:  ['dropship', search, source],
    queryFn:   () => get(`/dropship/search?q=${encodeURIComponent(search)}&source=${source}`) as any,
    enabled:   search.length > 0,
    retry:     false,
    staleTime: 60_000,
  })

  const products = (data as any)?.products ?? []

  function sellPrice(supplierPrice: number) {
    const usdToMnt = 3450
    const mnt = supplierPrice * usdToMnt
    return Math.ceil(mnt * (1 + margin / 100))
  }

  async function importProduct(product: DropProduct) {
    setImporting(product.supplierId)
    try {
      await post('/dropship/import', {
        supplierId:    product.supplierId,
        supplierName:  product.supplierName,
        name:          product.name,
        supplierPrice: product.supplierPrice,
        sellPrice:     sellPrice(product.supplierPrice),
        images:        product.images,
        supplierUrl:   product.supplierUrl,
      })
      Alert.alert('Амжилттай', `"${product.name.slice(0, 30)}..." таны дэлгүүрт нэмэгдлээ.`)
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Import амжилтгүй')
    } finally {
      setImporting(null)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Dropship', headerBackTitle: '' }} />
      <View style={{ flex: 1, backgroundColor: C.bg }}>

        {/* Search */}
        <View style={{ padding: 12, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{
              flex: 1, flexDirection: 'row', alignItems: 'center',
              backgroundColor: C.bgCard, borderRadius: R.lg,
              paddingHorizontal: 12, height: 46, gap: 8,
              borderWidth: 0.5, borderColor: C.border,
            }}>
              <Ionicons name="search" size={16} color={C.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => setSearch(query)}
                placeholder="Бараа хайх..."
                placeholderTextColor={C.textMuted}
                style={{ flex: 1, color: C.text, fontSize: 14 }}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              onPress={() => setSearch(query)}
              style={{
                backgroundColor: '#16A34A', borderRadius: R.lg,
                width: 46, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Source switcher */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SOURCES.map(s => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSource(s.id)}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: R.md,
                  backgroundColor: source === s.id ? s.color : C.bgCard,
                  alignItems: 'center', borderWidth: 0.5,
                  borderColor: source === s.id ? s.color : C.border,
                }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: source === s.id ? '#fff' : C.textSub,
                }}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Margin */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 12, color: C.textSub }}>Ашиг %:</Text>
            {MARGINS.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setMargin(m)}
                style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
                  backgroundColor: margin === m ? '#16A34A' : C.bgCard,
                  borderWidth: 0.5, borderColor: margin === m ? '#16A34A' : C.border,
                }}
              >
                <Text style={{
                  fontSize: 11, fontWeight: '700',
                  color: margin === m ? '#fff' : C.textSub,
                }}>
                  {m}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        {isLoading ? (
          <ActivityIndicator color="#16A34A" style={{ marginTop: 40 }} />
        ) : products.length === 0 && search ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ color: C.textMuted, marginTop: 12 }}>Бараа олдсонгүй</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>🌏</Text>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '700', marginTop: 12 }}>
              Dropship
            </Text>
            <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 }}>
              AliExpress болон CJ-ээс бараа хайж, дэлгүүртээ нэмнэ үү
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={p => p.supplierId}
            numColumns={2}
            contentContainerStyle={{ padding: 10, gap: 10 }}
            columnWrapperStyle={{ gap: 10 }}
            renderItem={({ item: p }) => (
              <View style={{
                flex: 1, backgroundColor: C.bgCard, borderRadius: R.lg,
                overflow: 'hidden', borderWidth: 0.5, borderColor: C.border,
              }}>
                {/* Image */}
                <View style={{ height: 140, backgroundColor: C.bgSection }}>
                  {p.images[0] ? (
                    <Image
                      source={{ uri: p.images[0] }}
                      style={{ width: '100%', height: 140 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 36 }}>📦</Text>
                    </View>
                  )}
                  <View style={{
                    position: 'absolute', top: 6, left: 6,
                    backgroundColor: p.supplierName === 'aliexpress' ? '#FF6600' : '#0066CC',
                    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>
                      {p.supplierName.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={{ padding: 8, gap: 4 }}>
                  <Text numberOfLines={2} style={{
                    fontSize: 11, color: C.text, fontWeight: '500', lineHeight: 15,
                  }}>
                    {p.name}
                  </Text>

                  <View style={{ gap: 2 }}>
                    <Text style={{ fontSize: 10, color: C.textMuted }}>
                      Нийлүүлэгч: ${p.supplierPrice.toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#16A34A' }}>
                      {sellPrice(p.supplierPrice).toLocaleString()}₮
                    </Text>
                  </View>

                  {(p.rating > 0 || p.orders > 0) && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {p.rating > 0 && (
                        <Text style={{ fontSize: 9, color: C.textMuted }}>
                          ⭐ {p.rating.toFixed(1)}
                        </Text>
                      )}
                      {p.orders > 0 && (
                        <Text style={{ fontSize: 9, color: C.textMuted }}>
                          📦 {p.orders}
                        </Text>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => importProduct(p)}
                    disabled={importing === p.supplierId}
                    style={{
                      backgroundColor: importing === p.supplierId ? C.border : '#16A34A',
                      borderRadius: 8, paddingVertical: 7,
                      alignItems: 'center', marginTop: 4,
                    }}
                  >
                    {importing === p.supplierId ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                        + Дэлгүүрт нэмэх
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </>
  )
}
