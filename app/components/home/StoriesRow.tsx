import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { get } from '../../../src/services/api';
import { H } from './tokens';

interface Story {
  id: string;
  shopName?: string;
  shopLogo?: string | null;
  thumbnailUrl?: string | null;
  seen?: boolean;
}

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export function StoriesRow() {
  const { data } = useQuery({
    queryKey: ['stories-home'],
    queryFn: async () => {
      const res = await get('/stories');
      return unwrap<{ stories?: Story[] } | Story[]>(res);
    },
    staleTime: 30_000,
    retry: false,
  });

  const stories: Story[] = Array.isArray(data)
    ? data
    : (data as any)?.stories ?? [];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: H.mx,
        gap: 14,
        paddingVertical: 4,
      }}
      style={{ marginBottom: 4 }}
    >
      {/* Add */}
      <TouchableOpacity
        onPress={() => router.push('/feed/create' as never)}
        style={{ alignItems: 'center', gap: 5, width: 64 }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#1B1B3A',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: H.primary,
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ fontSize: 22, color: H.primary, fontWeight: '800' }}>+</Text>
        </View>
        <Text
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: '600',
          }}
        >
          Нэмэх
        </Text>
      </TouchableOpacity>

      {stories.map((s) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => router.push(`/feed/${s.id}` as never)}
          style={{ alignItems: 'center', gap: 5, width: 64 }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 2.5,
              borderColor: s.seen ? 'rgba(255,255,255,0.15)' : H.primary,
              padding: 2,
            }}
          >
            <View
              style={{
                flex: 1,
                borderRadius: 26,
                backgroundColor: '#1E1E1E',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {s.thumbnailUrl ? (
                <Image
                  source={{ uri: s.thumbnailUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 22 }}>{s.shopLogo ?? '🏪'}</Text>
              )}
            </View>
          </View>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.55)',
              fontWeight: '600',
              maxWidth: 60,
              textAlign: 'center',
            }}
          >
            {s.shopName ?? 'Дэлгүүр'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
