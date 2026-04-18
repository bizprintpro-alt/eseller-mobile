import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { get } from '../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export default function Compare() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const idList = (ids ?? '').split(',').filter(Boolean).slice(0, 2);

  const { data, isLoading } = useQuery({
    queryKey: ['compare', ids],
    queryFn: async () => unwrap<any>(await get(`/search?ids=${ids}`)),
    enabled: idList.length > 0,
    retry: false,
  });

  const products: any[] = data?.items ?? [];

  const FIELDS = [
    { key: 'price', label: 'Үнэ', format: (v: any) => `${v?.toLocaleString?.() ?? '—'}₮` },
    { key: 'rating', label: 'Үнэлгээ', format: (v: any) => `⭐ ${v ?? '—'}` },
    { key: 'category', label: 'Ангилал', format: (v: any) => v ?? '—' },
    { key: 'shop', label: 'Дэлгүүр', format: (v: any) => v ?? '—' },
    { key: 'inStock', label: 'Нөөц', format: (v: any) => (v ? '✅ Байна' : '❌ Байхгүй') },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Харьцуулах', headerBackTitle: '' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#121212' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {isLoading && (
          <Text style={{ color: 'rgba(255,255,255,.4)', textAlign: 'center', marginTop: 40 }}>
            Уншиж байна...
          </Text>
        )}

        {products.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ width: 80 }} />
              {products.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => router.push(`/product/${p.id}` as any)}
                  style={{
                    flex: 1,
                    backgroundColor: '#1E1E1E',
                    borderRadius: 14,
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: 0.5,
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  <Text style={{ fontSize: 32, marginBottom: 6 }}>{p.emoji ?? '📦'}</Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: '#fff',
                      textAlign: 'center',
                    }}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {FIELDS.map((field) => {
              const vals = products.map((x: any) => x[field.key]).filter(Boolean);
              const best =
                field.key === 'price'
                  ? Math.min(...(vals as number[]))
                  : field.key === 'rating'
                    ? Math.max(...(vals as number[]))
                    : null;
              return (
                <View key={field.key} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                  <View
                    style={{
                      width: 80,
                      justifyContent: 'center',
                      backgroundColor: '#1A1A1A',
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: '600' }}>
                      {field.label}
                    </Text>
                  </View>
                  {products.map((p: any) => {
                    const isBest = best !== null && p[field.key] === best;
                    return (
                      <View
                        key={p.id}
                        style={{
                          flex: 1,
                          backgroundColor: isBest ? '#14532D' : '#1E1E1E',
                          borderRadius: 10,
                          padding: 10,
                          borderWidth: isBest ? 1 : 0.5,
                          borderColor: isBest ? '#16A34A' : 'rgba(255,255,255,.06)',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: isBest ? '#86EFAC' : '#fff',
                          }}
                        >
                          {field.format(p[field.key])}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <View style={{ width: 80 }} />
              {products.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => router.push(`/product/${p.id}` as any)}
                  style={{
                    flex: 1,
                    backgroundColor: '#4F46E5',
                    borderRadius: 10,
                    padding: 11,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Авах →</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {!isLoading && products.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚖️</Text>
            <Text style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
              Харьцуулах бараа сонгоно уу
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
