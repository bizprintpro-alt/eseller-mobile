import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export default function Shops() {
  const [search, setSearch] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['shops', search],
    queryFn: async ({ pageParam = 1 }) =>
      unwrap<any>(await get(`/entities?type=STORE&page=${pageParam}&q=${encodeURIComponent(search)}`)),
    getNextPageParam: (last: any) => (last?.hasMore ? (last.page ?? 1) + 1 : undefined),
    initialPageParam: 1,
    retry: false,
  });

  const shops: any[] = data?.pages.flatMap((p: any) => p?.items ?? []) ?? [];

  return (
    <>
      <Stack.Screen options={{ title: 'Дэлгүүрүүд', headerBackTitle: '' }} />
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
        <View
          style={{
            margin: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1E1E1E',
            borderRadius: 12,
            paddingHorizontal: 14,
            gap: 8,
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,.08)',
          }}
        >
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.3)' }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Дэлгүүр хайх..."
            placeholderTextColor="rgba(255,255,255,.25)"
            style={{ flex: 1, fontSize: 14, color: '#fff', paddingVertical: 12 }}
          />
        </View>

        {isLoading && <ActivityIndicator color="#4F46E5" style={{ marginTop: 40 }} />}

        <FlatList
          data={shops}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10 }}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/storefront/${item.slug}` as any)}
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,.07)',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#2A2A2A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.emoji ?? '🏪'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>{item.name}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>
                  ⭐ {item.rating ?? '—'} · {item.productCount ?? 0} бараа
                </Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,.2)', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color="#4F46E5" style={{ margin: 16 }} /> : null
          }
        />
      </View>
    </>
  );
}
