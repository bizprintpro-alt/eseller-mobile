import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const TIER_META: Record<string, { icon: string; color: string; label: string }> = {
  BRONZE:   { icon: '🥉', color: '#CD7F32', label: 'Bronze' },
  SILVER:   { icon: '🥈', color: '#607D8B', label: 'Silver' },
  GOLD:     { icon: '🥇', color: '#C0953C', label: 'Gold' },
  PLATINUM: { icon: '💎', color: '#7F77DD', label: 'Platinum' },
  DIAMOND:  { icon: '👑', color: '#0F6E56', label: 'Diamond' },
};

const fmt = (n: number) => n.toLocaleString() + '₮';

export default function WalletScreen() {
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['wallet'], queryFn: () => get('/wallet') });
  const [tab, setTab] = useState<'txns' | 'points'>('txns');

  const convertMut = useMutation({
    mutationFn: (pts: number) => post('/wallet/convert-points', { points: pts }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallet'] }); Alert.alert('Амжилттай', 'Оноо хөрвүүлэгдлээ'); },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const d = data as any;
  if (isLoading || !d?.wallet) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const w = d.wallet;
  const tier = TIER_META[w.tier] || TIER_META.BRONZE;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}>

      {/* Balance card */}
      <View style={st.balanceCard}>
        <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.6)' }}>Нийт үлдэгдэл</Text>
        <Text style={{ ...F.h1, color: C.white, marginTop: 4 }}>{fmt(w.balance || 0)}</Text>
        <View style={{ flexDirection: 'row', gap: R.sm, marginTop: R.md }}>
          {['Цэнэглэх', 'Гаргах', 'Шилжүүлэх'].map(label => (
            <TouchableOpacity key={label} style={st.actionBtn}>
              <Text style={{ ...F.tiny, color: C.white }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Points card */}
      <View style={st.pointsCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: R.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 20 }}>{tier.icon}</Text>
            <View>
              <Text style={{ ...F.body, color: C.white, fontWeight: '600' }}>{(w.points || 0).toLocaleString()} оноо</Text>
              <Text style={{ ...F.tiny, color: C.textMuted }}>{tier.label} түвшин</Text>
            </View>
          </View>
          <TouchableOpacity style={st.convertBtn}
            onPress={() => Alert.alert('Оноо хөрвүүлэх', '100 оноо = 100₮. Хөрвүүлэх үү?', [
              { text: 'Болих' },
              { text: 'Хөрвүүлэх', onPress: () => convertMut.mutate(w.points || 100) },
            ])}>
            <Text style={{ ...F.tiny, color: '#27500A', fontWeight: '600' }}>Мөнгө болгох</Text>
          </TouchableOpacity>
        </View>
        <View style={st.progressBg}><View style={[st.progressFill, { width: `${d.progress || 0}%`, backgroundColor: tier.color }]} /></View>
        {d.nextTier && <Text style={{ ...F.tiny, color: C.textMuted, marginTop: 4 }}>{d.nextTier} хүрэхэд {(d.pointsToNext || 0).toLocaleString()} оноо</Text>}
      </View>

      {/* Tab */}
      <View style={st.tabRow}>
        {(['txns', 'points'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[st.tab, tab === t && st.tabActive]}>
            <Text style={{ ...F.small, fontWeight: tab === t ? '600' : '400', color: tab === t ? C.white : C.textMuted }}>{t === 'txns' ? 'Гүйлгээ' : 'Оноо'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <View style={{ padding: R.lg }}>
        {tab === 'txns' ? (d.transactions || []).map((tx: any) => (
          <View key={tx.id} style={st.listItem}>
            <Ionicons name={tx.amount > 0 ? 'arrow-down-circle' : 'arrow-up-circle'} size={28} color={tx.amount > 0 ? C.secondary : C.brand} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...F.small, color: C.text, fontWeight: '600' }}>{tx.note || tx.type}</Text>
              <Text style={{ ...F.tiny, color: C.textMuted }}>{new Date(tx.createdAt).toLocaleDateString('mn-MN')}</Text>
            </View>
            <Text style={{ ...F.body, color: tx.amount > 0 ? C.secondary : C.brand, fontWeight: '800' }}>{tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}</Text>
          </View>
        )) : (d.pointEvents || []).map((pe: any) => (
          <View key={pe.id} style={st.listItem}>
            <Ionicons name="star" size={24} color={C.gold} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...F.small, color: C.text, fontWeight: '600' }}>{pe.action}</Text>
              <Text style={{ ...F.tiny, color: C.textMuted }}>{new Date(pe.createdAt).toLocaleDateString('mn-MN')}</Text>
            </View>
            <Text style={{ ...F.body, color: C.gold, fontWeight: '800' }}>+{pe.points}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  balanceCard: { backgroundColor: '#1B3A5C', margin: R.md, borderRadius: R.lg, padding: R.lg },
  actionBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: R.sm, padding: R.sm, alignItems: 'center' },
  pointsCard: { backgroundColor: C.bgCard, margin: R.md, marginTop: 0, borderRadius: R.md, padding: 14, borderWidth: 0.5, borderColor: C.border },
  convertBtn: { backgroundColor: '#EAF3DE', borderRadius: R.full, paddingHorizontal: R.md, paddingVertical: 5 },
  progressBg: { height: 5, backgroundColor: C.bgSection, borderRadius: 3 },
  progressFill: { height: '100%', borderRadius: 3 },
  tabRow: { flexDirection: 'row', margin: R.md, marginTop: 0, backgroundColor: C.bgSection, borderRadius: R.sm, padding: 3 },
  tab: { flex: 1, paddingVertical: 7, borderRadius: 6, alignItems: 'center' },
  tabActive: { backgroundColor: C.bgCard },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: R.md, paddingVertical: R.md, borderBottomWidth: 0.5, borderBottomColor: C.border },
});
