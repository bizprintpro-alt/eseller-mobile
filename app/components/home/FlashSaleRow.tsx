import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { get } from '../../../src/services/api';
import { C, R } from '../../../src/shared/design';

interface FlashItem {
  id: string;
  name: string;
  images?: string[];
  salePrice?: number;
  originalPrice?: number;
  price?: number;
  discountPct?: number;
}

function useCountdown(endsAt?: string | null) {
  const [label, setLabel] = useState<string>('');
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel('Дууссан');
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setLabel(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return label;
}

export function FlashSaleRow() {
  // Backend /flash-sales route байхгүй — /search?flashSale=true ашиглана
  const { data } = useQuery({
    queryKey: ['flash-sales-home'],
    queryFn: () => get('/search', { flashSale: true, limit: 8 }),
    refetchInterval: 60_000,
    retry: false,
  });

  const body: any = (data as any)?.data ?? data;
  const items: FlashItem[] =
    body?.items ?? body?.products ?? (Array.isArray(body) ? body : []);
  const endsAt: string | undefined = body?.endsAt;
  const timeLeft = useCountdown(endsAt);

  if (!items?.length) return null;

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
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#EF4444' }}>
            ⚡ Flash Sale
          </Text>
          {!!timeLeft && (
            <View
              style={{
                backgroundColor: '#EF444422',
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderWidth: 0.5,
                borderColor: '#EF444455',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#EF4444' }}>
                {timeLeft}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/(customer)/flash-sale' as never)}>
          <Text style={{ fontSize: 12, color: C.brand, fontWeight: '600' }}>Бүгд →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
      >
        {items.slice(0, 8).map((item) => {
          const sale = item.salePrice ?? item.price ?? 0;
          const original = item.originalPrice ?? 0;
          const pct =
            item.discountPct ??
            (original > 0 && sale > 0 ? Math.round((1 - sale / original) * 100) : 0);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/product/${item.id}` as never)}
              style={{
                width: 120,
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
                  backgroundColor: C.bgSection,
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
                  <Ionicons name="flash" size={28} color="#EF4444" />
                )}
                {pct > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 5,
                      left: 5,
                      backgroundColor: '#EF4444',
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>
                      -{pct}%
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ padding: 8 }}>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}
                >
                  {item.name}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#EF4444' }}>
                  {sale.toLocaleString()}₮
                </Text>
                {original > sale && (
                  <Text
                    style={{
                      fontSize: 9,
                      color: C.textMuted,
                      textDecorationLine: 'line-through',
                    }}
                  >
                    {original.toLocaleString()}₮
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
