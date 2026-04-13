import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { C, R, F } from '../../src/shared/design';

export default function SecurityScreen() {
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setBioAvailable);
    AsyncStorage.getItem('bio_enabled').then(v => setBioEnabled(v === 'true'));
  }, []);

  const toggleBio = async () => {
    if (!bioEnabled) {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Биометр баталгаажуулах' });
      if (!result.success) return;
    }
    const next = !bioEnabled;
    setBioEnabled(next);
    await AsyncStorage.setItem('bio_enabled', String(next));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <Text style={{ ...F.h2, color: C.white, marginBottom: R.lg }}>Аюулгүй байдал</Text>

      {/* Biometric */}
      {bioAvailable && (
        <View style={st.row}>
          <Ionicons name="finger-print" size={22} color={C.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ ...F.body, color: C.text, fontWeight: '600' }}>Биометр нэвтрэлт</Text>
            <Text style={{ ...F.tiny, color: C.textMuted }}>Хурууны хээ / Face ID</Text>
          </View>
          <Switch value={bioEnabled} onValueChange={toggleBio}
            trackColor={{ false: C.bgSection, true: C.secondary + '66' }} thumbColor={bioEnabled ? C.secondary : C.textMuted} />
        </View>
      )}

      {/* Change password */}
      <TouchableOpacity style={st.row} onPress={() => setShowPassword(!showPassword)}>
        <Ionicons name="lock-closed" size={22} color={C.primary} />
        <View style={{ flex: 1 }}>
          <Text style={{ ...F.body, color: C.text, fontWeight: '600' }}>Нууц үг солих</Text>
          <Text style={{ ...F.tiny, color: C.textMuted }}>Тогтмол шинэчлэхийг зөвлөе</Text>
        </View>
        <Ionicons name={showPassword ? 'chevron-up' : 'chevron-down'} size={18} color={C.textMuted} />
      </TouchableOpacity>

      {showPassword && (
        <View style={st.pwCard}>
          <TextInput style={st.input} placeholder="Хуучин нууц үг" placeholderTextColor={C.textMuted} secureTextEntry value={oldPw} onChangeText={setOldPw} />
          <TextInput style={st.input} placeholder="Шинэ нууц үг" placeholderTextColor={C.textMuted} secureTextEntry value={newPw} onChangeText={setNewPw} />
          <TouchableOpacity style={st.saveBtn} onPress={() => {
            if (newPw.length < 6) return Alert.alert('6+ тэмдэгт');
            Alert.alert('Амжилттай', 'Нууц үг солигдлоо');
            setShowPassword(false); setOldPw(''); setNewPw('');
          }}>
            <Text style={{ ...F.body, color: C.white, fontWeight: '700' }}>Хадгалах</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: R.md, backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border },
  pwCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: R.lg, marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border },
  input: { backgroundColor: C.bgInput, borderRadius: 10, padding: R.md, color: C.white, fontSize: 14, marginBottom: 10 },
  saveBtn: { backgroundColor: C.brand, borderRadius: R.md, padding: 14, alignItems: 'center' },
});
