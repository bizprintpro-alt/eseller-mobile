import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LoyaltyAPI } from '../../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

const TIER_NEXT: Record<string, { next: string; threshold: number }> = {
  BRONZE:   { next: 'Silver',    threshold: 5_000  },
  SILVER:   { next: 'Gold',      threshold: 20_000 },
  GOLD:     { next: 'Platinum',  threshold: 50_000 },
  PLATINUM: { next: '',          threshold: 0      },
};

export function GoldCta() {
  const { data } = useQuery({
    queryKey: ['loyalty-cta'],
    queryFn: async () => {
      const res = await LoyaltyAPI.get();
      return unwrap<{
        balance?: number;
        lifetimeEarned?: number;
        tier?: string;
      }>(res);
    },
    retry: false,
  });

  const tier = (data?.tier ?? 'BRONZE').toUpperCase();
  // Already at top tier — hide
  if (tier === 'PLATINUM' || tier === 'DIAMOND') return null;

  const lifetime = data?.lifetimeEarned ?? 0;
  const balance = data?.balance ?? 0;
  const info = TIER_NEXT[tier] ?? TIER_NEXT.BRONZE;
  const progress = Math.max(0, Math.min(1, lifetime / info.threshold));
  const needed = Math.max(0, info.threshold - lifetime);

  return (
    <TouchableOpacity
      onPress={() => router.push('/(customer)/tier-details' as never)}
      activeOpacity={0.85}
      style={{
        marginHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#1A1100',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F59E0B55',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 18 }}>⭐</Text>
          <Text style={{ fontSize: 13, fontWeight: '900', color: '#F59E0B' }}>
            {info.next} болох
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: '#FBBF24', fontWeight: '700' }}>
          {balance.toLocaleString()} оноо
        </Text>
      </View>

      <View
        style={{
          height: 6,
          backgroundColor: '#78350F',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: 6,
            width: `${progress * 100}%`,
            backgroundColor: '#F59E0B',
            borderRadius: 3,
          }}
        />
      </View>

      <Text
        style={{
          fontSize: 10,
          color: '#FCD34D',
          marginTop: 6,
          textAlign: 'right',
          fontWeight: '600',
        }}
      >
        {needed.toLocaleString()} оноо дутуу
      </Text>
    </TouchableOpacity>
  );
}
