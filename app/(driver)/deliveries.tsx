import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { get, post } from '../../src/services/api';
import { RoleSwitcherBar } from '../../src/shared/ui/RoleSwitcherBar';
import { LogoutButton } from '../components/LogoutButton';

export default function DriverDeliveriesScreen() {
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const qc = useQueryClient();

  const [isFocused, setIsFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const { data, isRefetching, refetch, isLoading } = useQuery<any>({
    queryKey: ['driver-orders', tab],
    queryFn: () => get(`/driver/orders?type=${tab}`),
    refetchInterval: isFocused ? 10000 : false,
  });

  const accept = useMutation({
    mutationFn: (id: string) => post(`/driver/orders/${id}/accept`),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ['driver-orders'] });
      setTab('mine');
    },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const deliver = useMutation({
    mutationFn: (id: string) => post(`/driver/orders/${id}/deliver`),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅', 'Хүргэлт амжилттай дуусгалаа!');
      qc.invalidateQueries({ queryKey: ['driver-orders'] });
      setTab('available');
    },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const orders: any[] = data?.data?.orders || data?.orders || [];

  return (
    <View style={s.screen}>
      <View style={{ paddingTop: 44 }}>
        <RoleSwitcherBar />
      </View>
      <View style={[s.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={s.headerTitle}>🚚 Хүргэлтийн самбар</Text>
        <LogoutButton variant="icon" />
      </View>

      <View style={s.tabs}>
        <TouchableOpacity onPress={() => setTab('available')} style={[s.tab, tab === 'available' && s.tabActive]}>
          <Text style={[s.tabText, tab === 'available' && s.tabTextActive]}>📦 Авах боломжтой</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('mine')} style={[s.tab, tab === 'mine' && s.tabActive]}>
          <Text style={[s.tabText, tab === 'mine' && s.tabTextActive]}>🚚 Миний хүргэлт</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#1B3A5C" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o: any) => o.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={
            orders.length === 0
              ? { flex: 1, alignItems: 'center', justifyContent: 'center' }
              : { padding: 12, gap: 10 }
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>{tab === 'available' ? '📭' : '✅'}</Text>
              <Text style={{ color: '#888', fontSize: 14 }}>
                {tab === 'available' ? 'Авах захиалга байхгүй' : 'Идэвхтэй хүргэлт байхгүй'}
              </Text>
            </View>
          }
          renderItem={({ item: o }: any) => {
            const items: any[] = Array.isArray(o.items) ? o.items : [];
            const buyer = o.buyer;
            const shop = o.shop;
            return (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.orderId}>#{o.id.toString().slice(-6).toUpperCase()}</Text>
                  <Text style={s.total}>{(o.total || 0).toLocaleString()}₮</Text>
                </View>

                {shop && <Text style={s.info}>🏪 {shop.name}</Text>}
                {buyer && <Text style={s.info}>👤 {buyer.name || 'Хэрэглэгч'}</Text>}
                {buyer?.phone && <Text style={s.info}>📞 {buyer.phone}</Text>}
                {o.deliveryAddress && <Text style={s.info} numberOfLines={2}>📍 {o.deliveryAddress}</Text>}

                <Text style={s.items} numberOfLines={2}>
                  {items.map((i: any) => `${i.name || 'Бараа'} ×${i.quantity || 1}`).join(', ')}
                </Text>

                {tab === 'available' && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Захиалга авах уу?',
                        `#${o.id.toString().slice(-6).toUpperCase()}`,
                        [
                          { text: 'Болих', style: 'cancel' },
                          { text: 'Авах', onPress: () => accept.mutate(o.id) },
                        ]
                      )
                    }
                    disabled={accept.isPending}
                    style={s.acceptBtn}
                  >
                    <Text style={s.acceptBtnText}>📦 Захиалга авах</Text>
                  </TouchableOpacity>
                )}

                {tab === 'mine' && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Хүргэлт дуусгах уу?',
                        'Хэрэглэгч хүлээн авсан уу?',
                        [
                          { text: 'Болих', style: 'cancel' },
                          { text: 'Тийм, хүргэлээ', onPress: () => deliver.mutate(o.id) },
                        ]
                      )
                    }
                    disabled={deliver.isPending}
                    style={[s.acceptBtn, { backgroundColor: '#3B6D11' }]}
                  >
                    <Text style={s.acceptBtnText}>✅ Хүргэлт дуусгах</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: '#1B3A5C', padding: 16, paddingTop: 52 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e5e5e5' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1B3A5C' },
  tabText: { fontSize: 12, color: '#888' },
  tabTextActive: { color: '#1B3A5C', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#e5e5e5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 13, fontWeight: '600', color: '#1B3A5C' },
  total: { fontSize: 14, fontWeight: '700', color: '#1B3A5C' },
  info: { fontSize: 12, color: '#555', marginBottom: 3 },
  items: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 10 },
  acceptBtn: { backgroundColor: '#1B3A5C', borderRadius: 8, padding: 12, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
