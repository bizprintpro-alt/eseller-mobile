import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import {
  HERDER_BRAND as BRAND,
  PROVINCES,
  HerderAPI,
  ProductGridSkeleton,
  type HerderProduct,
} from '../../../src/features/herder';
import { useMalchnaasEnabled } from '../../../src/config/remoteFlags';

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function HerderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const herderId = String(id ?? '');
  const malchnaasEnabled = useMalchnaasEnabled();

  const profileQ = useQuery({
    queryKey: ['herder-profile', herderId],
    queryFn:  () => HerderAPI.profile(herderId),
    enabled:  !!herderId && malchnaasEnabled,
  });

  const listingsQ = useQuery({
    queryKey: ['herder-profile-products', herderId],
    queryFn:  () => HerderAPI.list({ herderId, limit: 30 }),
    enabled:  !!herderId && malchnaasEnabled,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([profileQ.refetch(), listingsQ.refetch()]);
    setRefreshing(false);
  }, [profileQ, listingsQ]);

  if (!malchnaasEnabled) {
    return (
      <View style={s.center}>
        <Ionicons name="leaf-outline" size={48} color="#ccc" />
        <Text style={s.muted}>Малчнаас шууд идэвхгүй байна.</Text>
      </View>
    );
  }

  if (profileQ.isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  const profile = profileQ.data;
  const products = listingsQ.data?.products ?? [];
  const province = PROVINCES.find((p) => p.code === profile?.province);

  if (!profile) {
    return (
      <View style={s.center}>
        <Ionicons name="person-outline" size={48} color="#ccc" />
        <Text style={s.muted}>Малчны профайл олдсонгүй.</Text>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => router.back()}>
          <Text style={s.secondaryBtnText}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const head = profile.livestock
    ? Object.values(profile.livestock).reduce((n, v) => n + (v || 0), 0)
    : null;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />}
    >
      {/* Cover + back */}
      <View style={s.cover}>
        {profile.coverImage ? (
          <Image source={{ uri: profile.coverImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={s.coverFallback} />
        )}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Header card */}
      <View style={s.headerCard}>
        <View style={s.avatarWrap}>
          {profile.avatar
            ? <Image source={{ uri: profile.avatar }} style={s.avatar} />
            : <View style={[s.avatar, s.avatarFallback]}><Ionicons name="person" size={32} color="#fff" /></View>}
          {profile.isVerified && (
            <View style={s.verifiedDot}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          )}
        </View>

        <Text style={s.name}>{profile.herderName}</Text>

        <View style={s.metaRow}>
          <Ionicons name="location-outline" size={14} color="#78716c" />
          <Text style={s.metaText}>
            {profile.provinceName}{profile.district ? ` · ${profile.district}` : ''}
          </Text>
        </View>

        {typeof profile.rating === 'number' && (
          <View style={s.metaRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={s.metaText}>
              {profile.rating.toFixed(1)}
              {profile.orderCount ? ` · ${profile.orderCount} захиалга` : ''}
            </Text>
          </View>
        )}

        {profile.bio && <Text style={s.bio}>{profile.bio}</Text>}
      </View>

      {/* Stats strip */}
      {(profile.stats || head !== null || province) && (
        <View style={s.statsRow}>
          {head !== null && (
            <StatPill label="Мал" value={`${head}`} />
          )}
          {province && (
            <StatPill label="Хүргэлт" value={`${province.days}ө`} />
          )}
          {profile.stats?.deliverySuccessRate !== undefined && (
            <StatPill label="Амжилт" value={`${Math.round(profile.stats.deliverySuccessRate * 100)}%`} />
          )}
          {profile.stats?.productCount !== undefined && (
            <StatPill label="Бараа" value={`${profile.stats.productCount}`} />
          )}
        </View>
      )}

      {/* Products */}
      <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
        <Text style={s.sectionTitle}>Бүтээгдэхүүн ({products.length})</Text>

        {listingsQ.isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="leaf-outline" size={36} color="#ccc" />
            <Text style={s.muted}>Одоогоор бүтээгдэхүүн байхгүй</Text>
          </View>
        ) : (
          <View style={s.grid}>
            {products.map((p) => <ProductTile key={p.id} p={p} />)}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillValue}>{value}</Text>
      <Text style={s.pillLabel}>{label}</Text>
    </View>
  );
}

function ProductTile({ p }: { p: HerderProduct }) {
  const price = p.salePrice ?? p.price;
  return (
    <TouchableOpacity
      style={s.tile}
      onPress={() => router.push(`/(customer)/herder-product/${p.id}` as never)}
      activeOpacity={0.85}
    >
      <View style={s.tileImg}>
        {p.images?.[0]
          ? <Image source={{ uri: p.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          : <View style={s.tileImgFallback}><Ionicons name="leaf-outline" size={28} color="#ccc" /></View>}
      </View>
      <View style={{ padding: 10 }}>
        <Text style={s.tileName} numberOfLines={2}>{p.name}</Text>
        <Text style={s.tilePrice}>{fmt(price)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 24 },
  muted: { fontSize: 14, color: '#78716c' },

  cover: { height: 140, backgroundColor: '#e7e5e4', position: 'relative' },
  coverFallback: { flex: 1, backgroundColor: BRAND, opacity: 0.15 },
  backBtn: { position: 'absolute', top: 44, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },

  headerCard: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#f5f5f4' },
  avatarWrap: { marginTop: -48, marginBottom: 10 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: '#fff', backgroundColor: '#e7e5e4' },
  avatarFallback: { backgroundColor: BRAND, justifyContent: 'center', alignItems: 'center' },
  verifiedDot: { position: 'absolute', right: 2, bottom: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: BRAND, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  metaText: { fontSize: 13, color: '#44403c' },
  bio: { fontSize: 14, color: '#57534e', lineHeight: 20, marginTop: 10 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14 },
  pill: { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  pillValue: { fontSize: 16, fontWeight: '800', color: BRAND },
  pillLabel: { fontSize: 11, color: '#065F46', marginTop: 2 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#292524', marginBottom: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%' as any, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e7e5e4', overflow: 'hidden' },
  tileImg: { height: 120, backgroundColor: '#f5f5f4' },
  tileImgFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tileName: { fontSize: 13, fontWeight: '600', color: '#292524', marginBottom: 4, minHeight: 34 },
  tilePrice: { fontSize: 14, fontWeight: '800', color: BRAND },

  secondaryBtn: { borderWidth: 1, borderColor: BRAND, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  secondaryBtnText: { color: BRAND, fontWeight: '700' },
});
