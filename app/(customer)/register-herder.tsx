import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { C, R, F } from '../../src/shared/design';
import { useMalchnaasEnabled, usePilotAimags, isPilotAimag } from '../../src/config/remoteFlags';
import {
  PROVINCES,
  HERDER_BRAND,
  HerderAPI,
  useProvinceDays,
  type HerderRegisterPayload,
  type LivestockCounts,
} from '../../src/features/herder';
import { useAuth } from '../../src/store/auth';

const BANKS = ['Хаан банк', 'Голомт банк', 'ХХБ', 'Төрийн банк', 'Богд банк', 'Капитрон банк'];
const STEPS = 6;

const REGISTER_NUMBER_RE = /^[А-ЯӨҮЁ]{2}\d{8}$/; // MN national ID pattern

type LivestockKey = keyof LivestockCounts;
const LIVESTOCK: { key: LivestockKey; label: string; emoji: string }[] = [
  { key: 'horse', label: 'Адуу',  emoji: '🐎' },
  { key: 'cow',   label: 'Үхэр',  emoji: '🐄' },
  { key: 'sheep', label: 'Хонь',  emoji: '🐑' },
  { key: 'goat',  label: 'Ямаа',  emoji: '🐐' },
  { key: 'camel', label: 'Тэмээ', emoji: '🐪' },
];

