import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { LoyaltyAPI } from '../../../src/services/api';
import { H } from './tokens';

const TIER_THRESHOLD: Record<string, number> = {
  BRONZE: 5_000,
  SILVER: 20_000,
  GOLD: 50_000,
};

const NEXT_TIER: Record<string, string> = {
  BRONZE: 'Silver',
  SILVER: 'Gold',
  GOLD: 'Platinum',
};

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export function GoldCta() {
  const { data } = useQuery({
    queryKey: ['loyalty-home'],
    queryFn: async () => {
      const res = await LoyaltyAPI.get();
      return unwrap<{
        tier?: string;
        balance?: number;
        lifetimeEarned?: number;
      }>(res);
    },
    staleTime: 120_000,
    retry: false,
  });

  const tier = (data?.tier ?? 'BRONZE').toUpperCase();
  if (tier === 'PLATINUM' || tier === 'DIAMOND') return null;

  const threshold = TIER_THRESHOLD[tier] ?? 5_000;
  const lifetime = data?.lifetimeEarned ?? 0;
  const balance = data?.balance ?? 0;
  const pct = Math.max(0, Math.min(1, lifetime / threshold));
  const needed = Math.max(0, threshold - lifetime);
  const nextTier = NEXT_TIER[tier] ?? 'Silver';

  return (
    <TouchableOpacity
      onPress={() => router.push('/(customer)/tier-details' as never)}
      activeOpacity={0.85}
      style={{
        marginHorizontal: H.mx,
        marginBottom: 16,
        backgroundColor: '#1A1100',
        borderRadius: H.cardRadius,
        padding: 16,
        borderWidth: 0.5,
        borderColor: '#78350F',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text style={{ fontSize: 20 }}>⭐</Text>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#FDE68A' }}>
            {nextTier} болох
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#FCA5A5' }}>
          {balance.toLocaleString()} оноо
        </Text>
      </View>

      <View
        style={{
          height: 6,
          backgroundColor: '#451A03',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: 6,
            width: `${Math.round(pct * 100)}%`,
            backgroundColor: '#F59E0B',
            borderRadius: 3,
          }}
        />
      </View>

      <Text
        style={{
          fontSize: 10,
          color: '#D97706',
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
