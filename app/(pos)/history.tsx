import React from 'react';
import {
  View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { POSAPI } from '../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

interface POSSale {
  id: string;
  total: number;
  paymentMethod: string;
  itemCount: number;
  vatAmount?: number;
  createdAt: string;
  status?: 'completed' | 'refunded' | 'voided' | string;
  refundReason?: string | null;
}

const METHOD_LABEL: Record<string, string> = {
  cash: '💵 Бэлэн',
  qpay: '📱 QPay',
  card: '💳 Карт',
};

const VOID_WINDOW_MS = 5 * 60 * 1000;

function statusBadge(status?: string) {
  switch (status) {
    case 'refunded':
      return { label: 'Буцаалт', bg: '#7F1D1D', fg: '#FCA5A5' };
    case 'voided':
      return { label: 'Хүчингүй', bg: '#334155', fg: '#94A3B8' };
    default:
      return { label: 'Дууссан', bg: '#064E3B', fg: '#6EE7B7' };
  }
}

export default function POSHistory() {
  const today = new Date().toISOString().split('T')[0];
  const qc = useQueryClient();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['pos', 'history', today],
    queryFn: async () => {
      const res = await POSAPI.getSalesHistory(today);
      return unwrap<{
        sales: POSSale[];
        totalRevenue: number;
        totalOrders: number;
        refundedCount: number;
        refundedAmount: number;
      }>(res);
    },
  });

  const sales = data?.sales ?? [];
  const totalRev = data?.totalRevenue ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const refundedCount = data?.refundedCount ?? 0;
  const refundedAmount = data?.refundedAmount ?? 0;

  async function doRefund(sale: POSSale, isVoid: boolean) {
    try {
      if (isVoid) {
        await POSAPI.voidOrder(sale.id);
      } else {
        await POSAPI.refundOrder(sale.id, 'POS буцаалт');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      qc.invalidateQueries({ queryKey: ['pos', 'history'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      Alert.alert(
        'Амжилттай',
        isVoid ? 'Захиалга хүчингүй болгосон' : 'Буцаалт хийгдлээ',
      );
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Үйлдэл амжилтгүй');
    }
  }

  function onSalePress(sale: POSSale) {
    // Already refunded/voided → read-only info
    if (sale.status && sale.status !== 'completed') {
      const badge = statusBadge(sale.status);
      Alert.alert(
        `#${sale.id.slice(-6).toUpperCase()}`,
        `${badge.label} · ${sale.total.toLocaleString()}₮\n${
          sale.refundReason ?? ''
        }`,
        [{ text: 'OK' }],
      );
      return;
    }

    const elapsed = Date.now() - new Date(sale.createdAt).getTime();
    const isVoidable = elapsed < VOID_WINDOW_MS;
    const actionLabel = isVoidable
      ? `⚡ Void (${Math.max(0, Math.ceil((VOID_WINDOW_MS - elapsed) / 60000))} мин үлдсэн)`
      : '↩ Буцаалт';

    Alert.alert(
      `#${sale.id.slice(-6).toUpperCase()}`,
      `${sale.total.toLocaleString()}₮ · ${METHOD_LABEL[sale.paymentMethod] ?? sale.paymentMethod}`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: actionLabel,
          style: 'destructive',
          onPress: () => doRefund(sale, isVoidable),
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          backgroundColor: '#1E293B',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 }}>
          Өнөөдрийн борлуулалт
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Ionicons name="refresh" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={{ flexDirection: 'row', gap: 10, padding: 12 }}>
        <View style={{ flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12 }}>
          <Text style={{ color: '#64748B', fontSize: 11 }}>Цэвэр орлого</Text>
          <Text style={{ color: '#10B981', fontSize: 18, fontWeight: '700', marginTop: 4 }}>
            {totalRev.toLocaleString()}₮
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12 }}>
          <Text style={{ color: '#64748B', fontSize: 11 }}>Захиалга</Text>
          <Text style={{ color: '#3B82F6', fontSize: 18, fontWeight: '700', marginTop: 4 }}>
            {totalOrders}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12 }}>
          <Text style={{ color: '#64748B', fontSize: 11 }}>Буцаалт</Text>
          <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '700', marginTop: 4 }}>
            {refundedCount}
          </Text>
          {refundedAmount > 0 && (
            <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>
              −{refundedAmount.toLocaleString()}₮
            </Text>
          )}
        </View>
      </View>

      {/* Sales list */}
      <FlatList
        data={sales}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 40, gap: 10 }}>
              <ActivityIndicator color="#3B82F6" />
              <Text style={{ color: '#475569', fontSize: 12 }}>Ачаалж байна...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>🧾</Text>
              <Text style={{ color: '#475569', fontSize: 12 }}>
                Өнөөдөр борлуулалт байхгүй
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const badge = statusBadge(item.status);
          const dimmed = item.status !== 'completed';
          return (
            <TouchableOpacity
              onPress={() => onSalePress(item)}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 10,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                opacity: dimmed ? 0.6 : 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
                    #{item.id.slice(-6).toUpperCase()}
                  </Text>
                  <View
                    style={{
                      backgroundColor: badge.bg,
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                    }}
                  >
                    <Text style={{ color: badge.fg, fontSize: 9, fontWeight: '700' }}>
                      {badge.label}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>
                  {item.itemCount} бараа ·{' '}
                  {new Date(item.createdAt).toLocaleTimeString('mn-MN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={{ color: '#94A3B8', fontSize: 11 }}>
                {METHOD_LABEL[item.paymentMethod] ?? item.paymentMethod}
              </Text>
              <Text
                style={{
                  color: item.status === 'completed' ? '#10B981' : '#EF4444',
                  fontSize: 14,
                  fontWeight: '700',
                  textDecorationLine: dimmed ? 'line-through' : 'none',
                }}
              >
                {item.total.toLocaleString()}₮
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
