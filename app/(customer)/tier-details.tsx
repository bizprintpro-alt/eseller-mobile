import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LoyaltyAPI } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

// 1 оноо = 5₮ — web-ийн LOYALTY_CONFIG.redeem.pointValue-тэй ижил
const POINT_VALUE = 5;
const fmt = (n: number) => (n ?? 0).toLocaleString() + '₮';

function unwrap<T = unknown>(res: any): T {
  return (res?.data ?? res) as T;
}

const TIERS = [
  { key: 'BRONZE',   icon: '🥉', color: '#CD7F32', label: 'Bronze',   min: 0,      benefits: ['Захиалгын 10% оноо', 'Үндсэн хүргэлт'] },
  { key: 'SILVER',   icon: '🥈', color: '#607D8B', label: 'Silver',   min: 5000,   benefits: ['12% оноо', 'Flash sale 30 мин өмнө', 'Сарын 1 купон'] },
  { key: 'GOLD',     icon: '🥇', color: '#C0953C', label: 'Gold',     min: 20000,  benefits: ['15% оноо', '2x оноо Gold-д', 'Үнэгүй хүргэлт 50K+', 'Flash sale 1 цаг өмнө'] },
  { key: 'PLATINUM', icon: '💎', color: '#7F77DD', label: 'Platinum', min: 50000,  benefits: ['18% оноо', 'Тэргүүлэх дэмжлэг', 'Сар бүр купон', 'VIP зар үнэгүй'] },
  { key: 'DIAMOND',  icon: '👑', color: '#0F6E56', label: 'Diamond',  min: 100000, benefits: ['20% оноо', 'Бүх давуу эрх', 'Хувийн менежер', 'Төрсөн өдрийн бэлэг'] },
];

const REDEEM_OPTIONS = [
  { points: 500,  cash: 2500  },
  { points: 1000, cash: 5000  },
  { points: 2000, cash: 10000 },
  { points: 5000, cash: 25000 },
];

