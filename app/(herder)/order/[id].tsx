import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../../src/features/herder/api';
import type { HerderOrderStatus, MyHerderOrder, MyOrdersResponse } from '../../../src/features/herder/types';
import { C, R, F } from '../../../src/shared/design';

const STATUS_LABEL: Record<HerderOrderStatus, string> = {
  pending:   'Хүлээгдэж',
  confirmed: 'Баталгаажсан',
  preparing: 'Бэлтгэж',
  shipped:   'Илгээсэн',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцалсан',
};

const STATUS_COLOR: Record<HerderOrderStatus, string> = {
  pending:   C.gold,
  confirmed: C.primary,
  preparing: C.secondary,
  shipped:   C.herder,
  delivered: C.success,
  cancelled: C.error,
};

const NEXT: Partial<Record<HerderOrderStatus, { to: HerderOrderStatus; label: string; needsNote: boolean }>> = {
  confirmed: { to: 'preparing', label: 'Бэлтгэж эхлэх',           needsNote: false },
  preparing: { to: 'shipped',   label: 'Илгээсэн гэж тэмдэглэх', needsNote: true  },
};

/**
 * Full detail view for a herder's own order. Backend does not yet expose
 * GET /my/orders/:id, so we look up the record from the paginated list
 * cache. If the user deep-links and the cache is cold, we show a spinner
 * while the list query populates — this falls back gracefully since all
 * parent screens invalidate the same query key.
 */
