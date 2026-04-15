import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { OrderAPI } from '../../src/services/api';
import { C, R } from '../../src/shared/design';

const METHOD_LABEL: Record<string, string> = {
  qpay: 'QPay',
  socialpay: 'SocialPay',
  card: 'Карт',
  cash: 'Бэлэн',
  wallet: 'Хэтэвч',
};

export default function ReceiptScreen() {
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

  const order: any = (data as any)?.data?.order || (data as any)?.order || data;
  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.textMuted }}>Захиалга олдсонгүй</Text>
      </View>
    );
  }

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((s, it) => s + (it.price ?? 0) * (it.quantity ?? it.qty ?? 1), 0);
  const total = order.total ?? subtotal;
  const orderId = String(order.id ?? order._id ?? id);
  const shortId = orderId.slice(-8).toUpperCase();

  async function handleShare() {
    const lines = [
      '═════════════════════════',
      '      eSeller.mn',
      '═════════════════════════',
      `Баримт: #${shortId}`,
      `Огноо: ${new Date(order.createdAt ?? Date.now()).toLocaleString('mn-MN')}`,
      '',
      ...items.map(
        (i) =>
          `${i.name ?? 'Бараа'}  ×${i.quantity ?? i.qty ?? 1}  ${((i.price ?? 0) * (i.quantity ?? i.qty ?? 1)).toLocaleString()}₮`,
      ),
      '',
      `Дүн:        ${subtotal.toLocaleString()}₮`,
      `Нийт:       ${total.toLocaleString()}₮`,
      `Төлбөр:     ${METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod ?? '—'}`,
      '',
      'Баярлалаа! eseller.mn',
    ];
    try {
      await Share.share({ message: lines.join('\n'), title: `eSeller баримт #${shortId}` });
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Хуваалцаж чадсангүй');
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 52,
          padding: 16,
          backgroundColor: C.bgCard,
          borderBottomWidth: 0.5,
          borderBottomColor: C.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '800', color: C.text, flex: 1 }}>Баримт</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={C.brand} />
        </TouchableOpacity>
      </View>

      {/* Receipt body */}
      <View
        style={{
          margin: 16,
          backgroundColor: C.bgCard,
          borderRadius: R.lg,
          padding: 20,
          borderWidth: 0.5,
          borderColor: C.border,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: C.text, textAlign: 'center' }}>
          eseller<Text style={{ color: C.brand }}>.mn</Text>
        </Text>
        <Text style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', marginTop: 2 }}>
          Монголын нэгдсэн цахим зах
        </Text>

        <Divider />

        <Row label="Баримт №" value={`#${shortId}`} />
        <Row
          label="Огноо"
          value={new Date(order.createdAt ?? Date.now()).toLocaleString('mn-MN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        <Row label="Төлбөр" value={METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod ?? '—'} />
        <Row label="Төлөв" value={order.status ?? '—'} />

        <Divider />

        <Text style={{ fontSize: 11, color: C.textMuted, fontWeight: '700', marginBottom: 8 }}>
          БАРАА
        </Text>
        {items.length === 0 ? (
          <Text style={{ color: C.textMuted, fontSize: 12 }}>Бараа байхгүй</Text>
        ) : (
          items.map((it, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 8,
                gap: 8,
              }}
            >
              <Text style={{ color: C.text, fontSize: 12, flex: 1 }} numberOfLines={2}>
                {it.name ?? 'Бараа'}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 11, width: 40, textAlign: 'right' }}>
                ×{it.quantity ?? it.qty ?? 1}
              </Text>
              <Text style={{ color: C.text, fontSize: 12, width: 90, textAlign: 'right', fontWeight: '600' }}>
                {((it.price ?? 0) * (it.quantity ?? it.qty ?? 1)).toLocaleString()}₮
              </Text>
            </View>
          ))
        )}

        <Divider />

        <Row label="Дүн" value={`${subtotal.toLocaleString()}₮`} />
        {order.deliveryFee > 0 && (
          <Row label="Хүргэлт" value={`${order.deliveryFee.toLocaleString()}₮`} />
        )}
        {order.vatAmount > 0 && (
          <Row label="НӨАТ" value={`${order.vatAmount.toLocaleString()}₮`} />
        )}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 10,
            marginTop: 6,
            borderTopWidth: 1,
            borderTopColor: C.border,
          }}
        >
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>НИЙТ</Text>
          <Text style={{ color: C.brand, fontSize: 18, fontWeight: '900' }}>
            {total.toLocaleString()}₮
          </Text>
        </View>

        {order.deliveryAddress && (
          <>
            <Divider />
            <Text style={{ fontSize: 11, color: C.textMuted, fontWeight: '700', marginBottom: 4 }}>
              ХҮРГЭЛТИЙН ХАЯГ
            </Text>
            <Text style={{ color: C.text, fontSize: 12, lineHeight: 18 }}>
              {order.deliveryAddress}
            </Text>
          </>
        )}

        <Divider />
        <Text style={{ color: C.textMuted, fontSize: 10, textAlign: 'center' }}>
          Баярлалаа! eseller.mn
        </Text>
      </View>

      {/* Share button */}
      <TouchableOpacity
        onPress={handleShare}
        style={{
          marginHorizontal: 16,
          marginBottom: 30,
          backgroundColor: C.brand,
          borderRadius: R.lg,
          padding: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Ionicons name="share-social-outline" size={18} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Баримт хуваалцах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
      <Text style={{ color: C.textSub, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 12, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: C.border,
        marginVertical: 10,
        opacity: 0.6,
      }}
    />
  );
}
