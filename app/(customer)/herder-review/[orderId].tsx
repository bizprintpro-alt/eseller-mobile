// ════════════════════════════════════════════════════════
// Herder review submit screen (M14)
//
// Deep-linkable from any delivered-order surface:
//   /(customer)/herder-review/<orderId>?herderName=...&herderId=...
//
// Backend enforces the trust gate (buyer + delivered status + one per order).
// This screen is a thin client: star picker (1-5) + optional text (≤500),
// POST /herder/reviews, invalidate profile+reviews queries, bounce back.
// ════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { HERDER_BRAND as BRAND, HerderAPI } from '../../../src/features/herder';

const MAX_TEXT = 500;

export default function HerderReviewScreen() {
  const { orderId, herderName, herderId } = useLocalSearchParams<{
    orderId:     string;
    herderName?: string;
    herderId?:   string;
  }>();
  const oid = String(orderId ?? '');
  const qc  = useQueryClient();

  const [rating, setRating] = useState(0);
  const [text, setText]     = useState('');

  const submit = useMutation({
    mutationFn: () => HerderAPI.submitReview({
      orderId: oid,
      rating,
      text: text.trim() || undefined,
    }),
    onSuccess: async () => {
      if (herderId) {
        await Promise.all([
          qc.invalidateQueries({ queryKey: ['herder-profile', String(herderId)] }),
          qc.invalidateQueries({ queryKey: ['herder-reviews',  String(herderId)] }),
        ]);
      }
      Alert.alert('Амжилттай', 'Таны үнэлгээг хүлээн авлаа. Баярлалаа!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Үнэлгээ илгээхэд алдаа гарлаа';
      Alert.alert('Алдаа', String(msg));
    },
  });

  const canSubmit = rating >= 1 && rating <= 5 && !submit.isPending;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#111827" />
        <Text style={s.backText}>Буцах</Text>
      </TouchableOpacity>

      <Text style={s.title}>Малчныг үнэлэх</Text>
      {herderName ? <Text style={s.subtitle}>{String(herderName)}</Text> : null}

      <Text style={s.label}>Таны оноо</Text>
      <View style={s.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setRating(n)}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons
              name={n <= rating ? 'star' : 'star-outline'}
              size={36}
              color={n <= rating ? '#F59E0B' : '#D6D3D1'}
            />
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <Text style={s.ratingHint}>
          {rating === 5 ? 'Маш сайн'
            : rating === 4 ? 'Сайн'
            : rating === 3 ? 'Дунд'
            : rating === 2 ? 'Муу'
            : 'Маш муу'}
        </Text>
      )}

      <Text style={[s.label, { marginTop: 22 }]}>
        Сэтгэгдэл (заавал биш)
      </Text>
      <TextInput
        style={s.textArea}
        multiline
        placeholder="Бараа, үйлчилгээний талаар бусдад хэлэх зүйл..."
        placeholderTextColor="#a8a29e"
        value={text}
        onChangeText={(v) => setText(v.slice(0, MAX_TEXT))}
        textAlignVertical="top"
      />
      <Text style={s.counter}>{text.length} / {MAX_TEXT}</Text>

      <TouchableOpacity
        style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
        onPress={() => canSubmit && submit.mutate()}
        activeOpacity={0.85}
        disabled={!canSubmit}
      >
        {submit.isPending
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.submitText}>Үнэлгээ илгээх</Text>}
      </TouchableOpacity>

      <Text style={s.helper}>
        Зөвхөн хүргэгдсэн захиалга дээр үнэлгээ өгөх боломжтой. Нэг захиалгад
        нэг л үнэлгээ бүртгэгдэнэ.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { fontSize: 15, color: '#111827', fontWeight: '600' },

  title:    { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#78716c', marginTop: 4 },

  label: { fontSize: 13, fontWeight: '700', color: '#44403c', marginTop: 24, marginBottom: 10 },
  stars: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  ratingHint: { fontSize: 13, color: '#57534e', marginTop: 8 },

  textArea: {
    borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 12,
    padding: 12, minHeight: 120, fontSize: 15, color: '#111827',
    backgroundColor: '#fafaf9',
  },
  counter: { fontSize: 11, color: '#a8a29e', alignSelf: 'flex-end', marginTop: 4 },

  submitBtn: {
    backgroundColor: BRAND, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  helper: { fontSize: 12, color: '#78716c', marginTop: 14, lineHeight: 18 },
});
