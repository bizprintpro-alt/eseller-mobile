import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { get, put } from '../../src/services/api';

const TABS = [
  { key: '', label: 'Бүгд' },
  { key: 'confirmed', label: 'Шинэ' },
  { key: 'preparing', label: 'Бэлтгэж' },
  { key: 'ready', label: 'Бэлэн' },
  { key: 'handed_to_driver', label: 'Явсан' },
  { key: 'delivered', label: 'Хүргэгдсэн' },
];

const NEXT_STATUS: Record<string, { label: string; next: string }> = {
  confirmed: { label: '▶ Бэлтгэж эхлэх', next: 'preparing' },
  preparing: { label: '✓ Бэлэн болсон', next: 'ready' },
  ready: { label: '🚚 Жолоочид өгсөн', next: 'handed_to_driver' },
};

export default function OwnerOrdersScreen() {
  const [tab, setTab] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const qc = useQueryClient();

  // Screen blur үед 15с-ийн refetch loop-ыг зогсооно — background data burn
  // хийхгүй, мөн navigate буцахад шинэ data автоматаар авна.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const { data, isRefetching, refetch } = useQuery<any>({
    queryKey: ['seller-orders', tab],
    queryFn: () => get(`/orders${tab ? `?status=${tab}` : ''}`),
    refetchInterval: isFocused ? 15000 : false,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ['seller-orders'] });
    },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const orders: any[] = data?.data?.orders || data?.orders || [];

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Захиалгууд</Text>
      </View>

      <FlatList
        horizontal
        data={TABS}
        keyExtractor={(t) => t.key || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabRow}
        renderItem={({ item: t }) => (
          <TouchableOpacity
            onPress={() => setTab(t.key)}
            style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
          >
            <Text style={[s.tabBtnText, tab === t.key && s.tabBtnTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={orders}
        keyExtractor={(o: any) => o.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={
          orders.length === 0
            ? { flex: 1, alignItems: 'center', justifyContent: 'center' }
            : { padding: 12, gap: 10 }
        }
        ListEmptyComponent={<Text style={{ color: '#888', fontSize: 14 }}>Захиалга байхгүй</Text>}
        renderItem={({ item: o }: any) => {
          const next = NEXT_STATUS[o.status];
          const buyer = o.buyer;
          const items: any[] = Array.isArray(o.items) ? o.items : [];
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.orderId}>#{o.id.toString().slice(-6).toUpperCase()}</Text>
                <Text style={s.orderTotal}>{(o.total || 0).toLocaleString()}₮</Text>
              </View>

              <Text style={s.buyerInfo}>
                👤 {buyer?.name || 'Хэрэглэгч'}
                {buyer?.phone ? `  📞 ${buyer.phone}` : ''}
              </Text>

              <View style={s.items}>
                {items.slice(0, 2).map((item: any, i: number) => (
                  <Text key={i} style={s.itemName} numberOfLines={1}>
                    • {item.name || 'Бараа'} × {item.quantity || 1}
                  </Text>
                ))}
                {items.length > 2 && (
                  <Text style={{ fontSize: 11, color: '#aaa' }}>+{items.length - 2} бараа...</Text>
                )}
              </View>

              {next && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Статус өөрчлөх',
                      `"${next.label}" болгох уу?`,
                      [
                        { text: 'Болих', style: 'cancel' },
                        { text: 'Тийм', onPress: () => updateStatus.mutate({ id: o.id, status: next.next }) },
                      ]
                    );
                  }}
                  disabled={updateStatus.isPending}
                  style={s.actionBtn}
                >
                  <Text style={s.actionBtnText}>{next.label}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#1B3A5C', padding: 16, paddingTop: 52 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tabRow: { padding: 10, gap: 6, flexDirection: 'row' },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#ddd' },
  tabBtnActive: { backgroundColor: '#1B3A5C', borderColor: '#1B3A5C' },
  tabBtnText: { fontSize: 12, color: '#666' },
  tabBtnTextActive: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#e5e5e5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderId: { fontSize: 13, fontWeight: '600', color: '#1B3A5C' },
  orderTotal: { fontSize: 14, fontWeight: '700', color: '#1B3A5C' },
  buyerInfo: { fontSize: 12, color: '#666', marginBottom: 8 },
  items: { gap: 4, marginBottom: 10 },
  itemName: { fontSize: 12, color: '#333' },
  actionBtn: { backgroundColor: '#1B3A5C', borderRadius: 8, padding: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
