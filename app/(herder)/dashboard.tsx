import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../src/features/herder/api';
import { C, R, F } from '../../src/shared/design';
import { LogoutButton } from '../components/LogoutButton';

/**
 * Seller-side landing page for approved herders.
 * Summarizes earnings + product/order counts; deep-links into the other tabs.
 */
export default function HerderDashboard() {
  const earnings = useQuery({
    queryKey: ['herder', 'my', 'earnings'],
    queryFn:  () => HerderAPI.my.earnings(),
  });

  const products = useQuery({
    queryKey: ['herder', 'my', 'products', 'count'],
    queryFn:  () => HerderAPI.my.products.list({ limit: 1 }),
  });

  const orders = useQuery({
    queryKey: ['herder', 'my', 'orders', 'pending'],
    queryFn:  () => HerderAPI.my.orders.list({ status: 'pending', limit: 1 }),
  });

  const refetchAll = () => {
    earnings.refetch();
    products.refetch();
    orders.refetch();
  };

  const summary = earnings.data;
  const CARDS = [
    {
      icon: 'cash' as const,
      label: 'Хүлээн авсан',
      value: (summary?.released.total ?? 0).toLocaleString() + '₮',
      color: C.success,
    },
    {
      icon: 'lock-closed' as const,
      label: 'Escrow-д',
      value: (summary?.held.total ?? 0).toLocaleString() + '₮',
      color: C.gold,
    },
    {
      icon: 'time' as const,
      label: 'Төлөгдөөгүй',
      value: (summary?.pending.total ?? 0).toLocaleString() + '₮',
      color: C.textSub,
    },
    {
      icon: 'cube' as const,
      label: 'Бараа',
      value: String(products.data?.total ?? 0),
      color: C.herder,
    },
  ];

  const pendingOrders = orders.data?.total ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={
        <RefreshControl
          refreshing={earnings.isRefetching || products.isRefetching || orders.isRefetching}
          onRefresh={refetchAll}
          tintColor={C.herder}
        />
      }
    >
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Малчны самбар</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
          Малчнаас шууд — бүтээгдэхүүн, захиалга, орлого
        </Text>
      </View>

      {pendingOrders > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/(herder)/orders' as never)}
          style={{
            marginHorizontal: 12,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: C.goldDim,
            borderRadius: R.lg,
            padding: 14,
            borderWidth: 0.5,
            borderColor: C.gold + '55',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="alert-circle" size={20} color={C.gold} />
            <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700' }}>
              {pendingOrders} шинэ захиалга хүлээгдэж байна
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.gold} />
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10 }}>
        {CARDS.map((c, i) => (
          <View
            key={i}
            style={{
              width: '47%',
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: c.color,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Ionicons name={c.icon} size={24} color={c.color} />
            <Text style={{ color: c.color, fontSize: 20, fontWeight: '900', marginTop: 8 }}>
              {c.value}
            </Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ margin: 12 }}>
        <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>Хурдан үйлдэл</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push('/(herder)/listing-form' as never)}
            style={{
              flex: 1,
              backgroundColor: C.herder,
              borderRadius: R.lg,
              padding: 16,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
              Бараа нэмэх
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(herder)/listings' as never)}
            style={{
              flex: 1,
              backgroundColor: C.bgSection,
              borderRadius: R.lg,
              padding: 16,
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Ionicons name="list" size={24} color={C.herder} />
            <Text style={{ color: C.text, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
              Барааны жагсаалт
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ margin: 12, marginTop: 4 }}>
        <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>Сүүлийн тооцоо</Text>
        {(summary?.recentPayouts ?? []).slice(0, 5).map((p) => (
          <View
            key={p._id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              padding: 14,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View>
              <Text style={{ color: C.text, fontWeight: '600' }}>#{p.orderNumber}</Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                {p.escrow?.releasedAt
                  ? new Date(p.escrow.releasedAt).toLocaleDateString('mn-MN')
                  : ''}
              </Text>
            </View>
            <Text style={{ color: C.secondary, fontWeight: '800', fontSize: 16 }}>
              +{(p.escrow?.holdAmount ?? 0).toLocaleString()}₮
            </Text>
          </View>
        ))}
        {!summary?.recentPayouts?.length && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="wallet-outline" size={40} color={C.textMuted} />
            <Text style={{ color: C.textSub, marginTop: 8 }}>Одоогоор орлого байхгүй</Text>
          </View>
        )}
      </View>

      <LogoutButton />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
