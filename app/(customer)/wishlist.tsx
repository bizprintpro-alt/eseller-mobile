import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, del } from '../../src/services/api';
import { useCart } from '../../src/store/cart';
import { C, R, F } from '../../src/shared/design';

const fmt = (n: number) => n.toLocaleString() + '₮';

export default function WishlistScreen() {
  const qc = useQueryClient();
  const { add } = useCart();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['wishlist'], queryFn: () => get('/wishlist') });
  const items = (data as any)?.items || (data as any)?.products || [];

  const removeMut = useMutation({
    mutationFn: (id: string) => del(`/wishlist/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const addToCart = (item: any) => {
    add({
      id: item.id || item.productId,
      name: item.name,
      price: item.salePrice || item.price,
      image: item.images?.[0] || item.media?.[0]?.url || null,
      entityId: item.entityId || item.shopId || '',
      entityName: item.entityName || item.shopName || '',
    }, 1);
    Alert.alert('Сагсанд нэмэгдлээ');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id || item.productId}
        contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Ionicons name="heart-outline" size={56} color={C.bgSection} />
            <Text style={{ ...F.body, color: C.textMuted, marginTop: R.md }}>Хадгалсан бараа байхгүй</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 14, padding: R.md, marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border, gap: R.md }}>
            <TouchableOpacity onPress={() => router.push(`/product/${item.id || item.productId}` as any)}>
              <View style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: C.bgSection, overflow: 'hidden' }}>
                {(item.images?.[0] || item.media?.[0]?.url) ? (
                  <Image source={{ uri: item.images?.[0] || item.media?.[0]?.url }} style={{ width: 80, height: 80 }} />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="cube" size={24} color={C.textMuted} /></View>
                )}
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ ...F.body, color: C.text, fontWeight: '600' }} numberOfLines={2}>{item.name}</Text>
              <Text style={{ ...F.body, color: C.brand, fontWeight: '800', marginTop: 4 }}>{fmt(item.salePrice || item.price || 0)}</Text>
              <View style={{ flexDirection: 'row', gap: R.sm, marginTop: R.sm }}>
                <TouchableOpacity onPress={() => addToCart(item)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.brandDim, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Ionicons name="cart" size={14} color={C.brand} /><Text style={{ ...F.tiny, color: C.brand, fontWeight: '700' }}>Сагс</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeMut.mutate(item.id || item.productId)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.errorDim, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Ionicons name="trash" size={14} color={C.error} /><Text style={{ ...F.tiny, color: C.error, fontWeight: '700' }}>Устгах</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
