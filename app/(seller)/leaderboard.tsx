import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const MEDALS = ['🥇', '🥈', '🥉'];
const fmt = (n: number) => n.toLocaleString() + '₮';

export default function LeaderboardScreen() {
  const [month, setMonth] = useState(0);
  const { data, isLoading } = useQuery({ queryKey: ['leaderboard', month], queryFn: () => get(`/affiliate/leaderboard?offset=${month}`) });
  const entries = (data as any)?.leaderboard || (data as any)?.sellers || [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', gap: R.sm, marginBottom: R.md }}>
        {[0, 1, 2].map(o => (
          <TouchableOpacity key={o} style={[st.chip, month === o && { backgroundColor: C.seller, borderColor: C.seller }]} onPress={() => setMonth(o)}>
            <Text style={{ ...F.tiny, color: month === o ? C.white : C.textMuted, fontWeight: '600' }}>{o === 0 ? 'Энэ сар' : `${o} сарын өмнө`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={st.prizeBanner}>
        <Text style={{ fontSize: 24 }}>🏆</Text>
        <View style={{ flex: 1 }}><Text style={{ ...F.body, color: C.gold, fontWeight: '800' }}>1-р байр: 10,000 оноо!</Text><Text style={{ ...F.tiny, color: C.gold + '99' }}>Сарын шилдэг борлуулагч</Text></View>
      </View>

      {isLoading ? <ActivityIndicator color={C.seller} style={{ marginTop: 40 }} /> :
        entries.map((e: any, i: number) => (
          <View key={e.id || i} style={[st.card, e.isMe && { borderColor: C.seller + '66', backgroundColor: C.seller + '0D' }]}>
            <View style={[st.rankWrap, i < 3 && { backgroundColor: ['#FFD70033', '#C0C0C033', '#CD7F3233'][i] }]}>
              {i < 3 ? <Text style={{ fontSize: 20 }}>{MEDALS[i]}</Text> : <Text style={{ ...F.body, color: C.textMuted, fontWeight: '900' }}>#{i + 1}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>{e.name || e.shopName || `#${i + 1}`}</Text>
                {e.isMe && <View style={{ backgroundColor: C.seller, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}><Text style={{ fontSize: 9, color: C.white, fontWeight: '800' }}>Би</Text></View>}
              </View>
              <Text style={{ ...F.tiny, color: C.textMuted }}>{e.totalSales || e.sales || 0} борлуулалт</Text>
            </View>
            <Text style={{ ...F.body, color: C.seller, fontWeight: '900' }}>{fmt(e.totalRevenue || e.revenue || 0)}</Text>
          </View>
        ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  chip: { flex: 1, backgroundColor: C.bgCard, borderRadius: R.md, paddingVertical: 10, alignItems: 'center', borderWidth: 0.5, borderColor: C.border },
  prizeBanner: { flexDirection: 'row', alignItems: 'center', gap: R.md, backgroundColor: C.goldDim, borderRadius: 14, padding: 14, marginBottom: R.lg, borderWidth: 0.5, borderColor: C.gold + '33' },
  card: { flexDirection: 'row', alignItems: 'center', gap: R.md, backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border },
  rankWrap: { width: 44, height: 44, borderRadius: R.md, backgroundColor: C.bgSection, alignItems: 'center', justifyContent: 'center' },
});
