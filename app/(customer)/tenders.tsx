import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export default function Tenders() {
  const [search, setSearch] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['tenders', search],
    queryFn: async ({ pageParam = 1 }) =>
      unwrap<any>(await get(`/tenders?page=${pageParam}&q=${encodeURIComponent(search)}`)),
    getNextPageParam: (last: any) => (last?.hasMore ? (last.page ?? 1) + 1 : undefined),
    initialPageParam: 1,
    retry: false,
  });

  const tenders: any[] = data?.pages.flatMap((p: any) => p?.items ?? []) ?? [];

  return (
    <>
      <Stack.Screen options={{ title: 'Тендер', headerBackTitle: '' }} />
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
            placeholder="Тендер хайх..."
            placeholderTextColor="rgba(255,255,255,.25)"
            style={{ flex: 1, fontSize: 14, color: '#fff', paddingVertical: 12 }}
          />
        </View>

        {isLoading && <ActivityIndicator color="#4F46E5" style={{ marginTop: 40 }} />}

        <FlatList
          data={tenders}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10 }}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => item.url && Linking.openURL(item.url)}
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 14,
                padding: 14,
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,.07)',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: '#1E3A5F',
                    borderRadius: 7,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: '#93C5FD', fontSize: 9, fontWeight: '700' }}>
                    {item.category ?? 'Тендер'}
                  </Text>
                </View>
                {item.deadline && (
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
                    ⏰ {item.deadline}
                  </Text>
                )}
              </View>

              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 5 }}>
                {item.title}
              </Text>

              {item.budget != null && (
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#4F46E5' }}>
                  {Number(item.budget).toLocaleString()}₮
                </Text>
              )}

              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>
                {item.organization ?? 'Байгууллага'}
              </Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color="#4F46E5" style={{ margin: 16 }} /> : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                <Text style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
                  Тендер олдсонгүй
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </>
  );
}
