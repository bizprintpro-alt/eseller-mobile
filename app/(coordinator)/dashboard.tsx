import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../src/features/herder/api';
import { C, R, F } from '../../src/shared/design';
import { LogoutButton } from '../components/LogoutButton';

/**
 * Coordinator landing page — application funnel at a glance, sales rollup,
 * deep-links into the applications queue.
 */
export default function CoordinatorDashboard() {
  const stats = useQuery({
    queryKey: ['coordinator', 'stats'],
    queryFn:  () => HerderAPI.coordinator.stats(),
  });

  const pendingApps = useQuery({
    queryKey: ['coordinator', 'applications', 'pending-preview'],
    queryFn:  () => HerderAPI.coordinator.applications.list({ status: 'pending', limit: 3 }),
  });

  const refetchAll = () => {
    stats.refetch();
    pendingApps.refetch();
  };

  const s = stats.data;
  const scopeLabel = Array.isArray(s?.scope) ? s.scope.join(', ') : 'Бүх аймаг';

  const CARDS = [
    {
      icon:  'hourglass' as const,
      label: 'Хүлээгдэж',
      value: s?.applications.pending ?? 0,
      color: C.gold,
      route: '/(coordinator)/applications',
    },
    {
      icon:  'eye' as const,
      label: 'Хянагдаж',
      value: s?.applications.underReview ?? 0,
      color: C.primary,
      route: '/(coordinator)/applications',
    },
    {
      icon:  'checkmark-circle' as const,
      label: 'Идэвхтэй малчин',
      value: s?.herders.active ?? 0,
      color: C.success,
      route: '/(coordinator)/herders',
    },
    {
      icon:  'close-circle' as const,
      label: 'Татгалзсан',
      value: s?.applications.rejected ?? 0,
      color: C.error,
      route: '/(coordinator)/applications',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={
        <RefreshControl
          refreshing={stats.isRefetching || pendingApps.isRefetching}
          onRefresh={refetchAll}
          tintColor={C.herder}
        />
      }
    >
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Координатор</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
          Хариуцах аймаг: {scopeLabel}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 10 }}>
        {CARDS.map((c) => (
          <TouchableOpacity
            key={c.label}
            onPress={() => router.push(c.route as never)}
            activeOpacity={0.7}
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
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={{
          margin: 12,
          padding: 14,
          backgroundColor: C.bgCard,
          borderRadius: R.lg,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <Text style={{ ...F.h4, color: C.text, marginBottom: 8 }}>Борлуулалт</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: C.textSub, fontSize: 12 }}>Хүргэгдсэн захиалга</Text>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginTop: 4 }}>
              {s?.sales.count ?? 0}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: C.textSub, fontSize: 12 }}>Нийт дүн</Text>
            <Text style={{ color: C.herder, fontSize: 18, fontWeight: '900', marginTop: 4 }}>
              {(s?.sales.total ?? 0).toLocaleString()}₮
            </Text>
          </View>
        </View>
      </View>

      <View style={{ margin: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ ...F.h4, color: C.text }}>Хүлээгдэж буй өргөдөл</Text>
          {(pendingApps.data?.total ?? 0) > 3 && (
            <TouchableOpacity onPress={() => router.push('/(coordinator)/applications' as never)}>
              <Text style={{ color: C.herder, fontWeight: '700', fontSize: 13 }}>Бүгд →</Text>
            </TouchableOpacity>
          )}
        </View>
        {(pendingApps.data?.applications ?? []).map((a) => (
          <TouchableOpacity
            key={a.id}
            onPress={() =>
              router.push({ pathname: '/(coordinator)/application/[id]', params: { id: a.id } } as never)
            }
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
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: C.text, fontWeight: '700' }}>{a.herderName}</Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                {a.provinceName} · {a.district}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </TouchableOpacity>
        ))}
        {!pendingApps.data?.applications.length && (
          <View style={{ alignItems: 'center', padding: 30 }}>
            <Ionicons name="checkmark-done" size={36} color={C.textMuted} />
            <Text style={{ color: C.textSub, marginTop: 8 }}>Хүлээгдэж буй өргөдөл алга</Text>
          </View>
        )}
      </View>

      <LogoutButton />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
