import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Linking, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const W = Dimensions.get('window').width;
const fmt = (n: number) => n.toLocaleString() + '₮';

export default function FeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQuery({ queryKey: ['feed', id], queryFn: () => get(`/feed/${id}`), enabled: !!id });
  const item = (data as any)?.listing || (data as any);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.textMuted }}>Ачааллаж байна...</Text></View>;
  if (!item?.id) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="alert-circle" size={48} color={C.textMuted} /><Text style={{ ...F.body, color: C.textMuted, marginTop: R.md }}>Зар олдсонгүй</Text><TouchableOpacity onPress={() => router.back()} style={st.backBtn}><Text style={{ ...F.body, color: C.primary }}>Буцах</Text></TouchableOpacity></View>;

  const images = item.images || item.media?.map((m: any) => m.url) || [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Images */}
      {images.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {images.map((uri: string, i: number) => <Image key={i} source={{ uri }} style={{ width: W, height: W * 0.75 }} resizeMode="cover" />)}
        </ScrollView>
      ) : (
        <View style={{ height: 200, backgroundColor: C.bgSection, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="image-outline" size={48} color={C.textMuted} /></View>
      )}

      <View style={{ padding: R.lg }}>
        {/* Title + Price */}
        <Text style={{ ...F.h2, color: C.white, marginBottom: R.sm }}>{item.title || item.name}</Text>
        <Text style={{ ...F.h2, color: C.brand, marginBottom: R.md }}>{fmt(item.price || 0)}</Text>

        {/* Meta */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: R.sm, marginBottom: R.lg }}>
          {item.district && <View style={st.metaChip}><Ionicons name="location" size={14} color={C.textMuted} /><Text style={{ ...F.tiny, color: C.textSub }}>{item.district}</Text></View>}
          {item.condition && <View style={st.metaChip}><Text style={{ ...F.tiny, color: C.textSub }}>{item.condition === 'new' ? 'Шинэ' : item.condition === 'used' ? 'Хэрэглэсэн' : item.condition}</Text></View>}
          <View style={st.metaChip}><Ionicons name="eye" size={14} color={C.textMuted} /><Text style={{ ...F.tiny, color: C.textSub }}>{item.viewCount || 0} үзсэн</Text></View>
        </View>

        {/* Description */}
        {item.description && <Text style={{ ...F.body, color: C.text, marginBottom: R.lg, lineHeight: 22 }}>{item.description}</Text>}

        {/* Seller info */}
        {item.seller && (
          <View style={st.sellerCard}>
            <Ionicons name="person-circle" size={40} color={C.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>{item.seller.name || 'Зарлагч'}</Text>
              {item.seller.phone && <Text style={{ ...F.tiny, color: C.textMuted }}>{item.seller.phone}</Text>}
            </View>
            {item.seller.phone && (
              <TouchableOpacity style={st.callBtn} onPress={() => Linking.openURL(`tel:${item.seller.phone}`)}>
                <Ionicons name="call" size={18} color={C.white} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: R.sm, marginTop: R.lg }}>
          <TouchableOpacity style={[st.actionBtn, { backgroundColor: C.brandDim }]} onPress={() => Share.share({ message: `${item.title} - ${fmt(item.price)}\nhttps://eseller.mn/feed/${id}` })}>
            <Ionicons name="share-social" size={18} color={C.brand} /><Text style={{ ...F.body, color: C.brand, fontWeight: '700' }}>Хуваалцах</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionBtn, { backgroundColor: C.primary }]} onPress={() => router.push(`/chat/${item.sellerId || 'new'}` as any)}>
            <Ionicons name="chatbubble" size={18} color={C.white} /><Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>Мессеж</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  backBtn: { marginTop: R.lg, padding: R.md },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgSection, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: R.md, backgroundColor: C.bgCard, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: C.border },
  callBtn: { backgroundColor: C.secondary, borderRadius: R.full, padding: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: R.sm, borderRadius: 14, padding: 14 },
});
