import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export default function UserPublicProfile() {
  const { username } = useLocalSearchParams<{ username: string }>();

  const { data: user } = useQuery<any>({
    queryKey: ['user', username],
    queryFn: async () => unwrap<any>(await get(`/users/${username}`)),
    enabled: !!username,
    retry: false,
  });

  return (
    <>
      <Stack.Screen options={{ title: user?.name ?? username ?? '', headerBackTitle: '' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#121212' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <View
          style={{
            backgroundColor: '#1E1E1E',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,.07)',
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#312E81',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 24, color: '#fff', fontWeight: '900' }}>
              {user?.name?.[0] ?? '?'}
            </Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: '900', color: '#fff' }}>
            {user?.name ?? username}
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
            @{username}
          </Text>
          {user?.tier && (
            <View
              style={{
                backgroundColor: '#1C1400',
                borderRadius: 99,
                paddingHorizontal: 12,
                paddingVertical: 3,
                marginTop: 8,
                borderWidth: 0.5,
                borderColor: '#78350F',
              }}
            >
              <Text style={{ color: '#FDE68A', fontSize: 11, fontWeight: '700' }}>
                ⭐ {user.tier}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Захиалга', value: user?.orderCount ?? 0 },
            { label: 'Зар', value: user?.feedCount ?? 0 },
            { label: 'Дагагчид', value: user?.followers ?? 0 },
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: '#1E1E1E',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,.07)',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff' }}>
                {String(s.value)}
              </Text>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {(user?.recentFeeds ?? []).length > 0 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 10 }}>
              Сүүлийн зарууд
            </Text>
            {user.recentFeeds.map((f: any) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => router.push(`/feed/${f.id}` as any)}
                style={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,.07)',
                }}
              >
                <Text style={{ fontSize: 13, color: '#fff', fontWeight: '600' }}>{f.title}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
                  {f.price?.toLocaleString?.() ?? 0}₮
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}
