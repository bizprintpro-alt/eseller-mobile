import { View, Text, FlatList, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../src/features/herder/api';
import { C, R } from '../../src/shared/design';

/**
 * Roster of approved herders inside the coordinator's province scope.
 * Tapping a row opens the public herder profile so the coordinator can
 * see what a buyer sees. Phone chip dials directly.
 */
export default function CoordinatorHerders() {
  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: ['coordinator', 'herders'],
    queryFn:  () => HerderAPI.coordinator.herders.list(),
  });

  const herders = data?.herders ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Малчид</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>Идэвхтэй {data?.total ?? 0}</Text>
      </View>

      <FlatList
        data={herders}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.herder} />}
        renderItem={({ item: h }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/herder-profile/${h.id}` as never)}
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
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ color: C.text, fontWeight: '800', fontSize: 15 }}>{h.herderName}</Text>
                <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>
                  {h.province} · {h.district}
                </Text>
              </View>
              {h.isVerified && (
                <View
                  style={{
                    backgroundColor: C.success + '22',
                    borderRadius: R.full,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: C.success, fontSize: 10, fontWeight: '700' }}>✓ Баталгаажсан</Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <Stat label="Бараа" value={String(h.productCount)} />
              <Stat label="Захиалга" value={String(h.orderCount)} />
              <Stat label="Үнэлгээ" value={h.rating.toFixed(1)} />
              <Stat label="Цагт" value={`${Math.round(h.onTimeRate * 100)}%`} />
            </View>

            {h.phone ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${h.phone}`)}
                hitSlop={6}
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: 'flex-start',
                }}
              >
                <Ionicons name="call" size={14} color={C.herder} />
                <Text style={{ color: C.herder, fontSize: 13, fontWeight: '700' }}>{h.phone}</Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="people-outline" size={48} color={C.textMuted} />
              <Text style={{ color: C.textSub, marginTop: 12 }}>Идэвхтэй малчин алга</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: C.textMuted, fontSize: 10, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 14, fontWeight: '800', marginTop: 2 }}>{value}</Text>
    </View>
  );
}
