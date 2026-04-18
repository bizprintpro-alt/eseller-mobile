import { ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export default function SellerPublicProfile() {
  const { username } = useLocalSearchParams<{ username: string }>();

  const { data: seller } = useQuery<any>({
    queryKey: ['seller', username],
    queryFn: async () => unwrap<any>(await get(`/seller/${username}`)),
    enabled: !!username,
    retry: false,
  });

  const SOCIALS: { icon: string; key: 'instagram' | 'tiktok' | 'facebook'; base: string }[] = [
    { icon: '📸', key: 'instagram', base: 'https://instagram.com/' },
    { icon: '🎵', key: 'tiktok', base: 'https://tiktok.com/@' },
    { icon: '📘', key: 'facebook', base: 'https://facebook.com/' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: seller?.name ?? 'Борлуулагч', headerBackTitle: '' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#121212' }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View
          style={{
            backgroundColor: '#2D1B69',
            padding: 24,
            alignItems: 'center',
            paddingTop: 32,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#7C3AED',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 28, color: '#fff', fontWeight: '900' }}>
              {seller?.name?.[0] ?? 'S'}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>
            {seller?.name ?? username}
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
            @{username}
          </Text>
          <View
            style={{
              backgroundColor: '#4C1D95',
              borderRadius: 99,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 8,
            }}
          >
            <Text style={{ color: '#C4B5FD', fontSize: 11, fontWeight: '700' }}>
              📢 {seller?.tier ?? 'Борлуулагч'}
            </Text>
          </View>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Борлуулалт', value: seller?.totalSales ?? 0 },
              { label: 'Комисс %', value: `${seller?.commissionRate ?? 5}%` },
              { label: 'Рейтинг', value: `⭐${seller?.rating ?? '—'}` },
            ].map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: '#1E1E1E',
                  borderRadius: 14,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,.07)',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#C4B5FD' }}>
                  {String(s.value)}
                </Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {seller?.referralCode && (
            <TouchableOpacity
              onPress={() => router.push(`/storefront/${seller.referralCode}` as any)}
              style={{
                backgroundColor: '#1E1B4B',
                borderRadius: 14,
                padding: 14,
                borderWidth: 0.5,
                borderColor: '#4338CA',
              }}
            >
              <Text style={{ fontSize: 11, color: '#A5B4FC', fontWeight: '600', marginBottom: 4 }}>
                Referral линк
              </Text>
              <Text style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                eseller.mn/ref/{seller.referralCode}
              </Text>
            </TouchableOpacity>
          )}

          {SOCIALS.filter((s) => seller?.[s.key]).map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={() => Linking.openURL(`${s.base}${seller[s.key]}`)}
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 12,
                padding: 13,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,.07)',
              }}
            >
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              <Text style={{ fontSize: 13, color: '#A5B4FC', fontWeight: '600' }}>
                @{seller[s.key]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
