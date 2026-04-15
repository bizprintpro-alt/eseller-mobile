import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, RefreshControl, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { WalletAPI, LoyaltyAPI, type WalletHistoryEntry } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

type WalletTab = 'overview' | 'transactions' | 'topup' | 'payout';

// Backend returns { success, data: { balance, pending, history } } — unwrap once.
// Some older routes return raw — handle both shapes.
function unwrap<T = unknown>(res: any): T {
  return (res?.data ?? res) as T;
}

const fmt = (n: number) => (n ?? 0).toLocaleString() + '₮';

const TIER_META: Record<string, { icon: string; color: string; label: string }> = {
  BRONZE:   { icon: '🥉', color: '#CD7F32', label: 'Bronze'   },
  SILVER:   { icon: '🥈', color: '#607D8B', label: 'Silver'   },
  GOLD:     { icon: '🥇', color: '#C0953C', label: 'Gold'     },
  PLATINUM: { icon: '💎', color: '#7F77DD', label: 'Platinum' },
};

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000];

const TOPUP_METHODS: { id: 'qpay' | 'socialpay' | 'card'; label: string; icon: string }[] = [
  { id: 'qpay',      label: 'QPay',      icon: '📱' },
  { id: 'socialpay', label: 'SocialPay', icon: '💚' },
  { id: 'card',      label: 'Карт',      icon: '💳' },
];

const BANKS = ['Хаан банк', 'Голомт банк', 'TDB банк', 'Хас банк', 'Ариг банк', 'Капитрон банк'];

const TX_FILTERS: { label: string; value?: string }[] = [
  { label: 'Бүгд' },
  { label: 'Цэнэглэлт',    value: 'TOPUP' },
  { label: 'Escrow',       value: 'ESCROW_HOLD' },
  { label: 'Цуцлал',       value: 'ESCROW_REFUND' },
  { label: 'Оноо → мөнгө', value: 'POINTS_REDEEM' },
  { label: 'Гаргалт',      value: 'PAYOUT' },
];

