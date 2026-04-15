import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../src/services/api';
import { C, R } from '../../../src/shared/design';

interface HerderProduct {
  id: string;
  name: string;
  price?: number;
  images?: string[];
  province?: string;
  district?: string;
}

export function HerderRow() {
  const { data } = useQuery({
    queryKey: ['herder-home'],
    queryFn: () => get('/herder/products', { limit: 5 }),
    staleTime: 120_000,
    retry: false,
  });

  const body: any = (data as any)?.data ?? data;
  const products: HerderProduct[] =
    body?.products ?? (Array.isArray(body) ? body : []);

  if (!products?.length) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#10B981' }}>
            🐄 Малчны булан
          </Text>
          <View
            style={{
              backgroundColor: '#10B98122',
              borderRadius: 5,
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderWidth: 0.5,
              borderColor: '#10B98155',
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: '800', color: '#10B981' }}>
              Шинэ
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/(customer)/herder' as never)}>
          <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '700' }}>
            Бүгд →
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
      >
        {products.slice(0, 5).map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => router.push(`/product/${p.id}` as never)}
            style={{
              width: 140,
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              overflow: 'hidden',
              borderWidth: 0.5,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                height: 90,
                backgroundColor: '#064E3B',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {p.images?.[0] ? (
                <Image
                  source={{ uri: p.images[0] }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 32 }}>🥩</Text>
              )}
            </View>
            <View style={{ padding: 9 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: C.text,
                  marginBottom: 2,
                }}
              >
                {p.name}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#10B981' }}>
                {(p.price ?? 0).toLocaleString()}₮
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  color: C.textMuted,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                📍 {p.province ?? p.district ?? 'Монгол'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
