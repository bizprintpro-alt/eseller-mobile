import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Хүлээгдэж байна', color: '#854F0B', bg: '#FAEEDA' },
  confirmed: { label: 'Баталгаажсан', color: '#185FA5', bg: '#E6F1FB' },
  preparing: { label: 'Бэлтгэж байна', color: '#534AB7', bg: '#EEEDFE' },
  ready: { label: 'Бэлэн', color: '#0F6E56', bg: '#E1F5EE' },
  handed_to_driver: { label: 'Жолоочид өгсөн', color: '#854F0B', bg: '#FAEEDA' },
  delivering: { label: 'Хүргэж байна', color: '#185FA5', bg: '#E6F1FB' },
  delivered: { label: 'Хүргэгдсэн', color: '#3B6D11', bg: '#EAF3DE' },
  cancelled: { label: 'Цуцлагдсан', color: '#A32D2D', bg: '#FCEBEB' },
};

export default function OrdersScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery<any>({
    queryKey: ['buyer-orders'],
    queryFn: () => get('/buyer/orders'),
  });

  // Response: { success, data: [...] } — interceptor returns res.data
  const orders: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#1B3A5C" />
      </View>
    );
  }

  // Сүлжээ / 500 алдаа. Хоосон жагсаалттай адил харуулахгүй —
  // retry товч заавал өгнө.
  if (isError) {
    return (
      <View style={s.screen}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Миний захиалгууд</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={[s.center, { padding: 24 }]}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
          <Text style={s.emptyTitle}>Захиалга татахад алдаа гарлаа</Text>
          <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
            Сүлжээгээ шалгаад дахин оролдоно уу
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={s.shopBtn}>
            <Text style={s.shopBtnText}>Дахин оролдох</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Миний захиалгууд</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o._id || o.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={
          orders.length === 0
            ? { flex: 1, alignItems: 'center', justifyContent: 'center' }
            : { padding: 12, gap: 10 }
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={s.emptyTitle}>Захиалга байхгүй</Text>
            <TouchableOpacity onPress={() => router.push('/' as any)} style={s.shopBtn}>
              <Text style={s.shopBtnText}>Дэлгүүр харах</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: o }) => {
          const st = STATUS[o.status] || { label: o.status, color: '#888', bg: '#f0f0f0' };
          const items: any[] = Array.isArray(o.items) ? o.items : [];
          const first = items[0] || {};
          return (
            <TouchableOpacity
              onPress={() => router.push(`/order/${o._id || o.id}` as any)}
              style={s.card}
            >
              <View style={s.cardHeader}>
                <Text style={s.orderId}>#{(o._id || o.id).toString().slice(-6).toUpperCase()}</Text>
                <View style={[s.badge, { backgroundColor: st.bg }]}>
                  <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={s.cardBody}>
                {first.image ? (
                  <Image source={{ uri: first.image }} style={s.thumb} />
                ) : (
                  <View style={[s.thumb, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 24 }}>📦</Text>
                  </View>
                )}
                <View style={s.cardInfo}>
                  <Text style={s.productName} numberOfLines={1}>
                    {first.name || 'Бараа'}
                    {items.length > 1 ? ` +${items.length - 1}` : ''}
                  </Text>
                  <Text style={s.total}>{(o.total || 0).toLocaleString()}₮</Text>
                  <Text style={s.date}>{new Date(o.createdAt).toLocaleDateString('mn-MN')}</Text>
                </View>
                <Text style={{ color: '#aaa' }}>›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#1B3A5C', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16, paddingTop: 52,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  shopBtn: { backgroundColor: '#1B3A5C', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#e5e5e5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 13, fontWeight: '600', color: '#1B3A5C' },
  badge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#f0f0f0' },
  cardInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  total: { fontSize: 14, fontWeight: '700', color: '#1B3A5C', marginTop: 2 },
  date: { fontSize: 11, color: '#aaa', marginTop: 2 },
});
