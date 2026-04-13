import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const DISTRICTS = ['Баянгол', 'Баянзүрх', 'Сүхбаатар', 'Чингэлтэй', 'Хан-Уул', 'Сонгинохайрхан', 'Налайх', 'Багануур'];

export default function AddressesScreen() {
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['addresses'], queryFn: () => get('/buyer/addresses') });
  const addresses = (data as any)?.addresses || [];

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [detail, setDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const reset = () => { setName(''); setPhone(''); setDistrict(''); setDetail(''); setIsDefault(false); setEditId(null); setShowForm(false); };

  const saveMut = useMutation({
    mutationFn: (body: any) => editId ? put(`/buyer/addresses/${editId}`, body) : post('/buyer/addresses', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); reset(); },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del(`/buyer/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const openEdit = (a: any) => { setName(a.name); setPhone(a.phone); setDistrict(a.district); setDetail(a.detail); setIsDefault(a.isDefault); setEditId(a.id); setShowForm(true); };

  return (
    <ScrollView style={st.container} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: R.lg }}>
        <Text style={{ ...F.h2, color: C.white }}>Хүргэлтийн хаяг</Text>
        <TouchableOpacity style={st.addBtn} onPress={() => { reset(); setShowForm(true); }}>
          <Ionicons name="add" size={20} color={C.white} /><Text style={{ ...F.small, color: C.white, fontWeight: '700' }}>Нэмэх</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={st.formCard}>
          <Text style={{ ...F.h4, color: C.white, marginBottom: R.md }}>{editId ? 'Хаяг засах' : 'Шинэ хаяг'}</Text>
          <TextInput style={st.input} placeholder="Хүлээн авагч" placeholderTextColor={C.textMuted} value={name} onChangeText={setName} />
          <TextInput style={st.input} placeholder="Утас" placeholderTextColor={C.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {DISTRICTS.map(d => (
              <TouchableOpacity key={d} style={[st.chip, district === d && st.chipActive]} onPress={() => setDistrict(d)}>
                <Text style={[st.chipText, district === d && { color: C.white }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={[st.input, { height: 70, textAlignVertical: 'top' }]} placeholder="Дэлгэрэнгүй хаяг" placeholderTextColor={C.textMuted} value={detail} onChangeText={setDetail} multiline />
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: R.sm, marginBottom: R.md }} onPress={() => setIsDefault(!isDefault)}>
            <Ionicons name={isDefault ? 'checkbox' : 'square-outline'} size={22} color={isDefault ? C.brand : C.textMuted} />
            <Text style={{ ...F.small, color: C.text }}>Үндсэн хаяг</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[st.btn, { backgroundColor: C.bgSection }]} onPress={reset}><Text style={{ ...F.body, color: C.text, fontWeight: '700' }}>Болих</Text></TouchableOpacity>
            <TouchableOpacity style={[st.btn, { backgroundColor: C.brand }]} onPress={() => { if (!name || !phone || !district) return Alert.alert('Алдаа', 'Бөглөнө үү'); saveMut.mutate({ name, phone, district, detail, isDefault }); }}>
              <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>Хадгалах</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {addresses.length === 0 && !showForm ? (
        <View style={st.empty}><Ionicons name="location-outline" size={48} color={C.bgSection} /><Text style={{ ...F.body, color: C.textMuted, marginTop: R.md }}>Хаяг байхгүй</Text></View>
      ) : addresses.map((a: any) => (
        <View key={a.id} style={[st.card, a.isDefault && { borderColor: C.brand + '44' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: R.sm, flex: 1 }}>
              <Ionicons name="location" size={18} color={a.isDefault ? C.brand : C.textMuted} />
              <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>{a.name}</Text>
              {a.isDefault && <View style={st.defaultBadge}><Text style={{ fontSize: 9, color: C.brand, fontWeight: '800' }}>Үндсэн</Text></View>}
            </View>
            <View style={{ flexDirection: 'row', gap: R.sm }}>
              <TouchableOpacity onPress={() => openEdit(a)}><Ionicons name="create-outline" size={18} color={C.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Устгах?', '', [{ text: 'Болих' }, { text: 'Устгах', style: 'destructive', onPress: () => delMut.mutate(a.id) }])}>
                <Ionicons name="trash-outline" size={18} color={C.brand} /></TouchableOpacity>
            </View>
          </View>
          <Text style={{ ...F.small, color: C.textSub }}>{a.phone}</Text>
          <Text style={{ ...F.tiny, color: C.textMuted }}>{a.district} · {a.detail}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.brand, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  formCard: { backgroundColor: C.bgCard, borderRadius: R.lg, padding: R.lg, marginBottom: R.lg, borderWidth: 0.5, borderColor: C.border },
  input: { backgroundColor: C.bgInput, borderRadius: 10, padding: R.md, color: C.white, fontSize: 14, marginBottom: 10 },
  chip: { backgroundColor: C.bgInput, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: R.sm },
  chipActive: { backgroundColor: C.brand },
  chipText: { color: C.textMuted, fontSize: 12, fontWeight: '600' },
  btn: { flex: 1, borderRadius: R.md, padding: 14, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  card: { backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: C.border },
  defaultBadge: { backgroundColor: C.brandDim, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
});
