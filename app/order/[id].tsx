import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { OrderAPI } from '../../src/services/api';
import { C, R } from '../../src/shared/design';

const STATUS_STEPS = [
  { key: 'pending', label: 'Хүлээгдэж', icon: 'time-outline' as const },
  { key: 'confirmed', label: 'Баталгаажсан', icon: 'checkmark-circle-outline' as const },
  { key: 'preparing', label: 'Бэлтгэж', icon: 'construct-outline' as const },
  { key: 'ready', label: 'Бэлэн', icon: 'cube-outline' as const },
  { key: 'delivering', label: 'Хүргэж', icon: 'car-outline' as const },
  { key: 'delivered', label: 'Хүргэгдсэн', icon: 'checkmark-done-outline' as const },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQuery<any>({
    queryKey: ['order', id],
    queryFn: () => OrderAPI.detail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.brand} />
      </View>
    );
  }

  const order = (data as any)?.data?.order || (data as any)?.order || data;
  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.textMuted }}>Захиалга олдсонгүй</Text>
      </View>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ paddingTop: 52, padding: 16, backgroundColor: C.bgCard, borderBottomWidth: 0.5, borderBottomColor: C.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 13, color: C.textSub }}>Захиалгын дугаар</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>
          #{(order.orderNumber || order.id).toString().slice(-6).toUpperCase()}
        </Text>
      </View>

      {/* Status timeline */}
      <View style={{ backgroundColor: C.bgCard, margin: 12, borderRadius: R.lg, padding: 14, borderWidth: 0.5, borderColor: C.border }}>
        <Text style={{ color: C.text, fontWeight: '700', marginBottom: 12 }}>Захиалгын явц</Text>
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentStepIdx;
          return (
            <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: done ? C.brand : C.bgSection,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name={step.icon} size={14} color={done ? '#fff' : C.textMuted} />
              </View>
              <Text style={{ color: done ? C.text : C.textMuted, marginLeft: 10, fontSize: 13, fontWeight: done ? '600' : '400' }}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Items */}
      <View style={{ backgroundColor: C.bgCard, margin: 12, marginTop: 0, borderRadius: R.lg, padding: 14, borderWidth: 0.5, borderColor: C.border }}>
        <Text style={{ color: C.text, fontWeight: '700', marginBottom: 10 }}>Барааны жагсаалт</Text>
        {items.map((item: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: C.text, flex: 1, fontSize: 13 }} numberOfLines={1}>
              {item.name || 'Бараа'} × {item.quantity || 1}
            </Text>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>
              {((item.price || 0) * (item.quantity || 1)).toLocaleString()}₮
            </Text>
          </View>
        ))}
        <View style={{ height: 0.5, backgroundColor: C.border, marginVertical: 10 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: C.text, fontWeight: '700' }}>Нийт</Text>
          <Text style={{ color: C.brand, fontWeight: '800', fontSize: 16 }}>
            {(order.total || 0).toLocaleString()}₮
          </Text>
        </View>
      </View>

      {/* Delivery */}
      {order.deliveryAddress && (
        <View style={{ backgroundColor: C.bgCard, margin: 12, marginTop: 0, borderRadius: R.lg, padding: 14, borderWidth: 0.5, borderColor: C.border }}>
          <Text style={{ color: C.text, fontWeight: '700', marginBottom: 6 }}>Хүргэлтийн хаяг</Text>
          <Text style={{ color: C.textSub, fontSize: 13 }}>{order.deliveryAddress}</Text>
        </View>
      )}

      {/* Driver */}
      {order.driver && (
        <View style={{ backgroundColor: C.bgCard, margin: 12, marginTop: 0, borderRadius: R.lg, padding: 14, borderWidth: 0.5, borderColor: C.border }}>
          <Text style={{ color: C.text, fontWeight: '700', marginBottom: 8 }}>Жолооч</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: C.text, fontSize: 14 }}>{order.driver.name}</Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{order.driver.phone}</Text>
            </View>
            {order.driver.phone && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${order.driver.phone}`)}
                style={{ backgroundColor: C.brand, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>📞 Залгах</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Review (DELIVERED only) */}
      {order.status === 'delivered' && !order.hasReview && (
        <TouchableOpacity
          onPress={() => router.push(`/review/${order.id}` as any)}
          style={{
            marginHorizontal: 12, marginTop: 4,
            backgroundColor: '#FEF9C3', borderRadius: 12,
            padding: 14, alignItems: 'center',
            borderWidth: 0.5, borderColor: '#FDE68A',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E' }}>
            ⭐ Үнэлгээ өгөх
          </Text>
        </TouchableOpacity>
      )}

      {/* Receipt */}
      <TouchableOpacity
        onPress={() => router.push(`/receipt/${order.id}` as any)}
        style={{
          marginHorizontal: 12, marginTop: 8,
          backgroundColor: '#EEF2FF', borderRadius: 12,
          padding: 14, alignItems: 'center',
          borderWidth: 0.5, borderColor: '#C7D2FE',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#3730A3' }}>
          📄 Баримт харах
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
