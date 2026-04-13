import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const TIERS = [
  { key: 'BRONZE', icon: '🥉', color: '#CD7F32', label: 'Bronze', min: 0, benefits: ['Захиалгын 10% оноо', 'Үндсэн хүргэлт'] },
  { key: 'SILVER', icon: '🥈', color: '#607D8B', label: 'Silver', min: 5000, benefits: ['12% оноо', 'Flash sale 30 мин өмнө', 'Сарын 1 купон'] },
  { key: 'GOLD', icon: '🥇', color: '#C0953C', label: 'Gold', min: 20000, benefits: ['15% оноо', '2x оноо Gold-д', 'Үнэгүй хүргэлт 50K+', 'Flash sale 1 цаг өмнө'] },
  { key: 'PLATINUM', icon: '💎', color: '#7F77DD', label: 'Platinum', min: 50000, benefits: ['18% оноо', 'Тэргүүлэх дэмжлэг', 'Сар бүр купон', 'VIP зар үнэгүй'] },
  { key: 'DIAMOND', icon: '👑', color: '#0F6E56', label: 'Diamond', min: 100000, benefits: ['20% оноо', 'Бүх давуу эрх', 'Хувийн менежер', 'Төрсөн өдрийн бэлэг'] },
];

export default function TierDetailsScreen() {
  const { data } = useQuery({ queryKey: ['wallet'], queryFn: () => get('/wallet') });
  const d = data as any;
  const currentTier = d?.wallet?.tier || 'BRONZE';
  const totalPoints = d?.wallet?.totalPoints || 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <Text style={{ ...F.h2, color: C.white, marginBottom: R.lg }}>Урамшааллын түвшин</Text>
      <Text style={{ ...F.small, color: C.textSub, marginBottom: R.xxl }}>Нийт {totalPoints.toLocaleString()} оноо цуглуулсан</Text>

      {TIERS.map((t, i) => {
        const isCurrent = currentTier === t.key;
        const isLocked = totalPoints < t.min;
        return (
          <View key={t.key} style={[st.card, isCurrent && { borderColor: t.color + '88', borderWidth: 2 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: R.md, marginBottom: R.md }}>
              <Text style={{ fontSize: 32 }}>{t.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: R.sm }}>
                  <Text style={{ ...F.h3, color: isCurrent ? t.color : isLocked ? C.textMuted : C.white }}>{t.label}</Text>
                  {isCurrent && <View style={[st.badge, { backgroundColor: t.color }]}><Text style={{ fontSize: 9, color: C.white, fontWeight: '800' }}>Одоогийн</Text></View>}
                </View>
                <Text style={{ ...F.tiny, color: C.textMuted }}>{t.min.toLocaleString()}+ оноо</Text>
              </View>
              {isLocked && <Ionicons name="lock-closed" size={18} color={C.textMuted} />}
            </View>
            {t.benefits.map((b, j) => (
              <View key={j} style={{ flexDirection: 'row', alignItems: 'center', gap: R.sm, marginBottom: 4 }}>
                <Ionicons name="checkmark-circle" size={16} color={isLocked ? C.textMuted : t.color} />
                <Text style={{ ...F.small, color: isLocked ? C.textMuted : C.text }}>{b}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: C.bgCard, borderRadius: R.lg, padding: R.lg, marginBottom: R.md, borderWidth: 0.5, borderColor: C.border },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
});
