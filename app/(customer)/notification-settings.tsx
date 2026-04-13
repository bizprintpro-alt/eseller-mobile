import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, R, F } from '../../src/shared/design';

const SETTINGS = [
  { key: 'order_status', label: 'Захиалгын статус', sub: 'Хүргэлт, баталгаажуулалт' },
  { key: 'delivery_update', label: 'Хүргэлтийн шинэчлэл', sub: 'Жолооч авлаа, хүрнэ' },
  { key: 'flash_sale', label: 'Flash sale', sub: 'Эхлэхээс 1 цагийн өмнө' },
  { key: 'points_earned', label: 'Оноо олсон', sub: 'Оноо нэмэгдэх бүрт' },
  { key: 'tier_change', label: 'Түвшин ахих', sub: 'Bronze → Silver' },
  { key: 'new_chat', label: 'Шинэ мессеж', sub: 'Борлуулагчаас мессеж' },
  { key: 'promo_coupon', label: 'Промо & Купон', sub: 'Тусгай санал' },
];

const STORAGE_KEY = '@eseller_notif_prefs';

export default function NotificationSettingsScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => { if (v) setPrefs(JSON.parse(v)); });
  }, []);

  const toggle = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <Text style={{ ...F.h2, color: C.white, marginBottom: R.lg }}>Мэдэгдэл тохиргоо</Text>
      {SETTINGS.map(s => (
        <View key={s.key} style={st.row}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...F.body, color: C.text, fontWeight: '600' }}>{s.label}</Text>
            <Text style={{ ...F.tiny, color: C.textMuted, marginTop: 2 }}>{s.sub}</Text>
          </View>
          <Switch value={prefs[s.key] !== false} onValueChange={() => toggle(s.key)}
            trackColor={{ false: C.bgSection, true: C.secondary + '66' }} thumbColor={prefs[s.key] !== false ? C.secondary : C.textMuted} />
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: C.border },
});
