import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { post } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const TYPES = [
  { key: 'GENERAL', icon: 'storefront-outline', label: 'Ерөнхий' },
  { key: 'PREORDER', icon: 'time-outline', label: 'Preorder' },
  { key: 'REAL_ESTATE', icon: 'home-outline', label: 'Үл хөдлөх' },
  { key: 'CONSTRUCTION', icon: 'construct-outline', label: 'Барилга' },
  { key: 'AUTO', icon: 'car-outline', label: 'Авто' },
  { key: 'SERVICE', icon: 'briefcase-outline', label: 'Үйлчилгээ' },
  { key: 'DIGITAL', icon: 'cloud-outline', label: 'Дижитал' },
];
const BANKS = ['Хаан банк', 'Голомт банк', 'ХХБ', 'Төрийн банк', 'Богд банк', 'Капитрон банк'];

export default function RegisterShopScreen() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [shopType, setShopType] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');
  const [about, setAbout] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const pickImg = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled) setLogo(r.assets[0].uri);
  };

  const canNext = () => {
    if (step === 1) return !!shopType;
    if (step === 2) return !!name && !!phone;
    if (step === 3) return true;
    if (step === 4) return !!bankName && !!bankAccount;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await post('/shops', { type: shopType, name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), phone, about, bankName, bankAccount });
      Alert.alert('Амжилттай! 🎉', 'Дэлгүүр үүслээ', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert('Алдаа', e.message); }
    setSubmitting(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      {/* Progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: R.xxl }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[st.dot, i <= step && { backgroundColor: C.primary }, i < step && { backgroundColor: C.secondary }]}>
              {i < step ? <Ionicons name="checkmark" size={14} color={C.white} /> : <Text style={{ color: i <= step ? C.white : C.textMuted, fontSize: 13, fontWeight: '700' }}>{i}</Text>}
            </View>
            {i < 4 && <View style={[st.line, i < step && { backgroundColor: C.secondary }]} />}
          </View>
        ))}
      </View>

      {step === 1 && (<>
        <Text style={{ ...F.h2, color: C.white, marginBottom: R.sm }}>Дэлгүүрийн төрөл</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {TYPES.map(t => (
            <TouchableOpacity key={t.key} style={[st.typeCard, shopType === t.key && { borderColor: C.primary, backgroundColor: C.primaryDim }]} onPress={() => setShopType(t.key)}>
              <Ionicons name={t.icon as any} size={28} color={shopType === t.key ? C.primary : C.textMuted} />
              <Text style={{ ...F.small, color: shopType === t.key ? C.white : C.textSub, fontWeight: '700', marginTop: R.sm }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>)}

      {step === 2 && (<>
        <Text style={{ ...F.h2, color: C.white, marginBottom: R.md }}>Мэдээлэл</Text>
        <TextInput style={st.input} placeholder="Дэлгүүрийн нэр *" placeholderTextColor={C.textMuted} value={name} onChangeText={setName} />
        <TextInput style={st.input} placeholder="Slug (жишээ: my-shop)" placeholderTextColor={C.textMuted} value={slug} onChangeText={t => setSlug(t.toLowerCase().replace(/[^a-z0-9-]/g, ''))} autoCapitalize="none" />
        <TextInput style={st.input} placeholder="Утас *" placeholderTextColor={C.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </>)}

      {step === 3 && (<>
        <Text style={{ ...F.h2, color: C.white, marginBottom: R.md }}>Лого & Тайлбар</Text>
        <TouchableOpacity style={st.logoPick} onPress={pickImg}>
          {logo ? <Image source={{ uri: logo }} style={{ width: '100%', height: '100%', borderRadius: 14 }} /> :
            <><Ionicons name="camera-outline" size={28} color={C.textMuted} /><Text style={{ ...F.tiny, color: C.textMuted, marginTop: 4 }}>Лого</Text></>}
        </TouchableOpacity>
        <TextInput style={[st.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Тайлбар" placeholderTextColor={C.textMuted} value={about} onChangeText={setAbout} multiline />
      </>)}

      {step === 4 && (<>
        <Text style={{ ...F.h2, color: C.white, marginBottom: R.md }}>Банкны мэдээлэл</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: R.md }}>
          {BANKS.map(b => (
            <TouchableOpacity key={b} style={[st.bankChip, bankName === b && { backgroundColor: C.primary, borderColor: C.primary }]} onPress={() => setBankName(b)}>
              <Text style={{ ...F.small, color: bankName === b ? C.white : C.textMuted }}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput style={st.input} placeholder="Дансны дугаар *" placeholderTextColor={C.textMuted} value={bankAccount} onChangeText={setBankAccount} keyboardType="number-pad" />
        <View style={{ ...st.infoCard }}>
          <Ionicons name="information-circle" size={18} color={C.primary} />
          <Text style={{ ...F.small, color: C.primary, flex: 1 }}>Эхний 3 сар 0% комисс!</Text>
        </View>
      </>)}

      {/* Nav buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: R.xxl }}>
        {step > 1 && <TouchableOpacity style={[st.navBtn, { backgroundColor: C.bgSection }]} onPress={() => setStep(step - 1)}><Text style={{ ...F.body, color: C.text, fontWeight: '700' }}>Буцах</Text></TouchableOpacity>}
        <TouchableOpacity style={[st.navBtn, { flex: 1, backgroundColor: C.primary }, !canNext() && { opacity: 0.4 }]}
          onPress={step === 4 ? handleSubmit : () => setStep(step + 1)} disabled={!canNext() || submitting}>
          {submitting ? <ActivityIndicator color={C.white} /> : <Text style={{ ...F.body, color: C.white, fontWeight: '800' }}>{step === 4 ? 'Дэлгүүр нээх 🎉' : 'Дараах'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  dot: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.bgInput, alignItems: 'center', justifyContent: 'center' },
  line: { width: 40, height: 2, backgroundColor: C.bgInput, marginHorizontal: 4 },
  typeCard: { width: '47%' as any, backgroundColor: C.bgCard, borderRadius: 14, padding: R.lg, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  input: { backgroundColor: C.bgCard, borderRadius: R.md, padding: 14, color: C.white, fontSize: 14, marginBottom: R.md, borderWidth: 0.5, borderColor: C.border },
  logoPick: { width: 120, height: 120, borderRadius: 14, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', marginBottom: R.md, alignSelf: 'center' },
  bankChip: { backgroundColor: C.bgCard, borderRadius: 20, paddingHorizontal: R.lg, paddingVertical: 9, marginRight: R.sm, borderWidth: 0.5, borderColor: C.border },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: R.sm, backgroundColor: C.primaryDim, borderRadius: R.md, padding: 14, marginTop: R.sm },
  navBtn: { borderRadius: 14, paddingVertical: R.lg, paddingHorizontal: R.xl, alignItems: 'center' },
});