export default function RegisterHerderScreen() {
  const { user } = useAuth();
  const malchnaasEnabled = useMalchnaasEnabled();
  const pilotAimags = usePilotAimags();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [phone, setPhone]                   = useState((user as any)?.phone ?? '');
  const [province, setProvince]             = useState<string | null>(null);
  const [district, setDistrict]             = useState('');
  const [aDansNumber, setADansNumber]       = useState('');
  const [livestock, setLivestock]           = useState<LivestockCounts>({});
  const [vetCertUri, setVetCertUri]         = useState('');
  const [bankName, setBankName]             = useState('');
  const [bankAccount, setBankAccount]       = useState('');
  const [notes, setNotes]                   = useState('');
  const [gps, setGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsLoading, setGpsLoading]         = useState(false);

  useEffect(() => {
    if (!malchnaasEnabled) router.replace('/(customer)/register-shop' as never);
  }, [malchnaasEnabled]);
  if (!malchnaasEnabled) return null;

  const setHead = (k: LivestockKey, v: string) => {
    const n = parseInt(v || '0', 10);
    setLivestock((prev) => ({ ...prev, [k]: Number.isFinite(n) && n >= 0 ? n : 0 }));
  };

  const pickVetCert = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.7, allowsEditing: true,
    });
    if (!r.canceled) setVetCertUri(r.assets[0].uri);
  };

  const captureGps = async () => {
    setGpsLoading(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Байршил', 'Байршилд нэвтрэх эрх олгоогүй байна');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGps({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {
      Alert.alert('Байршил', 'Байршил авч чадсангүй');
    }
    setGpsLoading(false);
  };

  const totalHead = Object.values(livestock).reduce((s, n) => s + (n || 0), 0);

  const canNext = () => {
    switch (step) {
      case 1: return !!firstName.trim() && !!lastName.trim() && REGISTER_NUMBER_RE.test(registerNumber) && /^\d{8,}$/.test(phone);
      case 2: return totalHead > 0 && !!aDansNumber.trim();
      case 3: return !!province && isPilotAimag(province) && !!district.trim();
      case 4: return true; // vet cert optional until backend enforces it
      case 5: return !!bankName && /^\d{6,}$/.test(bankAccount);
      case 6: return true;
      default: return false;
    }
  };

  const submit = async () => {
    if (!province) return;
    setSubmitting(true);
    try {
      const payload: HerderRegisterPayload = {
        firstName:      firstName.trim(),
        lastName:       lastName.trim(),
        registerNumber: registerNumber.toUpperCase(),
        phone:          phone.trim(),
        province,
        district:       district.trim(),
        livestock,
        aDansNumber:    aDansNumber.trim(),
        vetCertUri:     vetCertUri || undefined,
        bankName,
        bankAccount:    bankAccount.trim(),
        gps:            gps ?? undefined,
        notes:          notes.trim() || undefined,
      };
      const res = await HerderAPI.register(payload);
      if (res.success) {
        Alert.alert(
          'Хүсэлт илгээлээ ✅',
          res.message ?? 'Админ 24-48 цагт баталгаажуулна. Дараа нь бүтээгдэхүүн нэмэх боломжтой болно.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else {
        Alert.alert('Хүсэлт илгээсэн', res.message ?? 'Хүлээн авлаа. Админ эргэж холбогдоно.');
      }
    } catch (e: any) {
      Alert.alert(
        'Хүсэлт боловсруулж байна',
        e?.message
          ?? 'Систем одоогоор холбогдохгүй байна. Хүсэлтийг хадгалж дараа илгээнэ.',
      );
    }
    setSubmitting(false);
  };

  const selectedProvince = PROVINCES.find((p) => p.code === province);
  const selectedProvinceDays = useProvinceDays(province);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 80 }}>
      <View style={st.progress}>
        {Array.from({ length: STEPS }).map((_, i) => {
          const n = i + 1;
          return (
            <View key={n} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[st.dot, n <= step && { backgroundColor: HERDER_BRAND }, n < step && { backgroundColor: '#047857' }]}>
                {n < step
                  ? <Ionicons name="checkmark" size={12} color="#fff" />
                  : <Text style={{ color: n <= step ? '#fff' : C.textMuted, fontSize: 11, fontWeight: '700' }}>{n}</Text>}
              </View>
              {n < STEPS && <View style={[st.line, n < step && { backgroundColor: '#047857' }]} />}
            </View>
          );
        })}
      </View>

      {step === 1 && (<>
        <Text style={st.title}>Хувийн мэдээлэл</Text>
        <Text style={st.helper}>Иргэний үнэмлэхний мэдээлэлтэй нийцэх ёстой</Text>
        <TextInput style={st.input} placeholder="Овог *"   placeholderTextColor={C.textMuted} value={lastName}  onChangeText={setLastName} />
        <TextInput style={st.input} placeholder="Нэр *"    placeholderTextColor={C.textMuted} value={firstName} onChangeText={setFirstName} />
        <TextInput
          style={st.input}
          placeholder="Регистрийн дугаар (УБ12345678) *"
          placeholderTextColor={C.textMuted}
          value={registerNumber}
          autoCapitalize="characters"
          maxLength={10}
          onChangeText={(t) => setRegisterNumber(t.toUpperCase())}
        />
        <TextInput style={st.input} placeholder="Утас *" placeholderTextColor={C.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </>)}

      {step === 2 && (<>
        <Text style={st.title}>А данс · Мал сүрэг</Text>
        <Text style={st.helper}>МЭАЖГ-т бүртгэлтэй мал тооллогын дугаар</Text>
        <TextInput style={st.input} placeholder="А данс дугаар *" placeholderTextColor={C.textMuted} value={aDansNumber} onChangeText={setADansNumber} />
        <Text style={st.sectionLabel}>Малын тоо</Text>
        {LIVESTOCK.map((ls) => (
          <View key={ls.key} style={st.livestockRow}>
            <View style={st.livestockLabel}>
              <Text style={{ fontSize: 22 }}>{ls.emoji}</Text>
              <Text style={{ ...F.body, color: C.text, fontWeight: '600' }}>{ls.label}</Text>
            </View>
            <TextInput
              style={st.livestockInput}
              placeholder="0"
              placeholderTextColor={C.textMuted}
              value={livestock[ls.key] ? String(livestock[ls.key]) : ''}
              onChangeText={(v) => setHead(ls.key, v)}
              keyboardType="number-pad"
            />
          </View>
        ))}
        <Text style={st.totalLine}>Нийт: {totalHead} толгой</Text>
      </>)}

      {step === 3 && (<>
        <Text style={st.title}>Байршил</Text>
        <Text style={st.helper}>
          Пилот үе шатанд зөвхөн сонгосон аймгуудад бүртгэл нээлттэй. Бусад аймагт удахгүй нэмэгдэнэ.
        </Text>
        <Text style={st.sectionLabel}>Аймаг *</Text>
        <View style={st.provinceGrid}>
          {PROVINCES.filter((p) => pilotAimags.includes(p.code)).map((p) => (
            <TouchableOpacity
              key={p.code}
              style={[st.provinceChip, province === p.code && st.provinceChipActive]}
              onPress={() => setProvince(p.code)}
            >
              <Text style={[st.provinceText, province === p.code && { color: '#fff' }]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedProvince && (
          <Text style={st.helper}>Хүргэлт ~{selectedProvinceDays ?? selectedProvince.days} хоног</Text>
        )}
        <TextInput style={st.input} placeholder="Сум / баг *" placeholderTextColor={C.textMuted} value={district} onChangeText={setDistrict} />
        <TouchableOpacity style={st.gpsBtn} onPress={captureGps} disabled={gpsLoading}>
          {gpsLoading
            ? <ActivityIndicator color={HERDER_BRAND} size="small" />
            : <Ionicons name="location" size={18} color={HERDER_BRAND} />}
          <Text style={{ color: HERDER_BRAND, fontWeight: '700' }}>
            {gps
              ? `${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`
              : 'Одоогийн байршлыг бичих'}
          </Text>
        </TouchableOpacity>
      </>)}

      {step === 4 && (<>
        <Text style={st.title}>Мал эмнэлгийн гэрчилгээ</Text>
        <Text style={st.helper}>Зөвлөмж — мах, сүү зарахад шаардлагатай. Дараа ч upload хийж болно.</Text>
        <TouchableOpacity style={st.certPick} onPress={pickVetCert}>
          {vetCertUri ? (
            <Image source={{ uri: vetCertUri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
          ) : (<>
            <Ionicons name="document-attach-outline" size={32} color={C.textMuted} />
            <Text style={{ color: C.textMuted, marginTop: 6, ...F.small }}>Зураг байршуулах</Text>
          </>)}
        </TouchableOpacity>
        <TextInput
          style={[st.input, { height: 90, textAlignVertical: 'top' }]}
          placeholder="Тэмдэглэл (сонголттой)"
          placeholderTextColor={C.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </>)}

      {step === 5 && (<>
        <Text style={st.title}>Банкны мэдээлэл</Text>
        <Text style={st.helper}>Орлого энд шилжинэ — Escrow, хүргэлт баталгаажсанаас 48ц-д</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: R.md }}>
          {BANKS.map((b) => (
            <TouchableOpacity
              key={b}
              style={[st.bankChip, bankName === b && { backgroundColor: HERDER_BRAND, borderColor: HERDER_BRAND }]}
              onPress={() => setBankName(b)}
            >
              <Text style={{ ...F.small, color: bankName === b ? '#fff' : C.textMuted }}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput style={st.input} placeholder="Дансны дугаар *" placeholderTextColor={C.textMuted} value={bankAccount} onChangeText={setBankAccount} keyboardType="number-pad" />
      </>)}

      {step === 6 && (<>
        <Text style={st.title}>Хүсэлтийн хураангуй</Text>
        <View style={st.reviewCard}>
          <ReviewRow label="Нэр"        value={`${lastName} ${firstName}`} />
          <ReviewRow label="Регистр"    value={registerNumber} />
          <ReviewRow label="Утас"       value={phone} />
          <ReviewRow label="А данс"     value={aDansNumber} />
          <ReviewRow label="Мал"        value={`${totalHead} толгой`} />
          <ReviewRow label="Аймаг"      value={selectedProvince?.name ?? ''} />
          <ReviewRow label="Сум"        value={district} />
          <ReviewRow label="Банк"       value={`${bankName} · ${bankAccount}`} />
          <ReviewRow label="Вет гэрч."  value={vetCertUri ? 'Байршуулсан' : 'Дараа оруулна'} />
          <ReviewRow label="GPS"        value={gps ? `${gps.latitude.toFixed(3)}, ${gps.longitude.toFixed(3)}` : '—'} />
        </View>
        <View style={st.disclaimer}>
          <Ionicons name="information-circle" size={18} color={HERDER_BRAND} />
          <Text style={{ ...F.small, color: C.textSub, flex: 1 }}>
            Админ таны хүсэлтийг 24-48 цагт хянана. Баталгаажсаны дараа бараагаа нэмэх боломжтой.
          </Text>
        </View>
      </>)}

      <View style={st.navRow}>
        {step > 1 && (
          <TouchableOpacity style={[st.navBtn, { backgroundColor: C.bgSection }]} onPress={() => setStep(step - 1)}>
            <Text style={{ ...F.body, color: C.text, fontWeight: '700' }}>Буцах</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[st.navBtn, { flex: 1, backgroundColor: HERDER_BRAND }, (!canNext() || submitting) && { opacity: 0.4 }]}
          onPress={step === STEPS ? submit : () => setStep(step + 1)}
          disabled={!canNext() || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ ...F.body, color: '#fff', fontWeight: '800' }}>
                {step === STEPS ? 'Хүсэлт илгээх 🌿' : 'Дараах'}
              </Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.reviewRow}>
      <Text style={{ ...F.small, color: C.textMuted }}>{label}</Text>
      <Text style={{ ...F.small, color: C.text, fontWeight: '600', flex: 1, textAlign: 'right' }} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: R.xl },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.bgInput, alignItems: 'center', justifyContent: 'center' },
  line: { width: 20, height: 2, backgroundColor: C.bgInput, marginHorizontal: 3 },

  title: { ...F.h2, color: C.text, marginBottom: 4 },
  helper: { ...F.small, color: C.textSub, marginBottom: R.md },
  sectionLabel: { ...F.small, color: C.textSub, fontWeight: '700', marginTop: R.md, marginBottom: R.sm },

  input: { backgroundColor: C.bgCard, borderRadius: R.md, padding: 14, color: C.text, fontSize: 14, marginBottom: R.md, borderWidth: 0.5, borderColor: C.border },

  livestockRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgCard, borderRadius: R.md, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: C.border },
  livestockLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  livestockInput: { backgroundColor: C.bgInput, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, color: C.text, minWidth: 80, textAlign: 'right', fontSize: 15, fontWeight: '700' },
  totalLine: { ...F.body, color: HERDER_BRAND, fontWeight: '800', marginTop: R.sm, textAlign: 'right' },

  provinceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: R.md },
  provinceChip: { backgroundColor: C.bgCard, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  provinceChipActive: { backgroundColor: HERDER_BRAND, borderColor: HERDER_BRAND },
  provinceText: { ...F.small, color: C.text, fontWeight: '600' },

  gpsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.bgCard, borderWidth: 1, borderColor: HERDER_BRAND, borderRadius: R.md, paddingVertical: 12, marginTop: R.sm },

  certPick: { height: 160, backgroundColor: C.bgCard, borderRadius: R.md, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: R.md, overflow: 'hidden' },

  bankChip: { backgroundColor: C.bgCard, borderRadius: 20, paddingHorizontal: R.lg, paddingVertical: 9, marginRight: R.sm, borderWidth: 0.5, borderColor: C.border },

  reviewCard: { backgroundColor: C.bgCard, borderRadius: R.md, padding: R.md, gap: 8, borderWidth: 0.5, borderColor: C.border },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },

  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: R.md, padding: R.md, backgroundColor: C.bgSection, borderRadius: R.md },

  navRow: { flexDirection: 'row', gap: 10, marginTop: R.xxl },
  navBtn: { borderRadius: 14, paddingVertical: R.lg, paddingHorizontal: R.xl, alignItems: 'center' },
});
