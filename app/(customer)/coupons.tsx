import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

export default function CouponsScreen() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['coupons'], queryFn: () => get('/buyer/coupons') });
  const coupons = (data as any)?.coupons || [];
  const [code, setCode] = useState('');

  const redeemMut = useMutation({
    mutationFn: (c: string) => post('/buyer/coupons/redeem', { code: c }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setCode(''); Alert.alert('Амжилттай', 'Купон нэмэгдлээ'); },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      {/* Code input */}
      <View style={st.inputRow}>
        <TextInput style={st.input} placeholder="Промо код оруулах" placeholderTextColor={C.textMuted} value={code} onChangeText={setCode} autoCapitalize="characters" />
        <TouchableOpacity style={st.applyBtn} onPress={() => { if (code.length < 3) return; redeemMut.mutate(code); }}>
          <Text style={{ ...F.small, color: C.white, fontWeight: '700' }}>Идэвхжүүлэх</Text>
        </TouchableOpacity>
      </View>

      {coupons.length === 0 ? (
        <View style={st.empty}><Ionicons name="gift-outline" size={48} color={C.bgSection} /><Text style={{ ...F.body, color: C.textMuted, marginTop: R.md }}>Купон байхгүй</Text></View>
      ) : coupons.map((c: any) => (
        <View key={c.id} style={st.card}>
          <View style={st.cardLeft}>
            <Text style={{ ...F.h3, color: C.brand }}>{c.discountPercent ? `${c.discountPercent}%` : `${(c.discountAmount || 0).toLocaleString()}₮`}</Text>
            <Text style={{ ...F.tiny, color: C.textMuted }}>хөнгөлөлт</Text>
          </View>
          <View style={{ flex: 1, paddingLeft: R.md }}>
            <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>{c.title || c.code}</Text>
            <Text style={{ ...F.tiny, color: C.textMuted, marginTop: 2 }}>{c.minOrder ? `${c.minOrder.toLocaleString()}₮+ захиалгад` : 'Бүх захиалгад'}</Text>
            <Text style={{ ...F.tiny, color: C.gold, marginTop: 4 }}>Дуусах: {new Date(c.expiresAt).toLocaleDateString('mn-MN')}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  inputRow: { flexDirection: 'row', gap: R.sm, marginBottom: R.lg },
  input: { flex: 1, backgroundColor: C.bgCard, borderRadius: R.md, padding: R.md, color: C.white, fontSize: 14, borderWidth: 0.5, borderColor: C.border },
  applyBtn: { backgroundColor: C.brand, borderRadius: R.md, paddingHorizontal: R.lg, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  card: { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 14, overflow: 'hidden', marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border },
  cardLeft: { width: 80, backgroundColor: C.brandDim, alignItems: 'center', justifyContent: 'center', padding: R.sm },
});
