import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { HerderAPI, HomeRowSkeleton } from '../../../src/features/herder';
import { useMalchnaasEnabled } from '../../../src/config/remoteFlags';
import { H } from './tokens';
import { SectionHeader } from './SectionHeader';

export function HerderRow() {
  const malchnaasEnabled = useMalchnaasEnabled();
  const { data, isLoading } = useQuery({
    queryKey: ['herder-home'],
    queryFn:  () => HerderAPI.list({ limit: 6 }),
    staleTime: 120_000,
    retry:     false,
    enabled:   malchnaasEnabled,
  });

  if (!malchnaasEnabled) return null;

  const products = data?.products ?? [];

  if (!isLoading && !products.length) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <SectionHeader
        title="Малчны булан"
        icon="🐄"
        badge="Шинэ"
        badgeBg="#064E3B"
        badgeColor="#6EE7B7"
        onMore={() => router.push('/(customer)/herder' as never)}
        moreColor="#6EE7B7"
      />
      {isLoading ? (
        <HomeRowSkeleton count={4} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: H.mx, gap: H.gap2 }}
        >
          {products.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/(customer)/herder-product/${item.id}` as never)}
              activeOpacity={0.85}
              style={{
                width: 134,
                backgroundColor: H.card,
                borderRadius: H.cardRadius,
                overflow: 'hidden',
                borderWidth: 0.5,
                borderColor: H.cardBorder,
                ...H.shadow,
              }}
            >
              <View
                style={{
                  height: 88,
                  backgroundColor: '#F0FDF4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.images?.[0] ? (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ fontSize: 34 }}>🥩</Text>
                )}
              </View>
              <View style={{ padding: 10 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: H.textPrimary,
                    marginBottom: 3,
                  }}
                >
                  {item.name}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#065F46' }}>
                  {(item.salePrice ?? item.price).toLocaleString()}₮
                </Text>
                {item.herder?.provinceName && (
                  <Text style={{ fontSize: 9, color: H.textHint, marginTop: 2 }}>
                    📍 {item.herder.provinceName}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
