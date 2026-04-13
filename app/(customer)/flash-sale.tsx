import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

function useCountdown(endsAt: string) {
  const calc = () => Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  const [secs, setSecs] = useState(calc);
  const prev = useRef(secs);
  useEffect(() => {
    const t = setInterval(() => {
      const v = calc();
      setSecs(v);
      if (v === 0 && prev.current > 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      prev.current = v;
    }, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { h, m, s, ended: secs === 0 };
}

const fmt = (n: number) => n.toLocaleString() + '₮';

export default function FlashSaleScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['flash-sale'],
    queryFn: () => get('/flash-sales/active'),
  });

  const sale = (data as any) || { title: 'Flash Sale 🔥', endsAt: new Date(Date.now() + 4 * 3600_000).toISOString(), products: [] };
  const { h, m, s, ended } = useCountdown(sale.endsAt);

  return (
    <ScrollView style={st.container} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}>

      {/* Countdown */}
      <View style={st.countdownCard}>
        <View>
          <Text style={{ ...F.h3, color: C.white }}>{sale.title || 'Flash Sale 🔥'}</Text>
          <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{ended ? 'Дууссан!' : 'Дуусахад'}</Text>
        </View>
        <View style={st.timerRow}>
          {[h, m, s].map((v, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text style={st.timerColon}>:</Text>}
              <View style={st.timerBox}><Text style={st.timerText}>{v}</Text></View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Gold banner */}
      <TouchableOpacity style={st.goldBanner} onPress={() => router.push('/(tabs)/gold')}>
        <Ionicons name="diamond" size={18} color={C.gold} />
        <Text style={{ ...F.small, color: C.gold, flex: 1 }}>Gold гишүүд 1 цагийн өмнө нэвтэрнэ</Text>
        <Ionicons name="chevron-forward" size={16} color={C.gold} />
      </TouchableOpacity>

      {/* Products grid */}
      {isLoading ? <ActivityIndicator color={C.brand} style={{ marginTop: 40 }} /> : (
        <View style={st.grid}>
          {(sale.products || []).map((p: any) => {
            const disc = p.discount || Math.round((1 - (p.salePrice || p.price) / (p.originalPrice || p.price + 10000)) * 100);
            const sold = p.sold || 0;
            const stock = p.stock || 50;
            const pct = Math.round((sold / stock) * 100);
            return (
              <TouchableOpacity key={p.id} style={st.productCard} onPress={() => router.push(`/product/${p.id}`)}>
                <View style={st.discBadge}><Text style={st.discText}>-{disc}%</Text></View>
                <View style={st.imgWrap}>
                  {p.images?.[0] ? <Image source={{ uri: p.images[0] }} style={st.img} /> :
                    <Ionicons name="flash" size={36} color={C.brand} />}
                </View>
                <Text style={{ ...F.small, color: C.text, fontWeight: '600', marginBottom: 6, height: 32 }} numberOfLines={2}>{p.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: R.sm }}>
                  <Text style={{ ...F.body, color: C.brand, fontWeight: '900' }}>{fmt(p.salePrice || p.price)}</Text>
                  {p.originalPrice && <Text style={{ ...F.tiny, color: C.textMuted, textDecorationLine: 'line-through' }}>{fmt(p.originalPrice)}</Text>}
                </View>
                <View style={st.stockBar}><View style={[st.stockFill, { width: `${pct}%` }]} /></View>
                <Text style={{ ...F.tiny, color: C.textMuted, marginTop: 3, textAlign: 'center' }}>{sold}/{stock} зарагдсан</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  countdownCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.brand, borderRadius: R.lg, padding: R.lg, marginBottom: R.md },
  timerRow: { flexDirection: 'row', alignItems: 'center' },
  timerBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 6 },
  timerText: { color: C.white, fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerColon: { color: C.white, fontSize: 20, fontWeight: '900', marginHorizontal: 4 },
  goldBanner: { flexDirection: 'row', alignItems: 'center', gap: R.sm, backgroundColor: C.goldDim, borderRadius: R.md, padding: R.md, marginBottom: R.lg, borderWidth: 0.5, borderColor: C.gold + '33' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  productCard: { width: '48%' as any, backgroundColor: C.bgCard, borderRadius: R.lg, padding: 10, borderWidth: 0.5, borderColor: C.border },
  discBadge: { position: 'absolute', top: R.sm, left: R.sm, zIndex: 1, backgroundColor: C.brand, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  discText: { color: C.white, fontSize: 11, fontWeight: '900' },
  imgWrap: { height: 100, borderRadius: 10, backgroundColor: C.bgSection, alignItems: 'center', justifyContent: 'center', marginBottom: R.sm },
  img: { width: '100%', height: '100%', borderRadius: 10 },
  stockBar: { height: 4, backgroundColor: C.bgSection, borderRadius: 2, overflow: 'hidden' },
  stockFill: { height: '100%', backgroundColor: C.gold, borderRadius: 2 },
});
