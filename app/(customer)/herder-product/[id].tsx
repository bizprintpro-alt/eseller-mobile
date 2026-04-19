import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Dimensions, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  HERDER_BRAND as BRAND,
  PROVINCES,
  HerderAPI,
} from '../../../src/features/herder';
import { useMalchnaasEnabled } from '../../../src/config/remoteFlags';
import { useCart } from '../../../src/store/cart';

const { width } = Dimensions.get('window');

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function HerderProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const add = useCart((s) => s.add);
  const malchnaasEnabled = useMalchnaasEnabled();

  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['herder-product', id],
    queryFn:  () => HerderAPI.detail(String(id)),
    enabled:  !!id && malchnaasEnabled,
  });

  if (!malchnaasEnabled) {
    return (
      <View style={s.centerScreen}>
        <Ionicons name="leaf-outline" size={48} color="#ccc" />
        <Text style={s.muted}>Малчнаас шууд одоогоор идэвхгүй байна.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={s.centerScreen}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={s.centerScreen}>
        <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
        <Text style={s.muted}>Бүтээгдэхүүн олдсонгүй.</Text>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => router.back()}>
          <Text style={s.secondaryBtnText}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const p = product;
  const images = p.images ?? [];
  const unitPrice = p.salePrice ?? p.price;
  const total = unitPrice * qty;
  const province = PROVINCES.find((pr) => pr.code === p.herder?.province);

  const addToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    add({
      id:         p.id,
      name:       p.name,
      price:      unitPrice,
      image:      images[0] ?? null,
      entityId:   p.herder?.province ?? 'herder',
      entityName: p.herder?.herderName ?? 'Малчнаас шууд',
    }, qty);
    Alert.alert(
      'Сагсанд нэмлээ',
      `${p.name} × ${qty}`,
      [
        { text: 'Үргэлжлүүлэх' },
        { text: 'Сагс харах', onPress: () => router.push('/cart' as never) },
      ],
    );
  };

  const buyNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    add({
      id:         p.id,
      name:       p.name,
      price:      unitPrice,
      image:      images[0] ?? null,
      entityId:   p.herder?.province ?? 'herder',
      entityName: p.herder?.herderName ?? 'Малчнаас шууд',
    }, qty);
    router.push('/cart' as never);
  };

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image carousel */}
        <View style={{ height: 340, backgroundColor: '#f5f5f4', position: 'relative' }}>
          {images.length > 0 ? (
            <ScrollView
              horizontal pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
            >
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={{ width, height: 340 }} resizeMode="cover" />
              ))}
            </ScrollView>
          ) : (
            <View style={s.imgPlaceholder}>
              <Ionicons name="leaf-outline" size={64} color="#ccc" />
            </View>
          )}

          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          {p.herder?.isVerified && (
            <View style={s.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={s.verifiedText}>Баталгаажсан малчин</Text>
            </View>
          )}

          {images.length > 1 && (
            <View style={s.pager}>
              {images.map((_, i) => (
                <View key={i} style={[s.dot, i === imgIdx && s.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* Title + price */}
        <View style={s.sectionPadded}>
          <Text style={s.title}>{p.name}</Text>
          <View style={s.priceRow}>
            {p.salePrice ? (
              <>
                <Text style={s.salePrice}>{fmt(p.salePrice)}</Text>
                <Text style={s.oldPrice}>{fmt(p.price)}</Text>
              </>
            ) : (
              <Text style={s.salePrice}>{fmt(p.price)}</Text>
            )}
          </View>
          {p.category && (
            <View style={s.tagRow}>
              <View style={s.tag}><Text style={s.tagText}>{p.category}</Text></View>
              {p.requiresColdChain && (
                <View style={[s.tag, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="snow-outline" size={12} color="#1D4ED8" />
                  <Text style={[s.tagText, { color: '#1D4ED8' }]}>Хөргөлттэй</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Herder card */}
        {p.herder && (
          <View style={s.sectionPadded}>
            <Text style={s.sectionTitle}>Малчин</Text>
            <TouchableOpacity
              style={s.herderCard}
              activeOpacity={0.8}
              disabled={!p.herder.id}
              onPress={() => {
                if (p.herder?.id) router.push(`/(customer)/herder-profile/${p.herder.id}` as never);
              }}
            >
              <View style={s.herderAvatar}>
                <Ionicons name="person" size={22} color={BRAND} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.herderName}>{p.herder.herderName}</Text>
                <View style={s.herderMeta}>
                  <Ionicons name="location-outline" size={12} color="#78716c" />
                  <Text style={s.herderMetaText}>
                    {p.herder.provinceName} · {p.herder.district}
                  </Text>
                </View>
                {typeof p.herder.rating === 'number' && (
                  <View style={s.herderMeta}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={s.herderMetaText}>
                      {p.herder.rating.toFixed(1)}
                      {p.herder.orderCount ? ` · ${p.herder.orderCount} захиалга` : ''}
                    </Text>
                  </View>
                )}
              </View>
              {p.herder.id && (
                <Ionicons name="chevron-forward" size={18} color="#a8a29e" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery */}
        {province && (
          <View style={s.sectionPadded}>
            <Text style={s.sectionTitle}>Хүргэлт</Text>
            <View style={s.infoRow}>
              <Ionicons name="car-outline" size={18} color={BRAND} />
              <Text style={s.infoText}>
                {province.name} → УБ · {province.days} хоног
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        {p.description && (
          <View style={s.sectionPadded}>
            <Text style={s.sectionTitle}>Тайлбар</Text>
            <Text style={s.body}>{p.description}</Text>
          </View>
        )}

        {/* Qty + stock */}
        <View style={s.sectionPadded}>
          <View style={s.qtyRow}>
            <Text style={s.sectionTitle}>Тоо хэмжээ</Text>
            <View style={s.qtyControls}>
              <TouchableOpacity
                style={s.qtyBtn}
                onPress={() => setQty(Math.max(1, qty - 1))}
              >
                <Ionicons name="remove" size={18} color="#292524" />
              </TouchableOpacity>
              <Text style={s.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={s.qtyBtn}
                onPress={() => setQty(qty + 1)}
              >
                <Ionicons name="add" size={18} color="#292524" />
              </TouchableOpacity>
            </View>
          </View>
          {typeof p.stock === 'number' && (
            <Text style={s.stockText}>Үлдэгдэл: {p.stock}</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={s.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.totalLabel}>Нийт</Text>
          <Text style={s.totalValue}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity style={s.secondaryAction} onPress={addToCart} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={18} color={BRAND} />
          <Text style={s.secondaryActionText}>Сагсанд</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.primaryAction} onPress={buyNow} activeOpacity={0.8}>
          <Text style={s.primaryActionText}>Шууд захиалах</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  centerScreen: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', gap: 12 },
  muted: { color: '#78716c', fontSize: 15 },

  imgPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  verifiedBadge: { position: 'absolute', top: 50, right: 16, backgroundColor: BRAND, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  pager: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },

  sectionPadded: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f4' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#57534e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 8 },
  salePrice: { fontSize: 26, fontWeight: '900', color: BRAND },
  oldPrice: { fontSize: 15, color: '#a8a29e', textDecorationLine: 'line-through' },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '700', color: '#065F46' },

  herderCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12 },
  herderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  herderName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  herderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  herderMetaText: { fontSize: 12, color: '#78716c' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#292524' },

  body: { fontSize: 14, color: '#44403c', lineHeight: 22 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f5f5f4', borderRadius: 10, padding: 4 },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#111827', minWidth: 24, textAlign: 'center' },
  stockText: { fontSize: 12, color: '#78716c', marginTop: 8 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e7e5e4', flexDirection: 'row', alignItems: 'center', gap: 10 },
  totalLabel: { fontSize: 11, color: '#78716c' },
  totalValue: { fontSize: 18, fontWeight: '800', color: BRAND },
  secondaryAction: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: BRAND, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  secondaryActionText: { color: BRAND, fontSize: 13, fontWeight: '700' },
  primaryAction: { backgroundColor: BRAND, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  primaryActionText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, borderColor: BRAND, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  secondaryBtnText: { color: BRAND, fontWeight: '700' },
});