export default function HerderOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ to: HerderOrderStatus } | null>(null);
  const [note, setNote] = useState('');

  // Prime the cache if needed — pulls the "all" page.
  const list = useQuery({
    queryKey: ['herder', 'my', 'orders', 'all'],
    queryFn:  () => HerderAPI.my.orders.list(),
    staleTime: 30_000,
  });

  const order: MyHerderOrder | undefined = useMemo(() => {
    if (!id) return undefined;
    const caches = qc.getQueriesData<MyOrdersResponse>({ queryKey: ['herder', 'my', 'orders'] });
    for (const [, data] of caches) {
      const hit = data?.orders.find((o) => o._id === id);
      if (hit) return hit;
    }
    return list.data?.orders.find((o) => o._id === id);
  }, [id, qc, list.data]);

  const advance = useMutation({
    mutationFn: ({ to, noteText }: { to: HerderOrderStatus; noteText?: string }) =>
      HerderAPI.my.orders.updateStatus(id as string, to, noteText),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['herder', 'my', 'orders'] });
      qc.invalidateQueries({ queryKey: ['herder', 'my', 'earnings'] });
      setModal(null);
      setNote('');
    },
    onError: (e: Error) => Alert.alert('Алдаа', e.message),
  });

  if (list.isLoading && !order) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.herder} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={48} color={C.textMuted} />
        <Text style={{ color: C.textSub, marginTop: 12, textAlign: 'center' }}>
          Захиалга олдсонгүй. Жагсаалтад буцаж татна уу.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, backgroundColor: C.herder, borderRadius: R.full, paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const next = NEXT[order.status];
  const address = order.delivery?.address ?? {};
  const buyerPhone = order.buyer?.phone ?? order.delivery?.phone;

  const onNextPress = () => {
    if (!next) return;
    if (next.needsNote) {
      setModal({ to: next.to });
    } else {
      advance.mutate({ to: next.to });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: next ? 120 : 32 }}>
        <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '900' }}>
            #{order.orderNumber}
          </Text>
          <View
            style={{
              backgroundColor: STATUS_COLOR[order.status] + '22',
              borderRadius: R.full,
              paddingHorizontal: 10,
              paddingVertical: 3,
              marginLeft: 'auto',
            }}
          >
            <Text style={{ color: STATUS_COLOR[order.status], fontSize: 11, fontWeight: '700' }}>
              {STATUS_LABEL[order.status]}
            </Text>
          </View>
        </View>

        <Section title="Үйлчлүүлэгч">
          <Row label="Нэр" value={order.buyer?.name ?? '—'} />
          {buyerPhone ? (
            <Row
              label="Утас"
              value={buyerPhone}
              onPress={() => Linking.openURL(`tel:${buyerPhone}`)}
              cta="Залгах"
            />
          ) : null}
          {order.delivery?.receiver ? <Row label="Хүлээн авагч" value={order.delivery.receiver} /> : null}
        </Section>

        <Section title="Хүргэлт">
          <Row label="Аймаг" value={address.province ?? '—'} />
          <Row label="Сум / Дүүрэг" value={address.district ?? '—'} />
          {address.street ? <Row label="Хаяг" value={address.street} /> : null}
          {address.note ? <Row label="Тэмдэглэл" value={address.note} /> : null}
          {order.delivery?.requiresColdChain && (
            <View
              style={{
                backgroundColor: C.primaryDim,
                borderRadius: R.md,
                padding: 10,
                marginTop: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="snow" size={16} color={C.primary} />
              <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700' }}>
                Хүйтэн сүлжээ шаардлагатай
              </Text>
            </View>
          )}
          {order.delivery?.trackingCode ? (
            <Row label="Тракинг" value={order.delivery.trackingCode} />
          ) : null}
          {order.delivery?.shippedAt ? (
            <Row label="Илгээсэн" value={formatDate(order.delivery.shippedAt)} />
          ) : null}
          {order.delivery?.deliveredAt ? (
            <Row label="Хүргэгдсэн" value={formatDate(order.delivery.deliveredAt)} />
          ) : null}
        </Section>

        <Section title="Захиалгын агуулга">
          {order.items.map((it, idx) => (
            <View
              key={it.product + ':' + idx}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: idx === order.items.length - 1 ? 0 : 0.5,
                borderBottomColor: C.border,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>
                  {it.name}
                </Text>
                <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>
                  {it.quantity} × {it.price.toLocaleString()}₮
                </Text>
              </View>
              <Text style={{ color: C.text, fontWeight: '700' }}>
                {it.subtotal.toLocaleString()}₮
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
          <Row label="Барааны дүн" value={`${order.subtotal.toLocaleString()}₮`} />
          {order.deliveryFee > 0 ? (
            <Row label="Хүргэлт" value={`${order.deliveryFee.toLocaleString()}₮`} />
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ ...F.h4, color: C.text }}>Нийт</Text>
            <Text style={{ ...F.h4, color: C.herder }}>{order.total.toLocaleString()}₮</Text>
          </View>
        </Section>

        <Section title="Төлбөр">
          <Row label="Арга" value={order.payment.method.toUpperCase()} />
          <Row label="Төлөв" value={order.payment.status} />
          {order.payment.paidAt ? (
            <Row label="Төлсөн" value={formatDate(order.payment.paidAt)} />
          ) : null}
        </Section>

        {order.statusHistory && order.statusHistory.length > 0 ? (
          <Section title="Түүх">
            {order.statusHistory.map((e, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  paddingVertical: 6,
                  alignItems: 'flex-start',
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: STATUS_COLOR[e.status],
                    marginTop: 6,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }}>
                    {STATUS_LABEL[e.status]}
                    {e.byRole ? (
                      <Text style={{ color: C.textMuted, fontWeight: '400' }}> · {e.byRole}</Text>
                    ) : null}
                  </Text>
                  <Text style={{ color: C.textSub, fontSize: 11 }}>{formatDate(e.at)}</Text>
                  {e.note ? (
                    <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>{e.note}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </Section>
        ) : null}
      </ScrollView>

      {next && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 12,
            backgroundColor: C.bgCard,
            borderTopWidth: 0.5,
            borderTopColor: C.border,
          }}
        >
          <TouchableOpacity
            onPress={onNextPress}
            disabled={advance.isPending}
            style={{
              backgroundColor: advance.isPending ? C.textMuted : C.herder,
              borderRadius: R.lg,
              padding: 16,
              alignItems: 'center',
            }}
          >
            {advance.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{next.label}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal transparent visible={!!modal} animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 20 }}>
            <Text style={{ ...F.h3, color: C.text }}>Илгээлтийн мэдээлэл</Text>
            <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
              Үйлчлүүлэгчид харагдах тэмдэглэл (тракинг код, жолоочийн утас)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="жш: UBTR-1234, жолооч 99001234"
              placeholderTextColor={C.textMuted}
              multiline
              style={{
                marginTop: 12,
                backgroundColor: C.bgSection,
                borderRadius: R.md,
                borderWidth: 1,
                borderColor: C.border,
                padding: 12,
                minHeight: 80,
                color: C.text,
                textAlignVertical: 'top',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => { setModal(null); setNote(''); }}
                style={{
                  flex: 1,
                  backgroundColor: C.bgSection,
                  borderRadius: R.md,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: C.text, fontWeight: '700' }}>Болих</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={advance.isPending}
                onPress={() => modal && advance.mutate({ to: modal.to, noteText: note.trim() || undefined })}
                style={{
                  flex: 1,
                  backgroundColor: C.herder,
                  borderRadius: R.md,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                {advance.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Илгээх</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        marginHorizontal: 12,
        marginTop: 12,
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <Text style={{ ...F.h4, color: C.text, marginBottom: 10 }}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
  cta,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  cta?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
      <Text style={{ color: C.textSub, fontSize: 13 }}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: C.herder, fontSize: 13, fontWeight: '700' }}>{value}</Text>
          {cta ? <Text style={{ color: C.herder, fontSize: 11 }}>({cta})</Text> : null}
        </TouchableOpacity>
      ) : (
        <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>{value}</Text>
      )}
    </View>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('mn-MN');
  } catch {
    return iso;
  }
}
