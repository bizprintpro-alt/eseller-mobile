import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../src/store/auth';
import { C, R } from '../../src/shared/design';

const TEST_USERS = [
  { label: '🛍️ Худалдан авагч', phone: '99000001', color: '#1A73E8' },
  { label: '🏪 Дэлгүүр эзэн',   phone: '99000002', color: '#0D652D' },
  { label: '🚚 Жолооч',          phone: '99000003', color: '#C62828' },
  { label: '📢 Борлуулагч',      phone: '99000004', color: '#E37400' },
];
const TEST_PASSWORD = 'test1234';

function routeByRole(role: string) {
  const r = role?.toLowerCase();
  // Store owner gets separate (owner) tab layout with dashboard/products/orders/...
  if (r === 'seller' || r === 'store' || r === 'owner') {
    router.replace('/(owner)/dashboard' as any);
    return;
  }
  // Everyone else → main (tabs) layout — it auto-configures per role:
  //   BUYER    → home feed
  //   SELLER   → seller dashboard (affiliate commission)
  //   DRIVER   → driver deliveries
  // via (tabs)/index.tsx + (tabs)/_layout.tsx
  router.replace('/(tabs)');
}

export default function LoginScreen() {
  const { login, loginWithBio, checkBio, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [hasBio, setHasBio] = useState(false);

  useEffect(() => {
    checkBio().then(setHasBio);
  }, []);

  async function quickLogin(testPhone: string) {
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      await login(testPhone, TEST_PASSWORD);
      const currentUser = useAuth.getState().user;
      routeByRole(currentUser?.role || 'buyer');
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Нэвтрэх үед алдаа гарлаа');
    }
  }

  const handleLogin = async () => {
    if (!email || !pass) {
      Alert.alert('Анхаар', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      await login(email.trim(), pass);
      const currentUser = useAuth.getState().user;
      routeByRole(currentUser?.role || 'buyer');
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
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{
            fontSize: 40, fontWeight: '900', color: C.text, letterSpacing: -1,
          }}>
            eseller<Text style={{ color: C.brand }}>.mn</Text>
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14, marginTop: 8 }}>
            Монголын нэгдсэн платформ
          </Text>
        </View>

        {/* Quick Login — 4 test roles */}
        <View style={{
          backgroundColor: C.bgCard, borderRadius: R.lg,
          padding: 14, marginBottom: 18,
          borderWidth: 1, borderColor: C.border,
        }}>
          <Text style={{
            color: C.textSub, fontSize: 12, fontWeight: '600',
            marginBottom: 10, textAlign: 'center',
          }}>
            ⚡ Хурдан нэвтрэх (тест)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TEST_USERS.map((u) => (
              <TouchableOpacity
                key={u.phone}
                onPress={() => quickLogin(u.phone)}
                disabled={loading}
                style={{
                  flexBasis: '47%', backgroundColor: C.bgSection,
                  borderRadius: R.md, padding: 10, alignItems: 'center',
                  borderWidth: 1.5, borderColor: u.color,
                }}
              >
                <Text style={{ color: u.color, fontSize: 12, fontWeight: '600' }}>
                  {u.label}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                  {u.phone}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Email / Phone */}
        <Text style={{ color: C.textSub, fontSize: 13, marginBottom: 6, fontWeight: '600' }}>
          Имэйл эсвэл утас
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="example@gmail.com эсвэл 99XXXXXX"
          placeholderTextColor={C.textMuted}
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

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1, height: 0.5, backgroundColor: C.border }} />
          <Text style={{ color: C.textMuted, fontSize: 12, marginHorizontal: 12 }}>эсвэл</Text>
          <View style={{ flex: 1, height: 0.5, backgroundColor: C.border }} />
        </View>

        {/* Google */}
        <TouchableOpacity
          onPress={async () => {
            try {
              const baseUrl = __DEV__ ? 'http://192.168.1.9:3000' : 'https://eseller.mn';
              await WebBrowser.openBrowserAsync(`${baseUrl}/api/auth/google?role=buyer&redirect=eseller://auth/callback`);
            } catch {}
          }}
          style={{
            backgroundColor: C.white, borderRadius: R.lg,
            padding: 15, alignItems: 'center', marginBottom: 12,
            flexDirection: 'row', justifyContent: 'center', gap: 10,
          }}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={{ color: '#333', fontSize: 15, fontWeight: '600' }}>Google-ээр нэвтрэх</Text>
        </TouchableOpacity>

        {/* OTP */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/otp')}
          style={{
            backgroundColor: C.bgSection, borderRadius: R.lg,
            padding: 15, alignItems: 'center', marginBottom: 16,
            flexDirection: 'row', justifyContent: 'center', gap: 10,
            borderWidth: 1, borderColor: C.border,
          }}
        >
          <Ionicons name="phone-portrait" size={18} color={C.text} />
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '600' }}>Утсаар нэвтрэх</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
