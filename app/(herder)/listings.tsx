import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../src/features/herder/api';
import type { MyHerderProduct } from '../../src/features/herder/types';
import { C, R } from '../../src/shared/design';

type Filter = 'active' | 'all';

export default function HerderListings() {
  const [filter, setFilter] = useState<Filter>('active');
  const qc = useQueryClient();

  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: ['herder', 'my', 'products', filter],
    queryFn:  () => HerderAPI.my.products.list({ status: filter }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => HerderAPI.my.products.remove(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['herder', 'my', 'products'] });
    },
    onError: (e: Error) => Alert.alert('Алдаа', e.message),
  });

  const confirmDelete = (p: MyHerderProduct) => {
    Alert.alert(
      'Бараа хасах',
      `"${p.name}"-г жагсаалтаас хасах уу? (сэргээх боломжтой)`,
      [
        { text: 'Болих', style: 'cancel' },
        { text: 'Хасах', style: 'destructive', onPress: () => remove.mutate(p.id) },
      ],
    );
  };

  const products = data?.products ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Бүтээгдэхүүн</Text>
        <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
          Нийт {data?.total ?? 0}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 }}>
        {(['active', 'all'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: R.full,
              backgroundColor: filter === f ? C.herder : C.bgSection,
              borderWidth: 1,
              borderColor: filter === f ? C.herder : C.border,
            }}
          >
            <Text
              style={{
                color: filter === f ? '#fff' : C.text,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {f === 'active' ? 'Идэвхтэй' : 'Бүгд'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={C.herder}
          />
        }
        renderItem={({ item: p }) => (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/(herder)/listing-form',
              params:   { id: p.id },
            } as never)}
            style={{
              flexDirection: 'row',
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              padding: 12,
              marginBottom: 10,
              gap: 12,
              borderWidth: 1,
              borderColor: C.border,
              opacity: p.isActive ? 1 : 0.55,
            }}
          >
            {p.images?.[0] ? (
              <Image
                source={{ uri: p.images[0] }}
                style={{ width: 72, height: 72, borderRadius: R.md, backgroundColor: C.bgSection }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: R.md,
                  backgroundColor: C.bgSection,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="leaf-outline" size={28} color={C.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={{ color: C.herder, fontWeight: '800', fontSize: 15, marginTop: 4 }}>
                {(p.salePrice ?? p.price).toLocaleString()}₮
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {p.category && (
                  <View
                    style={{
                      backgroundColor: C.herder + '20',
                      borderRadius: R.full,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: C.herder, fontSize: 11, fontWeight: '700' }}>
                      {p.category}
                    </Text>
                  </View>
                )}
                {p.requiresColdChain && (
                  <View
                    style={{
                      backgroundColor: C.primaryDim,
                      borderRadius: R.full,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: C.primary, fontSize: 11, fontWeight: '700' }}>
                      ❄ Хүйтэн
                    </Text>
                  </View>
                )}
                {!p.isActive && (
                  <View
                    style={{
                      backgroundColor: C.errorDim,
                      borderRadius: R.full,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: C.error, fontSize: 11, fontWeight: '700' }}>
                      Идэвхгүй
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => confirmDelete(p)}
              hitSlop={8}
              style={{ alignSelf: 'center', padding: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color={C.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="leaf-outline" size={48} color={C.textMuted} />
              <Text style={{ color: C.textSub, marginTop: 12 }}>Бараа байхгүй байна</Text>
              <TouchableOpacity
                onPress={() => router.push('/(herder)/listing-form' as never)}
                style={{
                  marginTop: 16,
                  backgroundColor: C.herder,
                  borderRadius: R.full,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Эхний бараа нэмэх</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        onPress={() => router.push('/(herder)/listing-form' as never)}
        style={{
          position: 'absolute',
          right: 18,
          bottom: 90,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: C.herder,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
