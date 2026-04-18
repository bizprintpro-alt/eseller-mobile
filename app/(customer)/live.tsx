import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LiveAPI, type LiveStreamItem } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

type LiveTab = 'active' | 'scheduled';

function unwrap<T = unknown>(res: any): T {
  return (res?.data ?? res) as T;
}

function toList(res: any): LiveStreamItem[] {
  const u = unwrap<any>(res);
  if (Array.isArray(u)) return u;
  if (Array.isArray(u?.streams)) return u.streams;
  return [];
}

export default function LiveListScreen() {
  const [tab, setTab] = useState<LiveTab>('active');

  const activeQ = useQuery({
    queryKey: ['live', 'active'],
    queryFn: () => LiveAPI.getActive(),
    refetchInterval: 30_000,
  });

  const scheduledQ = useQuery({
    queryKey: ['live', 'scheduled'],
    queryFn: () => LiveAPI.getScheduled(),
    enabled: tab === 'scheduled',
  });

  const activeList = toList(activeQ.data);
  const scheduledList = toList(scheduledQ.data);
  const list = tab === 'active' ? activeList : scheduledList;
  const loading = tab === 'active' ? activeQ.isLoading : scheduledQ.isLoading;
  const refreshing =
    (tab === 'active' && activeQ.isRefetching) ||
    (tab === 'scheduled' && scheduledQ.isRefetching);

  const onRefresh = () => {
    if (tab === 'active') activeQ.refetch();
    else scheduledQ.refetch();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="videocam" size={22} color={C.white} />
        <Text style={styles.headerTitle}>Live худалдаа</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.headerCount}>
          {activeList.length > 0 && `${activeList.length} идэвхтэй`}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {([
          { key: 'active',    label: 'Одоо Live', badge: activeList.length },
          { key: 'scheduled', label: 'Удахгүй',   badge: scheduledList.length },
        ] as { key: LiveTab; label: string; badge: number }[]).map((t) => {
          const on = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, on && styles.tabActive]}
            >
              <Text style={[styles.tabText, on && styles.tabTextActive]}>
                {t.label}
              </Text>
              {t.badge > 0 && (
                <View style={[styles.badgePill, on && { backgroundColor: C.white }]}>
                  <Text style={[styles.badgePillText, on && { color: C.brand }]}>
                    {t.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.brand} />
        </View>
      ) : list.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="videocam-off-outline" size={48} color={C.textMuted} />
          <Text style={styles.emptyText}>
            {tab === 'active' ? 'Одоогоор live байхгүй' : 'Удахгүй live байхгүй'}
          </Text>
          <Text style={styles.emptySubText}>
            {tab === 'active' ? 'Удахгүй эхлэнэ!' : 'Дараа дахин шалгаарай'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} />
          }
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <LiveCard stream={item} mode={tab} />}
        />
      )}
    </View>
  );
}

function LiveCard({ stream, mode }: { stream: LiveStreamItem; mode: LiveTab }) {
  const viewerCount = stream.viewerCount ?? 0;
  const productCount = (stream.products?.length ?? 0) as number;
  const shopName = stream.shop?.name ?? 'Дэлгүүр';
  const scheduledAt = (stream as any).scheduledAt as string | undefined;
  const isActive = mode === 'active';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/(customer)/live/${stream.id}` as any)}
    >
      <View style={styles.thumbnail}>
        <Ionicons name="videocam-outline" size={32} color="#666" />
        {isActive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {isActive && (
          <View style={styles.viewerBadge}>
            <Ionicons name="people-outline" size={12} color="#fff" />
            <Text style={styles.viewerText}>{viewerCount}</Text>
          </View>
        )}
        {!isActive && scheduledAt && (
          <View style={styles.scheduledBadge}>
            <Ionicons name="time-outline" size={11} color="#fff" />
            <Text style={styles.scheduledBadgeText}>
              {new Date(scheduledAt).toLocaleString('mn-MN', {
                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{stream.title}</Text>
        <Text style={styles.cardShop} numberOfLines={1}>{shopName}</Text>
        <Text style={styles.metaText}>
          {productCount > 0 ? `${productCount} бараа` : 'Шууд үзүүлэлт'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  header: {
    backgroundColor: C.brand, flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingHorizontal: 20, paddingTop: 58, paddingBottom: 14,
  },
  headerTitle: { ...F.h3, color: C.white },
  headerCount: { ...F.tiny, color: 'rgba(255,255,255,0.8)' },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    padding: R.md,
    backgroundColor: C.bgCard,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: R.full,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.bgSection,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  tabActive: { backgroundColor: C.brand, borderColor: C.brand },
  tabText: { ...F.small, color: C.textSub, fontWeight: '600' },
  tabTextActive: { color: C.white, fontWeight: '700' },
  badgePill: {
    backgroundColor: C.border,
    borderRadius: R.full,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: 'center',
  },
  badgePillText: { fontSize: 10, fontWeight: '700', color: C.text },
  list: { padding: R.md },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: C.border,
  },
  thumbnail: {
    height: 120,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.brand,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  viewerBadge: {
    position: 'absolute', bottom: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  viewerText: { color: '#fff', fontSize: 10 },
  scheduledBadge: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6,
  },
  scheduledBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  cardInfo: { padding: 10 },
  cardTitle: { ...F.small, color: C.text, fontWeight: '600' },
  cardShop: { ...F.tiny, color: C.textSub, marginTop: 2 },
  metaText: { ...F.tiny, color: C.textMuted, marginTop: 4 },
  emptyText: { ...F.body, color: C.textSub, marginTop: 12 },
  emptySubText: { ...F.tiny, color: C.textMuted, marginTop: 4 },
});
