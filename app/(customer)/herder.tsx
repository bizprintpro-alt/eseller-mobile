import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import {
  HERDER_BRAND as BRAND,
  PROVINCES,
  CATEGORIES,
  HerderAPI,
  type HerderProduct,
} from '../../src/features/herder';
import { useCart } from '../../src/store/cart';

function fmt(n: number) { return n.toLocaleString() + '₮'; }

export default function HerderScreen() {
  const [province, setProvince]         = useState<string | null>(null);
  const [category, setCategory]         = useState<string | null>(null);
  const [products, setProducts]         = useState<HerderProduct[]>([]);
  const [loading, setLoading]           = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [showProvinces, setShowProvinces] = useState(true);

  const addToCart = useCart((s) => s.add);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await HerderAPI.list({
        limit:    20,
        province: province ?? undefined,
        category: category ?? undefined,
      });
      setProducts(data.products);
    } catch {
      // Silent — list stays as-is; pull-to-refresh retries.
    }
    setLoading(false);
    setRefreshing(false);
  }, [province, category]);

  useEffect(() => { load(); }, [load]);

  const selectedProvince = PROVINCES.find((p) => p.code === province);

  const buyNow = (product: HerderProduct) => {
    const unit = product.salePrice ?? product.price;
    if (!unit || unit <= 0) return;
    addToCart({
      id:         product.id,
      name:       product.name,
      price:      unit,
      image:      product.images?.[0] ?? null,
      entityId:   product.herder?.province ?? 'herder',
      entityName: product.herder?.herderName ?? 'Малчнаас шууд',
    }, 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/cart' as never);
  };

  const openDetail = (product: HerderProduct) => {
    Haptics.selectionAsync();
    router.push(`/(customer)/herder-product/${product.id}` as never);
  };

  return (
    <ScrollView style={s.root} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={BRAND} />}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>Малчнаас шууд</Text>
        <Text style={s.heroSub}>Байгалийн бүтээгдэхүүнийг шууд захиалаарай</Text>
      </View>

      <View style={s.section}>
        <TouchableOpacity style={s.sectionHeader} onPress={() => setShowProvinces(!showProvinces)} activeOpacity={0.7}>
          <View style={s.row}>
            <Ionicons name="location-outline" size={20} color={BRAND} />
            <Text style={s.sectionTitle}>{selectedProvince ? selectedProvince.name : 'Аймаг сонгох'}</Text>
          </View>
          <Ionicons name={showProvinces ? 'chevron-up' : 'chevron-down'} size={20} color="#888" />
        </TouchableOpacity>

        {showProvinces && (
          <View style={s.provinceGrid}>
            <TouchableOpacity
              style={[s.provinceChip, !province && s.provinceChipActive]}
              onPress={() => { setProvince(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.7}
            >
              <Text style={[s.provinceText, !province && s.provinceTextActive]}>Бүгд</Text>
            </TouchableOpacity>
            {PROVINCES.map((p) => (
              <TouchableOpacity
                key={p.code}
                style={[s.provinceChip, province === p.code && s.provinceChipActive]}
                onPress={() => {
                  setProvince(province === p.code ? null : p.code);
                  setShowProvinces(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Text style={[s.provinceText, province === p.code && s.provinceTextActive]}>{p.name}</Text>
                <Text style={[s.provinceDays, province === p.code && s.provinceDaysActive]}>{p.days} хоног</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Ангилал</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
          <TouchableOpacity
            style={[s.chip, !category && s.chipActive]}
            onPress={() => { setCategory(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Text style={[s.chipText, !category && s.chipTextActive]}>Бүгд</Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.chip, category === cat && s.chipActive]}
              onPress={() => {
                setCategory(category === cat ? null : cat);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[s.chipText, category === cat && s.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Бүтээгдэхүүн</Text>
        {loading ? (
          <ActivityIndicator size="large" color={BRAND} style={{ marginVertical: 40 }} />
        ) : products.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="leaf-outline" size={48} color="#ccc" />
            <Text style={s.emptyText}>Одоогоор бүтээгдэхүүн байхгүй</Text>
          </View>
        ) : (
          <View style={s.productGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={s.productCard}
                onPress={() => openDetail(product)}
                activeOpacity={0.85}
              >
                <View style={s.productImage}>
                  {product.images?.[0] ? (
                    <Image source={{ uri: product.images[0] }} style={s.productImg} resizeMode="cover" />
                  ) : (
                    <View style={s.productImgPlaceholder}>
                      <Ionicons name="leaf-outline" size={32} color="#ccc" />
                    </View>
                  )}
                  {product.herder?.isVerified && (
                    <View style={s.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#fff" />
                      <Text style={s.verifiedText}>Баталгаатай</Text>
                    </View>
                  )}
                </View>
                <View style={s.productInfo}>
                  <Text style={s.productName} numberOfLines={2}>{product.name}</Text>
                  {product.herder && (
                    <View style={s.herderRow}>
                      <Ionicons name="location-outline" size={12} color="#888" />
                      <Text style={s.herderText} numberOfLines={1}>
                        {product.herder.herderName} — {product.herder.provinceName}
                      </Text>
                    </View>
                  )}
                  <View style={s.priceRow}>
                    {product.salePrice ? (
                      <>
                        <Text style={s.salePrice}>{fmt(product.salePrice)}</Text>
                        <Text style={s.oldPrice}>{fmt(product.price)}</Text>
                      </>
                    ) : (
                      <Text style={s.salePrice}>{fmt(product.price)}</Text>
                    )}
                  </View>
                  {product.herder && selectedProvince && (
                    <View style={s.deliveryRow}>
                      <Ionicons name="car-outline" size={12} color="#888" />
                      <Text style={s.deliveryText}>{selectedProvince.days} хоногт хүргэнэ</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={s.orderBtn}
                    onPress={(e) => { e.stopPropagation?.(); buyNow(product); }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.orderBtnText}>Шууд захиалах</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f4' },
  hero: { backgroundColor: BRAND, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 15, color: '#d1fae5', lineHeight: 22 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#292524', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  provinceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  provinceChip: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#e7e5e4', minWidth: 100 },
  provinceChipActive: { backgroundColor: BRAND, borderColor: BRAND },
  provinceText: { fontSize: 14, fontWeight: '600', color: '#44403c' },
  provinceTextActive: { color: '#fff' },
  provinceDays: { fontSize: 11, color: '#a8a29e', marginTop: 2 },
  provinceDaysActive: { color: '#d1fae5' },
  chipScroll: { marginTop: 4 },
  chip: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#e7e5e4', marginRight: 8 },
  chipActive: { backgroundColor: BRAND, borderColor: BRAND },
  chipText: { fontSize: 14, fontWeight: '600', color: '#57534e' },
  chipTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#a8a29e', marginTop: 12 },
  productGrid: { gap: 12 },
  productCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e7e5e4' },
  productImage: { height: 180, backgroundColor: '#f5f5f4', position: 'relative' },
  productImg: { width: '100%', height: '100%' },
  productImgPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  verifiedBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: BRAND, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  productInfo: { padding: 14 },
  productName: { fontSize: 15, fontWeight: '700', color: '#292524', marginBottom: 4 },
  herderRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  herderText: { fontSize: 12, color: '#78716c', flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  salePrice: { fontSize: 17, fontWeight: '800', color: BRAND },
  oldPrice: { fontSize: 13, color: '#a8a29e', textDecorationLine: 'line-through' },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  deliveryText: { fontSize: 12, color: '#78716c' },
  orderBtn: { backgroundColor: BRAND, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
