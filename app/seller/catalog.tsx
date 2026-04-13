import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Share, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';
import * as Clipboard from 'expo-clipboard';

const fmt = (n: number) => n.toLocaleString() + '₮';

export default function CatalogScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['seller-catalog'], queryFn: () => get('/affiliate/links') });
  const products = (data as any)?.links || (data as any)?.products || [];
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'clicks' | 'earnings'>('clicks');

  const filtered = products
    .filter((p: any) => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => sort === 'clicks' ? (b.clicks || 0) - (a.clicks || 0) : (b.earnings || 0) - (a.earnings || 0));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.seller} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: R.sm, backgroundColor: C.bgCard, borderRadius: R.md, paddingHorizontal: 14, marginBottom: R.md, borderWidth: 0.5, borderColor: C.border }}>
        <Ionicons name="search" size={18} color={C.textMuted} />
        <TextInput style={{ flex: 1, color: C.white, paddingVertical: R.md }} placeholder="Бараа хайх..." placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />
      </View>

      <View style={{ flexDirection: 'row', gap: R.sm, marginBottom: R.lg }}>
        {(['clicks', 'earnings'] as const).map(s => (
          <TouchableOpacity key={s} style={[st.sortChip, sort === s && { backgroundColor: C.seller, borderColor: C.seller }]} onPress={() => setSort(s)}>
            <Text style={{ ...F.tiny, color: sort === s ? C.white : C.textMuted, fontWeight: '600' }}>{s === 'clicks' ? 'Клик' : 'Орлого'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.map((p: any) => (
        <View key={p.id} style={st.card}>
          <View style={{ flexDirection: 'row', gap: R.md, marginBottom: R.md }}>
            <View style={st.cardImg}>{p.image ? <Image source={{ uri: p.image }} style={{ width: '100%', height: '100%', borderRadius: 10 }} /> : <Ionicons name="cube" size={24} color={C.textMuted} />}</View>
            <View style={{ flex: 1 }}><Text style={{ ...F.body, color: C.white, fontWeight: '700' }} numberOfLines={2}>{p.name}</Text><Text style={{ ...F.small, color: C.seller, fontWeight: '600', marginTop: 2 }}>{p.commissionRate || p.commission || 10}% комисс</Text></View>
          </View>
          <View style={{ flexDirection: 'row', gap: R.sm, marginBottom: R.md }}>
            {[{ v: p.clicks || 0, l: 'Клик' }, { v: p.conversions || 0, l: 'Хөрвөлт' }, { v: fmt(p.earnings || 0), l: 'Орлого' }].map((s, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: C.bgSection, borderRadius: R.sm, padding: R.sm, alignItems: 'center' }}>
                <Text style={{ ...F.body, color: i === 2 ? C.seller : C.white, fontWeight: '800' }}>{s.v}</Text><Text style={{ ...F.tiny, color: C.textMuted }}>{s.l}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: R.sm }}>
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: C.primaryDim }]} onPress={() => Clipboard.setStringAsync(p.shareUrl || `https://eseller.mn/product/${p.id}`)}>
              <Ionicons name="copy-outline" size={16} color={C.primary} /><Text style={{ ...F.tiny, color: C.primary, fontWeight: '700' }}>Хуулах</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: C.seller }]} onPress={() => Share.share({ message: `${p.name}\n${p.shareUrl || `https://eseller.mn/product/${p.id}`}` })}>
              <Ionicons name="share-social" size={16} color={C.white} /><Text style={{ ...F.tiny, color: C.white, fontWeight: '700' }}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  sortChip: { backgroundColor: C.bgCard, borderRadius: 20, paddingHorizontal: R.lg, paddingVertical: R.sm, borderWidth: 0.5, borderColor: C.border },
  card: { backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: C.border },
  cardImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: C.bgSection, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, padding: 10 },
});
