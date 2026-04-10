import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { post } from '../../src/services/api';
import { C, R } from '../../src/shared/design';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !pass) {
      Alert.alert('Анхаар', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    setLoading(true);
    try {
      await post('/auth/signup', { name, email, phone, password: pass });
      Alert.alert('Амжилттай', 'Бүртгэл үүслээ. Нэвтэрнэ үү.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e: any) {
      Alert.alert('Алдаа', e.message || 'Бүртгэл үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Нэр', value: name, set: setName, placeholder: 'Нэрээ оруулна уу', kb: 'default' as const },
    { label: 'Имэйл', value: email, set: setEmail, placeholder: 'example@gmail.com', kb: 'email-address' as const },
    { label: 'Утас', value: phone, set: setPhone, placeholder: '99XXXXXX', kb: 'phone-pad' as const },
    { label: 'Нууц үг', value: pass, set: setPass, placeholder: '••••••••', kb: 'default' as const, secure: true },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
        <Text style={{ color: C.brand, fontSize: 16 }}>← Буцах</Text>
      </TouchableOpacity>

      <Text style={{ color: C.text, fontSize: 28, fontWeight: '800', marginBottom: 8 }}>
        Бүртгүүлэх
      </Text>
      <Text style={{ color: C.textSub, fontSize: 14, marginBottom: 32 }}>
        Шинэ бүртгэл үүсгэх
      </Text>

      {fields.map((f) => (
        <View key={f.label} style={{ marginBottom: 16 }}>
          <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 6, fontWeight: '600' }}>
            {f.label}
          </Text>
          <TextInput
            value={f.value}
            onChangeText={f.set}
            placeholder={f.placeholder}
            placeholderTextColor={C.textMuted}
            keyboardType={f.kb}
            secureTextEntry={f.secure}
            autoCapitalize={f.kb === 'email-address' ? 'none' : 'sentences'}
            style={{
              backgroundColor: C.bgSection, borderRadius: R.lg,
              padding: 16, color: C.text, fontSize: 15,
              borderWidth: 1, borderColor: C.border,
            }}
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={{
          backgroundColor: C.brand, borderRadius: R.lg,
          padding: 17, alignItems: 'center', marginTop: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color={C.white} />
        ) : (
          <Text style={{ color: C.white, fontSize: 16, fontWeight: '700' }}>
            Бүртгүүлэх
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