export default function TierDetailsScreen() {
  const qc = useQueryClient();
  const [customPoints, setCustomPoints] = useState('');

  const loyaltyQ = useQuery({
    queryKey: ['loyalty'],
    queryFn: async () => {
      const res = await LoyaltyAPI.get();
      return unwrap<{
        balance?: number;
        lifetimeEarned?: number;
        lifetimeSpent?: number;
        tier?: string;
      }>(res);
    },
  });

  const redeemMut = useMutation({
    mutationFn: (points: number) => LoyaltyAPI.redeemForCash(points),
    onSuccess: (res: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      qc.invalidateQueries({ queryKey: ['loyalty'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      const body = unwrap<{ message?: string; cashAdded?: number }>(res);
      setCustomPoints('');
      Alert.alert(
        '✅ Амжилттай',
        body?.message || `${(body?.cashAdded ?? 0).toLocaleString()}₮ хэтэвчинд нэмэгдлээ`,
      );
    },
    onError: (e: any) => Alert.alert('Алдаа', e?.message || 'Хөрвүүлэхэд алдаа гарлаа'),
  });

  const data = loyaltyQ.data;
  const balance = data?.balance ?? 0;
  const lifetime = data?.lifetimeEarned ?? balance;
  const currentTier = (data?.tier ?? 'BRONZE').toUpperCase();

  // Compute next tier + progress bar from TIERS array (schema-matched thresholds)
  const currentIdx = TIERS.findIndex((t) => t.key === currentTier);
  const next = currentIdx >= 0 && currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
  const currMin = currentIdx >= 0 ? TIERS[currentIdx].min : 0;
  const progressPct = next
    ? Math.max(0, Math.min(100, ((lifetime - currMin) / (next.min - currMin)) * 100))
    : 100;
  const pointsToNext = next ? Math.max(0, next.min - lifetime) : 0;

  const handleRedeem = (points: number) => {
    if (!Number.isFinite(points) || points <= 0) {
      Alert.alert('Алдаа', 'Оноо тоон утга байх ёстой');
      return;
    }
    if (points < 500) {
      Alert.alert('Алдаа', 'Хамгийн бага 500 оноо');
      return;
    }
    if (points % 100 !== 0) {
      Alert.alert('Алдаа', '100-ын үржвэр байх ёстой');
      return;
    }
    if (points > balance) {
      Alert.alert('Алдаа', `Оноо хүрэлцэхгүй (${balance.toLocaleString()} байна)`);
      return;
    }
    const cash = points * POINT_VALUE;
    Alert.alert(
      'Баталгаажуулах',
      `${points.toLocaleString()} оноо → ${fmt(cash)} хэтэвчинд нэмэгдэнэ`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Тийм',
          onPress: () => redeemMut.mutate(points),
        },
      ],
    );
  };

  const customAmount = parseInt((customPoints || '').replace(/[,\s]/g, ''), 10);
  const customCash = Number.isFinite(customAmount) && customAmount > 0 ? customAmount * POINT_VALUE : 0;

  if (loyaltyQ.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.brand} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: R.lg, paddingBottom: 80, paddingTop: R.xxl }}
    >
      <Text style={{ ...F.h2, color: C.text, marginBottom: 6 }}>Урамшааллын түвшин</Text>
      <Text style={{ ...F.small, color: C.textSub }}>
        Нийт {lifetime.toLocaleString()} оноо цуглуулсан
      </Text>

      {/* ─── Current balance + progress card ─── */}
      <View style={st.balanceCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 28 }}>
            {TIERS.find((t) => t.key === currentTier)?.icon ?? '🥉'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.6)' }}>Одоогийн оноо</Text>
            <Text style={{ ...F.h1, color: C.white }}>
              {balance.toLocaleString()}
              <Text style={{ ...F.small, color: 'rgba(255,255,255,0.5)' }}> ⭐</Text>
            </Text>
          </View>
          <View style={st.tierBadge}>
            <Text style={{ ...F.tiny, color: C.white, fontWeight: '800' }}>
              {TIERS.find((t) => t.key === currentTier)?.label ?? 'Bronze'}
            </Text>
          </View>
        </View>

        {next && (
          <>
            <View style={st.progressBg}>
              <View style={[st.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
              {next.label} хүрэхэд {pointsToNext.toLocaleString()} оноо дутуу байна
            </Text>
          </>
        )}
        {!next && (
          <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
            🎉 Хамгийн дээд түвшинд хүрсэн байна
          </Text>
        )}
      </View>

      {/* ─── Redeem for cash ─── */}
      <View style={st.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Ionicons name="wallet" size={18} color={C.secondary} />
          <Text style={{ ...F.h3, color: C.text }}>Оноо → Мөнгө</Text>
        </View>
        <Text style={{ ...F.tiny, color: C.textMuted, marginBottom: 12 }}>
          1 оноо = {POINT_VALUE}₮ · Хамгийн бага 500 оноо
        </Text>

        {/* Quick options */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REDEEM_OPTIONS.map((opt) => {
            const disabled = opt.points > balance;
            return (
              <TouchableOpacity
                key={opt.points}
                disabled={disabled || redeemMut.isPending}
                onPress={() => handleRedeem(opt.points)}
                style={[st.quickOpt, disabled && { opacity: 0.35 }]}
              >
                <Text style={{ ...F.small, color: C.text, fontWeight: '700' }}>
                  {opt.points.toLocaleString()} оноо
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="arrow-forward" size={10} color={C.textMuted} />
                  <Text style={{ ...F.tiny, color: C.secondary, fontWeight: '700' }}>
                    {fmt(opt.cash)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom amount */}
        <Text style={{ ...F.tiny, color: C.textSub, marginTop: 14, marginBottom: 6 }}>
          Эсвэл гараар:
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            value={customPoints}
            onChangeText={setCustomPoints}
            placeholder="500"
            placeholderTextColor={C.textMuted}
            keyboardType="numeric"
            style={[st.input, { flex: 1 }]}
          />
          <Ionicons name="arrow-forward" size={16} color={C.textMuted} />
          <View style={[st.input, { flex: 1, justifyContent: 'center' }]}>
            <Text style={{
              ...F.body,
              color: customCash > 0 ? C.secondary : C.textMuted,
              fontWeight: '700',
            }}>
              {fmt(customCash)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={!customAmount || redeemMut.isPending}
          onPress={() => handleRedeem(customAmount)}
          style={[
            st.primaryBtn,
            (!customAmount || redeemMut.isPending) && { opacity: 0.5 },
          ]}
        >
          {redeemMut.isPending ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>
              Хэтэвчинд шилжүүлэх
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Tier list ─── */}
      <Text style={{ ...F.h3, color: C.text, marginTop: R.xl, marginBottom: R.md }}>
        Бүх түвшнүүд
      </Text>
      {TIERS.map((t) => {
        const isCurrent = currentTier === t.key;
        const isLocked = lifetime < t.min;
        return (
          <View
            key={t.key}
            style={[st.card, isCurrent && { borderColor: t.color + '88', borderWidth: 2 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: R.md, marginBottom: R.md }}>
              <Text style={{ fontSize: 32 }}>{t.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: R.sm }}>
                  <Text style={{
                    ...F.h3,
                    color: isCurrent ? t.color : isLocked ? C.textMuted : C.text,
                  }}>
                    {t.label}
                  </Text>
                  {isCurrent && (
                    <View style={[st.badge, { backgroundColor: t.color }]}>
                      <Text style={{ fontSize: 9, color: C.white, fontWeight: '800' }}>Одоогийн</Text>
                    </View>
                  )}
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
  balanceCard: {
    backgroundColor: '#1B3A5C',
    borderRadius: R.lg,
    padding: R.lg,
    marginTop: R.lg,
    marginBottom: R.lg,
  },
  tierBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.gold,
    borderRadius: 4,
  },
  section: {
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    padding: R.lg,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: R.md,
  },
  quickOpt: {
    backgroundColor: C.bgSection,
    borderRadius: R.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: '47%',
    borderWidth: 0.5,
    borderColor: C.border,
  },
  input: {
    backgroundColor: C.bgSection,
    borderRadius: R.md,
    borderWidth: 0.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.text,
    fontSize: 14,
    minHeight: 42,
  },
  primaryBtn: {
    backgroundColor: C.secondary,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  card: {
    backgroundColor: C.bgCard,
    borderRadius: R.lg,
    padding: R.lg,
    marginBottom: R.md,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
});
