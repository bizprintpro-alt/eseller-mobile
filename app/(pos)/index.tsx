import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  POSAPI,
  type POSProduct,
  type POSCartItem,
} from '../../src/services/api';

type PayMethod = 'cash' | 'qpay' | 'card';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

export default function POSTerminal() {
  // ── Search + products ──
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cart ──
  const [cart, setCart] = useState<POSCartItem[]>([]);

  // ── Checkout state ──
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');
  const [cashInput, setCashInput] = useState('');
  const [vatEnabled, setVatEnabled] = useState(true);

  // ── QPay modal ──
  const [qpayModal, setQpayModal] = useState(false);
  const [qrData, setQrData] = useState<{ invoiceId: string; qrImage: string } | null>(null);
  const [polling, setPolling] = useState(false);

  // ── Derived totals ──
  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const vatAmount = vatEnabled ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + vatAmount;
  const cashReceived = parseInt((cashInput || '').replace(/[,\s₮]/g, ''), 10) || 0;
  const change = payMethod === 'cash' ? Math.max(0, cashReceived - total) : 0;

  // ── Search with 400ms debounce ──
  function onSearchChange(text: string) {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) {
      setProducts([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await POSAPI.searchProducts(text.trim());
        const body = unwrap<any>(res);
        // Backend /products returns { products: [...] } or wrapped
        const list: POSProduct[] = body?.products ?? (Array.isArray(body) ? body : []);
        setProducts(list);
      } catch {
        setProducts([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  // ── Cart ops ──
  function addToCart(product: POSProduct) {
    if ((product.stock ?? 0) <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.product.price }
            : i,
        );
      }
      return [...prev, { product, qty: 1, subtotal: product.price }];
    });
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, qty, subtotal: qty * i.product.price } : i,
      ),
    );
  }

  function clearCart() {
    Alert.alert('Сагс цэвэрлэх', 'Бүх барааг хасах уу?', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Тийм',
        style: 'destructive',
        onPress: () => {
          setCart([]);
          setCashInput('');
          setSearch('');
          setProducts([]);
        },
      },
    ]);
  }

  // ── Cash checkout ──
  const cashMutation = useMutation({
    mutationFn: () =>
      POSAPI.createOrder({
        items: cart.map((i) => ({ productId: i.product.id, qty: i.qty, price: i.product.price })),
        paymentMethod: 'cash',
        cashReceived,
        total,
        vatIncluded: vatEnabled,
      }),
    onSuccess: (res) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const body = unwrap<{ orderId?: string; change?: number }>(res);
      const orderId = String(body?.orderId ?? '');
      Alert.alert(
        '✅ Амжилттай',
        `Захиалга #${orderId.slice(-6).toUpperCase()}\n` +
          `Нийт: ${total.toLocaleString()}₮\n` +
          `Хариулт: ${change.toLocaleString()}₮`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCart([]);
              setCashInput('');
            },
          },
        ],
      );
    },
    onError: (e: any) => Alert.alert('Алдаа', e?.message || 'Захиалга үүсгэж чадсангүй'),
  });

  // ── QPay flow ──
  async function startQPay() {
    try {
      const posOrderId = `POS-${Date.now()}`;
      const res = await POSAPI.createQPayInvoice(posOrderId, total);
      const body = unwrap<any>(res);
      const invoiceId: string | undefined = body?.invoiceId;
      const qrImage: string | undefined = body?.qrImage;
      if (!invoiceId || !qrImage) {
        Alert.alert('QPay алдаа', 'Нэхэмжлэл буцаагдсангүй');
        return;
      }
      setQrData({ invoiceId, qrImage });
      setQpayModal(true);
      pollPayment(invoiceId);
    } catch (e: any) {
      Alert.alert('QPay алдаа', e?.message || 'Холболтын алдаа');
    }
  }

  async function pollPayment(invoiceId: string) {
    setPolling(true);
    const maxAttempts = 60; // 5 минут (5 сек interval)
    for (let i = 0; i < maxAttempts; i++) {
      if (!qpayModal && i > 0) {
        // User cancelled — stop
        setPolling(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const res = await POSAPI.checkPayment(invoiceId);
        const body = unwrap<any>(res);
        if (body?.paid === true) {
          setPolling(false);
          setQpayModal(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          await POSAPI.createOrder({
            items: cart.map((c) => ({
              productId: c.product.id,
              qty: c.qty,
              price: c.product.price,
            })),
            paymentMethod: 'qpay',
            total,
            vatIncluded: vatEnabled,
          });
          Alert.alert('✅ Төлбөр амжилттай', `${total.toLocaleString()}₮ төлөгдлөө`, [
            { text: 'OK', onPress: () => setCart([]) },
          ]);
          return;
        }
      } catch {
        /* continue polling */
      }
    }
    setPolling(false);
    Alert.alert('Хугацаа дууслаа', 'QPay төлбөр 5 минутад ирсэнгүй');
  }

  function handleCheckout() {
    if (cart.length === 0) {
      Alert.alert('Сагс хоосон байна');
      return;
    }
    if (payMethod === 'cash') {
      if (cashReceived < total) {
        Alert.alert('Алдаа', `Хүрэлцэхгүй байна. ${(total - cashReceived).toLocaleString()}₮ дутуу`);
        return;
      }
      cashMutation.mutate();
    } else if (payMethod === 'qpay') {
      startQPay();
    } else {
      Alert.alert('Карт', 'Карт уншигч холбогдоогүй байна');
    }
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#0F172A' }}>
      {/* ─── LEFT: search + products ─── */}
      <View style={{ flex: 3, borderRightWidth: 1, borderColor: '#1E293B' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            gap: 10,
            backgroundColor: '#1E293B',
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace('/(owner)/dashboard' as any)}
            style={{ padding: 6 }}
          >
            <Ionicons name="arrow-back" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 }}>
            eSeller POS
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(pos)/history' as any)}
            style={{
              backgroundColor: '#334155',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text style={{ color: '#94A3B8', fontSize: 12 }}>Түүх</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ padding: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1E293B',
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 44,
              gap: 8,
            }}
          >
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              value={search}
              onChangeText={onSearchChange}
              placeholder="Барааны нэр эсвэл barcode..."
              placeholderTextColor="#64748B"
              style={{ flex: 1, color: '#fff', fontSize: 14 }}
              autoFocus
            />
            {searching && <ActivityIndicator size="small" color="#94A3B8" />}
          </View>
        </View>

        {/* Product grid */}
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={3}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          columnWrapperStyle={{ gap: 8 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ color: '#475569', fontSize: 14 }}>
                {search ? 'Бараа олдсонгүй' : 'Бараа хайж эхлэх...'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const inCart = !!cart.find((c) => c.product.id === item.id);
            const oos = (item.stock ?? 0) <= 0;
            const lowStock = !oos && (item.stock ?? 0) < 5;
            const img = item.images?.[0];
            return (
              <TouchableOpacity
                onPress={() => addToCart(item)}
                disabled={oos}
                style={{
                  flex: 1,
                  backgroundColor: '#1E293B',
                  borderRadius: 10,
                  padding: 10,
                  opacity: oos ? 0.4 : 1,
                  borderWidth: inCart ? 1.5 : 0,
                  borderColor: '#3B82F6',
                }}
              >
                {img ? (
                  <Image
                    source={{ uri: img }}
                    style={{ width: '100%', height: 64, borderRadius: 6 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ fontSize: 28, textAlign: 'center' }}>📦</Text>
                )}
                <Text
                  style={{ color: '#fff', fontSize: 11, fontWeight: '500', marginTop: 6 }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text style={{ color: '#3B82F6', fontSize: 13, fontWeight: '700', marginTop: 4 }}>
                  {item.price.toLocaleString()}₮
                </Text>
                {lowStock && (
                  <Text style={{ color: '#F59E0B', fontSize: 9, marginTop: 2 }}>
                    {item.stock} үлдсэн
                  </Text>
                )}
                {oos && <Text style={{ color: '#EF4444', fontSize: 9, marginTop: 2 }}>Дууссан</Text>}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ─── RIGHT: cart + checkout ─── */}
      <View style={{ flex: 2, backgroundColor: '#1E293B' }}>
        {/* Cart header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderBottomWidth: 1,
            borderColor: '#334155',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
            Сагс ({cart.reduce((s, i) => s + i.qty, 0)})
          </Text>
          {cart.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text style={{ color: '#EF4444', fontSize: 12 }}>Цэвэрлэх</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cart items */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8, gap: 6 }}>
          {cart.length === 0 ? (
            <Text
              style={{ color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 13 }}
            >
              Бараа сонгоно уу
            </Text>
          ) : (
            cart.map((item) => (
              <View
                key={item.product.id}
                style={{
                  backgroundColor: '#0F172A',
                  borderRadius: 8,
                  padding: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: '#fff', fontSize: 11, fontWeight: '500' }}
                    numberOfLines={1}
                  >
                    {item.product.name}
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>
                    {item.product.price.toLocaleString()}₮ × {item.qty}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => updateQty(item.product.id, item.qty - 1)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#334155',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14, lineHeight: 18 }}>−</Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: '600',
                      minWidth: 20,
                      textAlign: 'center',
                    }}
                  >
                    {item.qty}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateQty(item.product.id, item.qty + 1)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#334155',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14, lineHeight: 18 }}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    color: '#3B82F6',
                    fontSize: 12,
                    fontWeight: '700',
                    minWidth: 70,
                    textAlign: 'right',
                  }}
                >
                  {item.subtotal.toLocaleString()}₮
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Totals */}
        <View
          style={{
            borderTopWidth: 1,
            borderColor: '#334155',
            padding: 12,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#94A3B8', fontSize: 12 }}>Дүн</Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>{subtotal.toLocaleString()}₮</Text>
          </View>

          <TouchableOpacity
            onPress={() => setVatEnabled((v) => !v)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#94A3B8', fontSize: 12 }}>
              НӨАТ 10% {vatEnabled ? '✓' : '○'}
            </Text>
            <Text style={{ color: vatEnabled ? '#F59E0B' : '#475569', fontSize: 12 }}>
              {vatEnabled ? vatAmount.toLocaleString() + '₮' : '—'}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 6,
              borderTopWidth: 1,
              borderColor: '#334155',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Нийт</Text>
            <Text style={{ color: '#3B82F6', fontSize: 18, fontWeight: '700' }}>
              {total.toLocaleString()}₮
            </Text>
          </View>

          {/* Payment method */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            {(['cash', 'qpay', 'card'] as PayMethod[]).map((m) => {
              const on = payMethod === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setPayMethod(m)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: on ? '#3B82F6' : '#334155',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>
                    {m === 'cash' ? '💵' : m === 'qpay' ? '📱' : '💳'}
                  </Text>
                  <Text
                    style={{
                      color: on ? '#fff' : '#94A3B8',
                      fontSize: 9,
                      marginTop: 2,
                    }}
                  >
                    {m === 'cash' ? 'Бэлэн' : m === 'qpay' ? 'QPay' : 'Карт'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cash received */}
          {payMethod === 'cash' && (
            <View style={{ gap: 4 }}>
              <TextInput
                value={cashInput}
                onChangeText={setCashInput}
                placeholder="Авсан мөнгө..."
                placeholderTextColor="#475569"
                keyboardType="numeric"
                style={{
                  backgroundColor: '#0F172A',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 40,
                  color: '#fff',
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              />
              {change > 0 && (
                <Text style={{ color: '#10B981', fontSize: 12, textAlign: 'right' }}>
                  Хариулт: {change.toLocaleString()}₮
                </Text>
              )}
            </View>
          )}

          {/* Checkout */}
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={cart.length === 0 || cashMutation.isPending}
            style={{
              backgroundColor: cart.length === 0 ? '#334155' : '#10B981',
              borderRadius: 10,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4,
            }}
          >
            {cashMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: cart.length === 0 ? '#475569' : '#fff',
                  fontSize: 15,
                  fontWeight: '700',
                }}
              >
                Төлбөр авах
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── QPay modal ─── */}
      {qpayModal && (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#1E293B',
              borderRadius: 16,
              padding: 24,
              width: 340,
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
              QPay — {total.toLocaleString()}₮
            </Text>

            <View
              style={{
                width: 220,
                height: 220,
                backgroundColor: '#fff',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
              }}
            >
              {qrData?.qrImage ? (
                <Image
                  source={{ uri: `data:image/png;base64,${qrData.qrImage}` }}
                  style={{ width: 204, height: 204 }}
                  resizeMode="contain"
                />
              ) : (
                <ActivityIndicator size="large" color="#1B3A5C" />
              )}
            </View>

            {polling && (
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={{ color: '#94A3B8', fontSize: 13 }}>Төлбөр хүлээж байна...</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setQpayModal(false);
                setPolling(false);
              }}
              style={{
                backgroundColor: '#334155',
                borderRadius: 8,
                paddingHorizontal: 24,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>Болих</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
