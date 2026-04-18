import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LiveAPI, type LiveStreamItem } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

/**
 * Horizontal carousel of live streams for the buyer home.
 * Auto-refreshes every 30s on focus. Hidden entirely when there are no LIVE streams.
 */
export function LiveCarousel() {
  const [isFocused, setIsFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const { data, isLoading } = useQuery({
    queryKey: ['live', 'active'],
    queryFn: () => LiveAPI.getActive(),
    refetchInterval: isFocused ? 30_000 : false,
    staleTime: 20_000,
  });

  // Backend wraps as { success, data: [...] } or { success, data: { streams } }.
  // Old stubs may return the array directly — normalize all shapes.
  const raw: any = data ?? {};
  const list: LiveStreamItem[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.streams)
        ? raw.streams
        : Array.isArray(raw?.data?.streams)
          ? raw.data.streams
          : [];

  // Hide section if nothing is live (and not loading)
  if (!isLoading && list.length === 0) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Section header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, marginBottom: 10,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{
            width: 8, height: 8, borderRadius: 4, backgroundColor: '#E74C3C',
          }} />
          <Text style={{ ...F.h3, color: C.text }}>Одоо Live</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(customer)/live' as any)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ color: C.brand, fontSize: 13, fontWeight: '600' }}>
              Бүгдийг харах
            </Text>
            <Ionicons name="chevron-forward" size={14} color={C.brand} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Loading skeleton */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
        >
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: 180,
                height: 160,
                backgroundColor: C.bgSection,
                borderRadius: R.lg,
              }}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
        >
          {list.map((stream) => (
            <LiveCard key={stream.id} stream={stream} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function LiveCard({ stream }: { stream: LiveStreamItem }) {
  const viewerCount = stream.viewerCount ?? 0;
  const productCount = stream.products?.length ?? 0;
  const shopName = stream.shop?.name ?? 'Дэлгүүр';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(customer)/live/${stream.id}` as any)}
      style={{
        width: 180,
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: C.border,
      }}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={{
        height: 100,
        backgroundColor: '#0D0D0D',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {stream.thumbnailUrl ? (
          <Image
            source={{ uri: stream.thumbnailUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 36 }}>📺</Text>
        )}

        {/* LIVE badge */}
        <View style={{
          position: 'absolute', top: 6, left: 6,
          backgroundColor: '#E74C3C',
          borderRadius: 4,
          paddingHorizontal: 6, paddingVertical: 2,
          flexDirection: 'row', alignItems: 'center', gap: 3,
        }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' }} />
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>LIVE</Text>
        </View>

        {/* Viewer count */}
        <View style={{
          position: 'absolute', bottom: 6, right: 6,
          backgroundColor: 'rgba(0,0,0,0.55)',
          borderRadius: 99,
          paddingHorizontal: 6, paddingVertical: 2,
          flexDirection: 'row', alignItems: 'center', gap: 3,
        }}>
          <Ionicons name="eye" size={10} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '600' }}>
            {viewerCount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={{ padding: 10 }}>
        <Text
          style={{ ...F.small, color: C.text, fontWeight: '600' }}
          numberOfLines={1}
        >
          {stream.title}
        </Text>
        <Text
          style={{ ...F.tiny, color: C.textMuted, marginTop: 3 }}
          numberOfLines={1}
        >
          {shopName}
          {productCount > 0 && ` · ${productCount} бараа`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
