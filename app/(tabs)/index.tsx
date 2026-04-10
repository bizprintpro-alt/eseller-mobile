import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Dimensions, FlatList, RefreshControl, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/store/auth';
import { useCart } from '../../src/store/cart';
import { get } from '../../src/services/api';
import { C, R, S } from '../../src/shared/design';
import { RoleSwitcher } from '../../src/shared/ui/RoleSwitcher';

const { width } = Dimensions.get('window');

const ENTITY_TYPES = [
  { type: 'STORE',        icon: 'storefront', name: 'Дэлгүүр',   color: '#E8242C' },
  { type: 'REAL_ESTATE',  icon: 'home',       name: 'Үл хөдлөх', color: '#2563EB' },
  { type: 'AUTO',         icon: 'car',        name: 'Авто',       color: '#16A34A' },
  { type: 'SERVICE',      icon: 'cut',        name: 'Үйлчилгээ', color: '#7C3AED' },
  { type: 'CONSTRUCTION', icon: 'construct',  name: 'Барилга',    color: '#0891B2' },
  { type: 'PRE_ORDER',    icon: 'cube',       name: 'Pre-order',  color: '#D97706' },
  { type: 'DIGITAL',      icon: 'laptop',     name: 'Дижитал',    color: '#6366F1' },
];

export default function HomeScreen() {
  const { user, role } = useAuth();
  const { count } = useCart();
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerRef = useRef<ScrollView>(null);

  const { data: featured, isLoading: loadingProducts, refetch } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => get('/search?limit=10&sort=newest'),
  });

  const { data: feedData } = useQuery({
    queryKey: ['feed-preview'],
    queryFn: () => get('/feed?limit=5'),
  });

  const displayBanners = [
    { id: '1', title: 'Монголын нэгдсэн платформ', subtitle: '10,000+ бараа, 500+ дэлгүүр', color: '#1A0000' },
    { id: '2', title: 'Gold гишүүн болох', subtitle: 'Онцгой эрх, хямдрал, урамшуулал', color: '#1A1400' },
  ];

  useEffect(() => {
    const i = setInterval(() => {
      setBannerIdx((prev) => {
        const next = (prev + 1) % displayBanners.length;
        bannerRef.current?.scrollTo({ x: next * (width - 24), animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(i);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingProducts} onRefresh={refetch} tintColor={C.brand} />
        }
      >
        {/* HEADER */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
        }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: C.text, letterSpacing: -0.5 }}>
            eseller<Text style={{ color: C.brand }}>.mn</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'relative' }}>
              <Ionicons name="cart-outline" size={26} color={C.text} />
              {count() > 0 && (
                <View style={{
                  position: 'absolute', top: -4, right: -4,
                  backgroundColor: C.brand, borderRadius: 8,
                  minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: C.white, fontSize: 9, fontWeight: '700' }}>{count()}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Ionicons name="search-outline" size={24} color={C.text} />
          </View>
        </View>

        {/* HERO BANNER */}
        <View style={{
          height: 180, marginHorizontal: 12, borderRadius: R.xl,
          overflow: 'hidden', marginBottom: 16,
        }}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (width - 24)))
            }
          >
            {displayBanners.map((b, i) => (
              <View key={b.id} style={{
                width: width - 24, height: 180,
                backgroundColor: b.color, justifyContent: 'flex-end',
              }}>
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={{ padding: 20 }}
                >
                  <Text style={{ color: C.white, fontSize: 20, fontWeight: '800' }}>{b.title}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 }}>
                    {b.subtitle}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
          <View style={{ position: 'absolute', bottom: 10, right: 12, flexDirection: 'row', gap: 5 }}>
            {displayBanners.map((_, i) => (
              <View key={i} style={{
                width: i === bannerIdx ? 16 : 6, height: 6, borderRadius: 3,
                backgroundColor: i === bannerIdx ? C.white : 'rgba(255,255,255,0.4)',
              }} />
            ))}
          </View>
        </View>

        {/* SEARCH BAR */}
        <TouchableOpacity style={{
          flexDirection: 'row', alignItems: 'center',
          marginHorizontal: 12, marginBottom: 20,
          backgroundColor: C.bgSection, borderRadius: R.xl,
          padding: 14, gap: 10, borderWidth: 1, borderColor: C.border,
        }}>
          <Ionicons name="search" size={18} color={C.textMuted} />
          <Text style={{ color: C.textMuted, fontSize: 14, flex: 1 }}>
            Бараа, дэлгүүр хайх...
          </Text>
        </TouchableOpacity>

        {/* ENTITY TYPES */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            color: C.text, fontSize: 17, fontWeight: '700',
            paddingHorizontal: 16, marginBottom: 12,
          }}>
            Дэлгүүрийн төрлүүд
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          >
            {ENTITY_TYPES.map((e) => (
              <TouchableOpacity key={e.type} style={{
                alignItems: 'center', backgroundColor: C.bgSection,
                borderRadius: R.xl, paddingVertical: 14, paddingHorizontal: 14,
                minWidth: 72, borderWidth: 1, borderColor: e.color + '30',
              }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: e.color + '18',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                }}>
                  <Ionicons name={e.icon as any} size={22} color={e.color} />
                </View>
                <Text style={{ color: C.textSub, fontSize: 11, fontWeight: '500', textAlign: 'center' }}>
                  {e.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* NEW PRODUCTS */}
        <View style={{ marginBottom: 24 }}>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
          }}>
            <Text style={{ color: C.text, fontSize: 17, fontWeight: '700' }}>
              Шинэ бараа
            </Text>
          </View>

          {loadingProducts ? (
            <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{
                  width: 148, backgroundColor: C.bgSection,
                  borderRadius: R.lg, height: 220,
                }} />
              ))}
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={(featured as any)?.products || []}
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={{
                    width: 148, backgroundColor: C.bgCard, borderRadius: R.lg,
                    overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...S.card,
                  }}
                >
                  <Image
                    source={{ uri: item.media?.[0]?.url }}
                    style={{ width: 148, height: 148 }}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 10 }}>
                    <Text style={{ color: C.text, fontSize: 13, fontWeight: '500' }} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 14, marginTop: 6 }}>
                      {item.price?.toLocaleString()}₮
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: C.textMuted, padding: 16 }}>Бараа байхгүй байна</Text>
              }
            />
          )}
        </View>

        {/* FEED PREVIEW */}
        <View style={{ marginBottom: 100 }}>
          <Text style={{
            color: C.text, fontSize: 17, fontWeight: '700',
            paddingHorizontal: 16, marginBottom: 12,
          }}>
            Зарын булан
          </Text>
          <View style={{ paddingHorizontal: 12 }}>
            {((feedData as any)?.posts || (feedData as any[]) || []).slice(0, 4).map((p: any) => (
              <TouchableOpacity key={p.id} style={{
                flexDirection: 'row', backgroundColor: C.bgCard,
                borderRadius: R.lg, marginBottom: 10, overflow: 'hidden',
                borderWidth: 1, borderColor: C.border,
              }}>
                <Image
                  source={{ uri: p.media?.[0]?.url || p.images?.[0] }}
                  style={{ width: 90, height: 90 }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                  <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>
                    {p.title || p.name}
                  </Text>
                  <Text style={{ color: C.brand, fontWeight: '800', fontSize: 15, marginTop: 6 }}>
                    {p.price ? p.price.toLocaleString() + '₮' : 'Үнэ тохиролцоно'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Role Switcher */}
      <RoleSwitcher />
    </View>
  );
}
