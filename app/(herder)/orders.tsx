import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../src/features/herder/api';
import type { HerderOrderStatus } from '../../src/features/herder/types';
import { C, R } from '../../src/shared/design';

/**
 * Orders list. Tap a card → order detail where the status transition and
 * tracking note live. Filtering stays client-agnostic so "all" tab acts
 * as the source of truth the detail screen can read from query cache.
 */

const STATUS_LABEL: Record<HerderOrderStatus, string> = {
  pending:   'Хүлээгдэж',
  confirmed: 'Баталгаажсан',
  preparing: 'Бэлтгэж',
  shipped:   'Илгээсэн',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцалсан',
};

const STATUS_COLOR: Record<HerderOrderStatus, string> = {
  pending:   C.gold,
  confirmed: C.primary,
  preparing: C.secondary,
  shipped:   C.herder,
  delivered: C.success,
  cancelled: C.error,
};

export default function HerderOrders() {
  const [filter, setFilter] = useState<HerderOrderStatus | 'all'>('all');

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['herder', 'my', 'orders', filter],
    queryFn:  () => HerderAPI.my.orders.list(filter === 'all' ? {} : { status: filter }),
  });

  const orders = data?.orders ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Захиалга</Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'confirmed', 'preparing', 'shipped'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: R.full,
              backgroundColor: filter === f ? C.herder : C.bgSection,
              borderWidth: 1,
              borderColor: filter === f ? C.herder : C.border,
            }}
          >
            <Text
              style={{
                color: filter === f ? '#fff' : C.text,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {f === 'all' ? 'Бүгд' : STATUS_LABEL[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.herder} />}
        renderItem={({ item: o }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(herder)/order/[id]', params: { id: o._id } } as never)}
            activeOpacity={0.7}
            style={{
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              padding: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 15 }}>
                #{o.orderNumber}
              </Text>
              <View
                style={{
                  backgroundColor: STATUS_COLOR[o.status] + '22',
                  borderRadius: R.full,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ color: STATUS_COLOR[o.status], fontSize: 11, fontWeight: '700' }}>
                  {STATUS_LABEL[o.status]}
                </Text>
              </View>
            </View>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>
              {o.buyer?.name ?? 'Үйлчлүүлэгч'} · {o.delivery?.address?.district ?? ''}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 }}>
              <Text style={{ color: C.herder, fontSize: 16, fontWeight: '900' }}>
                {o.total.toLocaleString()}₮
              </Text>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </View>
            {o.delivery?.requiresColdChain && (
              <View
                style={{
                  backgroundColor: C.primaryDim,
                  borderRadius: R.full,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  alignSelf: 'flex-start',
                  marginTop: 6,
                }}
              >
                <Text style={{ color: C.primary, fontSize: 11, fontWeight: '700' }}>
                  ❄ Хүйтэн сүлжээ
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="receipt-outline" size={48} color={C.textMuted} />
            <Text style={{ color: C.textSub, marginTop: 12 }}>Захиалга байхгүй</Text>
          </View>
        }
      />
    </View>
  );
}
