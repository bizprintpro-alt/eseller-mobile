import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../src/features/herder/api';
import type { ApplicationStatus } from '../../src/features/herder/types';
import { C, R } from '../../src/shared/design';

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending:      'Хүлээгдэж',
  under_review: 'Хянагдаж',
  approved:     'Баталгаажсан',
  rejected:     'Татгалзсан',
};

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  pending:      C.gold,
  under_review: C.primary,
  approved:     C.success,
  rejected:     C.error,
};

const FILTERS: Array<ApplicationStatus | 'all'> = ['pending', 'under_review', 'approved', 'rejected', 'all'];
const FILTER_LABEL: Record<ApplicationStatus | 'all', string> = {
  ...STATUS_LABEL,
  all: 'Бүгд',
};

export default function CoordinatorApplications() {
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('pending');

  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: ['coordinator', 'applications', filter],
    queryFn:  () => HerderAPI.coordinator.applications.list({ status: filter }),
  });

  const apps = data?.applications ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Өргөдөл</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>Нийт {data?.total ?? 0}</Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
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
              {FILTER_LABEL[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={apps}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.herder} />}
        renderItem={({ item: a }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/(coordinator)/application/[id]', params: { id: a.id } } as never)
            }
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
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 15 }}>{a.herderName}</Text>
              <View
                style={{
                  backgroundColor: STATUS_COLOR[a.status] + '22',
                  borderRadius: R.full,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ color: STATUS_COLOR[a.status], fontSize: 11, fontWeight: '700' }}>
                  {STATUS_LABEL[a.status]}
                </Text>
              </View>
            </View>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 4 }}>
              {a.provinceName} · {a.district} · {a.phone}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: C.textMuted, fontSize: 11 }}>
                {new Date(a.createdAt).toLocaleDateString('mn-MN')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="document-text-outline" size={48} color={C.textMuted} />
              <Text style={{ color: C.textSub, marginTop: 12 }}>Өргөдөл байхгүй</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
