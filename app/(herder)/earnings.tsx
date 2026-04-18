import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../src/features/herder/api';
import { C, R, F } from '../../src/shared/design';

/**
 * Earnings tab — minimal view of the three escrow buckets and recent payouts.
 * Expanded reporting (monthly breakdown, export) arrives in M6.
 */
export default function HerderEarnings() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['herder', 'my', 'earnings'],
    queryFn:  () => HerderAPI.my.earnings(),
  });

  const BUCKETS = [
    {
      icon:  'checkmark-circle' as const,
      label: 'Хүлээн авсан',
      hint:  'Таны дансанд шилжсэн',
      total: data?.released.total ?? 0,
      count: data?.released.count ?? 0,
      color: C.success,
    },
    {
      icon:  'lock-closed' as const,
      label: 'Escrow-д хадгалагдаж байна',
      hint:  'Хүргэлт баталгаажаад 48 цагийн дараа суллагдана',
      total: data?.held.total ?? 0,
      count: data?.held.count ?? 0,
      color: C.gold,
    },
    {
      icon:  'time' as const,
      label: 'Төлөгдөөгүй',
      hint:  'Худалдан авагчаас төлбөр хүлээж байна',
      total: data?.pending.total ?? 0,
      count: data?.pending.count ?? 0,
      color: C.textSub,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.herder} />}
    >
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Орлого</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
          Платформын хураамж: {data?.commissionRate ?? 10}%
        </Text>
      </View>

      <View style={{ padding: 12, gap: 10 }}>
        {BUCKETS.map((b) => (
          <View
            key={b.label}
            style={{
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: b.color,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name={b.icon} size={22} color={b.color} />
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, flex: 1 }}>
                {b.label}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 12 }}>{b.count} захиалга</Text>
            </View>
            <Text style={{ color: b.color, fontSize: 24, fontWeight: '900', marginTop: 8 }}>
              {b.total.toLocaleString()}₮
            </Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>{b.hint}</Text>
          </View>
        ))}
      </View>

      <View style={{ margin: 12 }}>
        <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>Сүүлийн тооцоо</Text>
        {(data?.recentPayouts ?? []).map((p) => (
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
            <Text style={{ color: C.success, fontWeight: '800', fontSize: 16 }}>
              +{(p.escrow?.holdAmount ?? 0).toLocaleString()}₮
            </Text>
          </View>
        ))}
        {!data?.recentPayouts?.length && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="wallet-outline" size={40} color={C.textMuted} />
            <Text style={{ color: C.textSub, marginTop: 8 }}>Одоогоор тооцоо байхгүй</Text>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
