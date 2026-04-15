import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../src/services/api';
import { C } from '../../../src/shared/design';

interface Story {
  id: string;
  shopName?: string;
  shopLogo?: string | null;
  thumbnailUrl?: string | null;
  seen?: boolean;
}

export function StoriesRow() {
  const { data } = useQuery({
    queryKey: ['stories-home'],
    queryFn: () => get('/stories'),
    staleTime: 30_000,
    retry: false,
  });

  const body: any = (data as any)?.data ?? data;
  const stories: Story[] = body?.stories ?? (Array.isArray(body) ? body : []);

  if (!stories?.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 14,
        paddingBottom: 4,
      }}
      style={{ marginBottom: 16 }}
    >
      {/* "Нэмэх" товч */}
      <TouchableOpacity
        onPress={() => router.push('/(customer)/create-post' as never)}
        style={{ alignItems: 'center', gap: 4, width: 64 }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: C.bgCard,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: C.brand,
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ fontSize: 22, color: C.brand, fontWeight: '700' }}>+</Text>
        </View>
        <Text
          style={{ fontSize: 9, color: C.textSub, fontWeight: '600' }}
          numberOfLines={1}
        >
          Нэмэх
        </Text>
      </TouchableOpacity>

      {stories.map((s) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => router.push(`/feed/${s.id}` as never)}
          style={{ alignItems: 'center', gap: 4, width: 64 }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 2.5,
              borderColor: s.seen ? C.border : C.brand,
              padding: 2,
            }}
          >
            <View
              style={{
                flex: 1,
                borderRadius: 26,
                backgroundColor: C.bgSection,
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
              fontSize: 9,
              color: C.textSub,
              fontWeight: '500',
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
