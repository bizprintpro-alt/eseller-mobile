import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const REASONS = ['Бараа эвдэрсэн', 'Буруу бараа ирсэн', 'Чанар муу', 'Зурагнаас өөр', 'Хэмжээ тохирохгүй', 'Бусад'];
const fmt = (n: number) => n.toLocaleString() + '₮';

export default function ReturnsScreen() {
  const { data } = useQuery({ queryKey: ['delivered-orders'], queryFn: () => get('/buyer/orders?status=delivered') });
  const orders = ((data as any)?.orders || []).filter((o: any) => o.status === 'delivered');

  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const returnMut = useMutation({
    mutationFn: (body: any) => post(`/orders/${selected}/return`, body),
    onSuccess: () => { Alert.alert('Амжилттай', 'Буцаалтын хүсэлт илгээгдлээ'); setSelected(null); setReason(''); setPhotos([]); },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const pickImage = async () => {
    if (photos.length >= 4) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!r.canceled) setPhotos([...photos, r.assets[0].uri]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <Text style={{ ...F.tiny, color: C.gold, fontWeight: '600', marginBottom: R.md }}>48 цагийн дотор буцааж болно</Text>

      {orders.length === 0 ? (
        <View style={st.empty}><Ionicons name="bag-check-outline" size={48} color={C.bgSection} /><Text style={{ ...F.body, color: C.textMuted, marginTop: R.md }}>Буцааж болох захиалга байхгүй</Text></View>
      ) : orders.map((o: any) => (
        <TouchableOpacity key={o.id} style={[st.card, selected === o.id && { borderColor: C.brand }]} onPress={() => setSelected(selected === o.id ? null : o.id)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>#{o.orderNumber || o.id?.slice(-5)}</Text>
            <Ionicons name={selected === o.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected === o.id ? C.brand : C.textMuted} />
          </View>
          <Text style={{ ...F.body, color: C.secondary, fontWeight: '800' }}>{fmt(o.total || 0)}</Text>
          <Text style={{ ...F.tiny, color: C.textMuted }}>{(o.items || []).map((i: any) => i.name).join(', ')}</Text>
        </TouchableOpacity>
      ))}

      {selected && (
        <>
          <Text style={{ ...F.h4, color: C.white, marginTop: R.lg, marginBottom: R.sm }}>Шалтгаан</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: R.sm, marginBottom: R.sm }}>
            {REASONS.map(r => (
              <TouchableOpacity key={r} style={[st.chip, reason === r && { backgroundColor: C.brand }]} onPress={() => setReason(r)}>
                <Text style={{ ...F.tiny, color: reason === r ? C.white : C.textMuted, fontWeight: '600' }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ ...F.h4, color: C.white, marginTop: R.md, marginBottom: R.sm }}>Зураг</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: R.lg }}>
            {photos.map((uri, i) => (
              <TouchableOpacity key={i} onPress={() => setPhotos(photos.filter((_, j) => j !== i))}>
                <Image source={{ uri }} style={st.photo} /><View style={st.photoX}><Ionicons name="close-circle" size={20} color={C.brand} /></View>
              </TouchableOpacity>
            ))}
            {photos.length < 4 && (
              <TouchableOpacity style={st.addPhoto} onPress={pickImage}><Ionicons name="camera-outline" size={24} color={C.textMuted} /></TouchableOpacity>
            )}
          </ScrollView>

          <TouchableOpacity style={[st.submitBtn, returnMut.isPending && { opacity: 0.5 }]}
            disabled={returnMut.isPending} onPress={() => { if (!reason) return Alert.alert('Шалтгаан сонгоно уу'); returnMut.mutate({ reason, images: photos }); }}>
            {returnMut.isPending ? <ActivityIndicator color={C.white} /> : <Text style={{ ...F.body, color: C.white, fontWeight: '800' }}>Буцаалт хүсэх</Text>}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 60 },
  card: { backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  chip: { backgroundColor: C.bgInput, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  photo: { width: 70, height: 70, borderRadius: 10, marginRight: R.sm },
  photoX: { position: 'absolute', top: -6, right: 2 },
  addPhoto: { width: 70, height: 70, borderRadius: 10, backgroundColor: C.bgInput, alignItems: 'center', justifyContent: 'center' },
  submitBtn: { backgroundColor: C.brand, borderRadius: 14, padding: R.lg, alignItems: 'center' },
});
