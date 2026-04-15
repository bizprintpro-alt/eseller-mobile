import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { OrderAPI, post } from '../../src/services/api';
import { C, R } from '../../src/shared/design';

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: orderData, isLoading } = useQuery<any>({
    queryKey: ['order', orderId],
    queryFn: () => OrderAPI.detail(orderId!),
    enabled: !!orderId,
  });

  const submitMut = useMutation({
    mutationFn: () =>
      post('/reviews', {
        orderId,
        rating,
        comment: comment.trim(),
      }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Амжилттай', 'Үнэлгээ илгээгдлээ', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (e: any) => Alert.alert('Алдаа', e?.message || 'Илгээж чадсангүй'),
  });

  function selectStar(i: number) {
    Haptics.selectionAsync().catch(() => {});
    setRating(i);
  }

  function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Анхаар', 'Одоор үнэлгээ өгнө үү');
      return;
    }
    submitMut.mutate();
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.brand} />
      </View>
    );
  }

  const order: any = (orderData as any)?.data?.order || (orderData as any)?.order || orderData;
  const items: any[] = Array.isArray(order?.items) ? order.items : [];
  const firstItem = items[0];

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
        <Text style={{ fontSize: 18, fontWeight: '800', color: C.text, flex: 1 }}>
          Үнэлгээ өгөх
        </Text>
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        {/* Order summary */}
        <View
          style={{
            backgroundColor: C.bgCard,
            borderRadius: R.lg,
            padding: 14,
            borderWidth: 0.5,
            borderColor: C.border,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 48, height: 48, borderRadius: 10,
              backgroundColor: C.bgSection,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>📦</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
              {firstItem?.name ?? `Захиалга #${String(orderId).slice(-6).toUpperCase()}`}
            </Text>
            {items.length > 1 && (
              <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
                + {items.length - 1} бусад
              </Text>
            )}
          </View>
        </View>

        {/* Star rating */}
        <View
          style={{
            backgroundColor: C.bgCard,
            borderRadius: R.lg,
            padding: 20,
            borderWidth: 0.5,
            borderColor: C.border,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Text style={{ color: C.textSub, fontSize: 13, fontWeight: '600' }}>
            Үйлчилгээг хэрхэн үнэлэх вэ?
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => selectStar(i)}
                hitSlop={10}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={i <= rating ? '#F9A825' : C.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={{ color: C.gold, fontSize: 14, fontWeight: '700' }}>
              {['', 'Муу', 'Дунд', 'Боломжийн', 'Сайн', 'Маш сайн'][rating]}
            </Text>
          )}
        </View>

        {/* Comment */}
        <View>
          <Text style={{ color: C.textSub, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            Сэтгэгдэл (сонголттой)
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Хариулт бичих..."
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={5}
            style={{
              backgroundColor: C.bgCard,
              borderRadius: R.lg,
              padding: 14,
              color: C.text,
              fontSize: 14,
              minHeight: 120,
              textAlignVertical: 'top',
              borderWidth: 0.5,
              borderColor: C.border,
            }}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitMut.isPending || rating === 0}
          style={{
            backgroundColor: rating === 0 || submitMut.isPending ? C.textMuted : C.brand,
            borderRadius: R.lg,
            padding: 16,
            alignItems: 'center',
          }}
        >
          {submitMut.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Илгээх</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
