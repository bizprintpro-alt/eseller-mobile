import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/store/auth';
import { C, R } from '../../src/shared/design';

export default function LoginScreen() {
  const { login, loginWithBio, checkBio, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [hasBio, setHasBio] = useState(false);

  useEffect(() => {
    checkBio().then(setHasBio);
  }, []);

  const handleLogin = async () => {
    if (!email || !pass) {
      Alert.alert('Анхаар', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      await login(email.trim().toLowerCase(), pass);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Нэвтрэх үед алдаа гарлаа');
    }
  };

  const handleBio = async () => {
    const ok = await loginWithBio();
    if (ok) router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{
            fontSize: 40, fontWeight: '900', color: C.text, letterSpacing: -1,
          }}>
            eseller<Text style={{ color: C.brand }}>.mn</Text>
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14, marginTop: 8 }}>
            Монголын нэгдсэн платформ
          </Text>
        </View>

        {/* Email */}
        <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 6, fontWeight: '600' }}>
          Имэйл
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="example@gmail.com"
          placeholderTextColor={C.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            backgroundColor: C.bgSection, borderRadius: R.lg,
            padding: 16, color: C.text, fontSize: 15,
            marginBottom: 16, borderWidth: 1, borderColor: C.border,
          }}
        />

        {/* Password */}
        <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 6, fontWeight: '600' }}>
          Нууц үг
        </Text>
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="••••••••"
          placeholderTextColor={C.textMuted}
          secureTextEntry
          style={{
            backgroundColor: C.bgSection, borderRadius: R.lg,
            padding: 16, color: C.text, fontSize: 15,
            marginBottom: 24, borderWidth: 1, borderColor: C.border,
          }}
        />

        {/* Login button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: loading ? C.bgSection : C.brand,
            borderRadius: R.lg, padding: 17, alignItems: 'center', marginBottom: 12,
          }}
        >
          {loading ? (
            <ActivityIndicator color={C.text} />
          ) : (
            <Text style={{ color: C.white, fontSize: 16, fontWeight: '700' }}>
              Нэвтрэх
            </Text>
          )}
        </TouchableOpacity>

        {/* Biometric */}
        {hasBio && (
          <TouchableOpacity
            onPress={handleBio}
            style={{
              backgroundColor: C.bgSection, borderRadius: R.lg,
              padding: 17, alignItems: 'center', marginBottom: 24,
              borderWidth: 1, borderColor: C.border,
              flexDirection: 'row', justifyContent: 'center', gap: 8,
            }}
          >
            <Text style={{ fontSize: 20 }}>
              {Platform.OS === 'ios' ? '🔐' : '👆'}
            </Text>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '600' }}>
              {Platform.OS === 'ios' ? 'Face ID-ээр нэвтрэх' : 'Хурууны хээгээр нэвтрэх'}
            </Text>
          </TouchableOpacity>
        )}

        {/* OTP */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/otp')}
          style={{ alignItems: 'center', marginBottom: 16 }}
        >
          <Text style={{ color: C.brand, fontSize: 14 }}>
            Утасны дугаараар нэвтрэх
          </Text>
        </TouchableOpacity>

        {/* Register */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>
            Бүртгэл байхгүй юу?
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={{ color: C.brand, fontSize: 14, fontWeight: '600' }}>
              Бүртгүүлэх
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={{ alignItems: 'center', marginTop: 20 }}
        >
          <Text style={{ color: C.textMuted, fontSize: 13 }}>
            Нэвтрэлгүй үргэлжлүүлэх →
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