export default function WalletScreen() {
  const qc = useQueryClient();
  const [tab, setTab]       = useState<WalletTab>('overview');
  const [txFilter, setTxFilter] = useState<string | undefined>(undefined);
  const [txPage, setTxPage]     = useState(1);

  // Topup state
  const [topupAmount, setTopupAmount]   = useState('');
  const [topupMethod, setTopupMethod]   = useState<'qpay' | 'socialpay' | 'card'>('qpay');

  // Payout state
  const [payoutAmount, setPayoutAmount]   = useState('');
  const [payoutBank,   setPayoutBank]     = useState('');
  const [payoutAccount, setPayoutAccount] = useState('');

  // ── Queries ──
  const walletQ = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await WalletAPI.getWallet();
      return unwrap<{
        balance?: number;
        pending?: number;
        escrowHold?: number;
        history?: WalletHistoryEntry[];
      }>(res);
    },
  });

  const loyaltyQ = useQuery({
    queryKey: ['loyalty'],
    queryFn: async () => {
      const res = await LoyaltyAPI.get();
      return unwrap<{ balance?: number; tier?: string; lifetimeEarned?: number }>(res);
    },
  });

  const txQ = useQuery({
    queryKey: ['wallet-transactions', txPage, txFilter],
    queryFn: async () => {
      const res = await WalletAPI.getTransactions(txPage, txFilter);
      return unwrap<{
        transactions: WalletHistoryEntry[];
        total: number;
        page: number;
        totalPages: number;
      }>(res);
    },
    enabled: tab === 'transactions' || tab === 'overview',
  });

  // ── Mutations ──
  const topupMut = useMutation({
    mutationFn: (data: { amount: number; method: 'qpay' | 'socialpay' | 'card'; reference: string }) =>
      WalletAPI.topUp(data),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      setTopupAmount('');
      setTab('overview');
      Alert.alert('✅ Амжилттай', 'Цэнэглэлт хийгдлээ');
    },
    onError: (e: any) => Alert.alert('Алдаа', e?.message || 'Цэнэглэхэд алдаа гарлаа'),
  });

  const payoutMut = useMutation({
    mutationFn: (data: { amount: number; bankName: string; bankAccount: string }) =>
      WalletAPI.requestPayout(data),
    onSuccess: (res: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      setPayoutAmount('');
      setPayoutBank('');
      setPayoutAccount('');
      setTab('overview');
      const body = unwrap<any>(res);
      Alert.alert('Хүсэлт илгээгдлээ', body?.message || '1-3 ажлын өдрийн дотор шилжинэ');
    },
    onError: (e: any) => Alert.alert('Алдаа', e?.message || 'Хүсэлт илгээхэд алдаа гарлаа'),
  });

  const w = walletQ.data;
  const loyalty = loyaltyQ.data;
  const txList: WalletHistoryEntry[] = txQ.data?.transactions ?? [];
  const tier = TIER_META[(loyalty?.tier ?? 'BRONZE').toUpperCase()] || TIER_META.BRONZE;

  if (walletQ.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.brand} />
      </View>
    );
  }

  // ── Handlers ──
  const handleTopup = () => {
    const amount = parseInt((topupAmount || '').replace(/[,\s₮]/g, ''), 10);
    if (!amount || amount < 1000) {
      Alert.alert('Алдаа', 'Хамгийн бага 1,000₮ цэнэглэнэ');
      return;
    }
    topupMut.mutate({
      amount,
      method: topupMethod,
      reference: `APP_${Date.now()}`,
    });
  };

  const handlePayout = () => {
    const amount = parseInt((payoutAmount || '').replace(/[,\s₮]/g, ''), 10);
    if (!amount || amount < 10000) {
      Alert.alert('Алдаа', 'Хамгийн бага 10,000₮ гаргана');
      return;
    }
    if (!payoutBank || !payoutAccount.trim()) {
      Alert.alert('Алдаа', 'Банк болон дансны дугаар оруулна уу');
      return;
    }
    Alert.alert(
      'Баталгаажуулах',
      `${fmt(amount)} → ${payoutBank} ${payoutAccount}`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Тийм',
          onPress: () => payoutMut.mutate({ amount, bankName: payoutBank, bankAccount: payoutAccount }),
        },
      ],
    );
  };

  // ── Rendering helpers ──
  const txIcon = (type?: string) => {
    const t = (type ?? '').toUpperCase();
    if (t === 'TOPUP')          return 'arrow-down-circle';
    if (t === 'ESCROW_HOLD')    return 'hourglass';
    if (t === 'ESCROW_RELEASE') return 'checkmark-circle';
    if (t === 'ESCROW_REFUND')  return 'arrow-undo-circle';
    if (t === 'POINTS_REDEEM')  return 'star';
    if (t === 'PAYOUT')         return 'arrow-up-circle';
    return 'ellipse-outline';
  };
  const txColor = (type?: string, amount?: number) => {
    const t = (type ?? '').toUpperCase();
    if (t === 'TOPUP' || t === 'ESCROW_REFUND' || t === 'POINTS_REDEEM') return C.secondary;
    if (t === 'PAYOUT' || t === 'ESCROW_HOLD') return C.brand;
    return (amount ?? 0) >= 0 ? C.secondary : C.brand;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={
        <RefreshControl
          refreshing={walletQ.isRefetching}
          onRefresh={() => {
            walletQ.refetch();
            loyaltyQ.refetch();
            txQ.refetch();
          }}
          tintColor={C.brand}
        />
      }
    >
      {/* ─── Balance card ─── */}
      <View style={st.balanceCard}>
        <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.6)' }}>Нийт үлдэгдэл</Text>
        <Text style={{ ...F.h1, color: C.white, marginTop: 4 }}>{fmt(w?.balance || 0)}</Text>
        {(w?.escrowHold ?? 0) > 0 && (
          <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Escrow хүлээгдэж: {fmt(w!.escrowHold!)}
          </Text>
        )}

        {/* Points row */}
        <View style={st.pointsRow}>
          <Text style={{ fontSize: 16 }}>{tier.icon}</Text>
          <Text style={{ ...F.small, color: C.white, fontWeight: '600', flex: 1 }}>
            {(loyalty?.balance ?? 0).toLocaleString()} оноо
          </Text>
          <Text style={{ ...F.tiny, color: 'rgba(255,255,255,0.6)' }}>{tier.label}</Text>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {[
            { label: 'Цэнэглэх', tab: 'topup'        as WalletTab, icon: 'add-circle' },
            { label: 'Гаргах',   tab: 'payout'       as WalletTab, icon: 'arrow-up-circle' },
            { label: 'Түүх',     tab: 'transactions' as WalletTab, icon: 'list' },
          ].map(btn => (
            <TouchableOpacity
              key={btn.tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setTab(btn.tab);
              }}
              style={st.actionBtn}
            >
              <Ionicons name={btn.icon as any} size={18} color={C.white} />
              <Text style={{ ...F.tiny, color: C.white, marginTop: 2 }}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ─── Tab switcher (only when not on overview) ─── */}
      {tab !== 'overview' && (
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          paddingHorizontal: R.lg, marginTop: R.md,
        }}>
          <TouchableOpacity
            onPress={() => setTab('overview')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name="chevron-back" size={16} color={C.textSub} />
            <Text style={{ ...F.small, color: C.textSub }}>Буцах</Text>
          </TouchableOpacity>
          <Text style={{ ...F.body, color: C.text, fontWeight: '700', marginLeft: 8 }}>
            {tab === 'topup' && 'Цэнэглэх'}
            {tab === 'payout' && 'Гаргах хүсэлт'}
            {tab === 'transactions' && 'Гүйлгээний түүх'}
          </Text>
        </View>
      )}

      {/* ─── OVERVIEW ─── */}
      {tab === 'overview' && (
        <View style={{ padding: R.lg, gap: R.md }}>
          <Text style={{ ...F.small, color: C.textSub, fontWeight: '600' }}>
            Сүүлийн гүйлгээ
          </Text>
          {txList.length === 0 ? (
            <View style={st.emptyCard}>
              <Text style={{ fontSize: 36 }}>💳</Text>
              <Text style={{ ...F.small, color: C.textMuted, marginTop: 6 }}>
                Гүйлгээ хараахан байхгүй
              </Text>
            </View>
          ) : (
            txList.slice(0, 5).map((tx, i) => (
              <TxRow key={i} tx={tx} txIcon={txIcon} txColor={txColor} />
            ))
          )}
          {txList.length > 0 && (
            <TouchableOpacity onPress={() => setTab('transactions')}>
              <Text style={{ ...F.small, color: C.brand, textAlign: 'center', marginTop: 4 }}>
                Бүгдийг харах →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ─── TRANSACTIONS ─── */}
      {tab === 'transactions' && (
        <View style={{ padding: R.lg, gap: R.md }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {TX_FILTERS.map(f => {
                const active = txFilter === f.value;
                return (
                  <TouchableOpacity
                    key={f.label}
                    onPress={() => { setTxFilter(f.value); setTxPage(1); }}
                    style={[st.chip, active && st.chipActive]}
                  >
                    <Text style={{
                      ...F.tiny,
                      color: active ? C.white : C.textSub,
                      fontWeight: active ? '700' : '500',
                    }}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {txQ.isLoading ? (
            <ActivityIndicator color={C.brand} />
          ) : txList.length === 0 ? (
            <View style={st.emptyCard}>
              <Text style={{ fontSize: 36 }}>📭</Text>
              <Text style={{ ...F.small, color: C.textMuted, marginTop: 6 }}>
                Энэ шүүлтүүрт тохирох гүйлгээ байхгүй
              </Text>
            </View>
          ) : (
            txList.map((tx, i) => (
              <TxRow key={i} tx={tx} txIcon={txIcon} txColor={txColor} />
            ))
          )}

          {(txQ.data?.totalPages ?? 1) > txPage && (
            <TouchableOpacity
              onPress={() => setTxPage(p => p + 1)}
              style={st.loadMore}
            >
              <Text style={{ ...F.small, color: C.brand, fontWeight: '600' }}>
                Дараагийн хуудас →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ─── TOPUP ─── */}
      {tab === 'topup' && (
        <View style={{ padding: R.lg, gap: R.md }}>
          <Text style={{ ...F.small, color: C.textSub, fontWeight: '600' }}>Дүн</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_AMOUNTS.map(a => {
              const active = parseInt((topupAmount || '').replace(/[,\s₮]/g, ''), 10) === a;
              return (
                <TouchableOpacity
                  key={a}
                  onPress={() => setTopupAmount(a.toLocaleString())}
                  style={[st.chip, active && st.chipActive]}
                >
                  <Text style={{
                    ...F.small,
                    color: active ? C.white : C.text,
                    fontWeight: active ? '700' : '500',
                  }}>
                    {fmt(a)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={topupAmount}
            onChangeText={setTopupAmount}
            placeholder="Эсвэл гараар дүн оруулах..."
            placeholderTextColor={C.textMuted}
            keyboardType="numeric"
            style={st.input}
          />

          <Text style={{ ...F.small, color: C.textSub, fontWeight: '600', marginTop: 6 }}>
            Төлбөрийн хэрэгсэл
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TOPUP_METHODS.map(m => {
              const active = topupMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setTopupMethod(m.id)}
                  style={[
                    {
                      flex: 1, paddingVertical: 14, borderRadius: R.md,
                      alignItems: 'center', gap: 4,
                      backgroundColor: active ? C.brand : C.bgCard,
                      borderWidth: 0.5,
                      borderColor: active ? C.brand : C.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{m.icon}</Text>
                  <Text style={{ ...F.small, color: active ? C.white : C.text, fontWeight: '600' }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleTopup}
            disabled={topupMut.isPending}
            style={[st.primaryBtn, topupMut.isPending && { opacity: 0.6 }]}
          >
            {topupMut.isPending ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>
                Цэнэглэх
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ─── PAYOUT ─── */}
      {tab === 'payout' && (
        <View style={{ padding: R.lg, gap: R.md }}>
          <Text style={{ ...F.small, color: C.textSub, fontWeight: '600' }}>Гаргах дүн</Text>
          <TextInput
            value={payoutAmount}
            onChangeText={setPayoutAmount}
            placeholder="Хамгийн бага 10,000₮"
            placeholderTextColor={C.textMuted}
            keyboardType="numeric"
            style={st.input}
          />

          <Text style={{ ...F.small, color: C.textSub, fontWeight: '600', marginTop: 6 }}>
            Банк
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {BANKS.map(b => {
              const active = payoutBank === b;
              return (
                <TouchableOpacity
                  key={b}
                  onPress={() => setPayoutBank(b)}
                  style={[st.chip, active && st.chipActive]}
                >
                  <Text style={{
                    ...F.tiny,
                    color: active ? C.white : C.text,
                    fontWeight: active ? '700' : '500',
                  }}>
                    {b}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ ...F.small, color: C.textSub, fontWeight: '600', marginTop: 6 }}>
            Дансны дугаар
          </Text>
          <TextInput
            value={payoutAccount}
            onChangeText={setPayoutAccount}
            placeholder="5012345678"
            placeholderTextColor={C.textMuted}
            keyboardType="numeric"
            style={st.input}
          />

          <TouchableOpacity
            onPress={handlePayout}
            disabled={payoutMut.isPending}
            style={[st.primaryBtn, payoutMut.isPending && { opacity: 0.6 }]}
          >
            {payoutMut.isPending ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>
                Хүсэлт илгээх
              </Text>
            )}
          </TouchableOpacity>

          <Text style={{ ...F.tiny, color: C.textMuted, textAlign: 'center', marginTop: 4 }}>
            Хүсэлт 1-3 ажлын өдрийн дотор шалгагдана
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── TxRow component ───
function TxRow({
  tx, txIcon, txColor,
}: {
  tx: WalletHistoryEntry;
  txIcon: (type?: string) => string;
  txColor: (type?: string, amount?: number) => string;
}) {
  const amt = tx.amount ?? 0;
  const color = txColor(tx.type, amt);
  const stamp = tx.createdAt || tx.date || '';
  return (
    <View style={st.txRow}>
      <Ionicons name={txIcon(tx.type) as any} size={28} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={{ ...F.small, color: C.text, fontWeight: '600' }} numberOfLines={1}>
          {tx.description || tx.type || 'Гүйлгээ'}
        </Text>
        <Text style={{ ...F.tiny, color: C.textMuted, marginTop: 2 }}>
          {stamp ? new Date(stamp).toLocaleDateString('mn-MN') : '—'}
          {tx.status === 'PENDING' && (
            <Text style={{ color: C.warning }}> · Хүлээгдэж байна</Text>
          )}
        </Text>
      </View>
      <Text style={{ ...F.body, color, fontWeight: '800' }}>
        {amt > 0 ? '+' : ''}{fmt(amt)}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#1B3A5C',
    margin: R.md,
    borderRadius: R.lg,
    padding: R.lg,
    paddingTop: R.xxl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: R.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: R.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 14,
  },
  chip: {
    backgroundColor: C.bgCard,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: C.brand,
    borderColor: C.brand,
  },
  input: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 0.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: C.brand,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: R.md,
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  emptyCard: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    padding: 32,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: C.border,
  },
  loadMore: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: C.border,
  },
});
