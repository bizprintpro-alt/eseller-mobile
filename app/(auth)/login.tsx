import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, R } from '../../src/shared/design';
import { useAuth } from '../../src/store/auth';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Алдаа', 'И-мэйл болон нууц үг оруулна уу');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Нэвтрэх амжилтгүй');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', padding: 24 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={{ color: C.brand, fontSize: 32, fontWeight: '900', textAlign: 'center' }}>
          eseller.mn
        </Text>
        <Text style={{ color: C.textSub, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 40 }}>
          Нэвтрэх
        </Text>

        <TextInput
          placeholder="И-мэйл"
          placeholderTextColor={C.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: C.bgCard, borderRadius: R.lg,
            padding: 16, color: C.text, fontSize: 15,
            borderWidth: 1, borderColor: C.border, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Нууц үг"
          placeholderTextColor={C.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            backgroundColor: C.bgCard, borderRadius: R.lg,
            padding: 16, color: C.text, fontSize: 15,
            borderWidth: 1, borderColor: C.border, marginBottom: 24,
          }}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: C.brand, borderRadius: R.lg,
            padding: 16, alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '700' }}>
              Нэвтрэх
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={{ color: C.textSub, fontSize: 14 }}>
            Буцах
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
