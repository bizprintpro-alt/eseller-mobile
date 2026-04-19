import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { post } from '../../src/services/api';
import { C, R } from '../../src/shared/design';
import { OTP_ENABLED_DEFAULT } from '../../src/config/flags';

type Step = 1 | 2 | 3;

export default function ForgotPasswordScreen() {
  // Deep-link safeguard: if the OTP flag is off, bounce to login instead of
  // letting the user hit a 404 on /auth/otp/send.
  if (!OTP_ENABLED_DEFAULT) {
    return <Redirect href={'/(auth)/login' as never} />;
  }
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!/^\d{8,}$/.test(phone.trim())) {
      Alert.alert('Анхаар', '8+ оронтой утасны дугаар оруулна уу');
      return;
    }
    setLoading(true);
    try {
      await post('/auth/otp/send', { phone: phone.trim() });
      setStep(2);
      Alert.alert('Амжилттай', 'OTP код илгээгдлээ');
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'OTP илгээж чадсангүй');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!/^\d{4,6}$/.test(otp.trim())) {
      Alert.alert('Анхаар', '4–6 оронтой код оруулна уу');
      return;
    }
    setLoading(true);
    try {
      const res: any = await post('/auth/otp/verify', {
        phone: phone.trim(),
        code: otp.trim(),
      });
      const body = res?.data ?? res;
      const token = body?.token ?? body?.resetToken ?? '';
      if (!token) {
        Alert.alert('Алдаа', 'Токен олдсонгүй');
        return;
      }
      setResetToken(token);
      setStep(3);
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'OTP буруу');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (newPassword.length < 8) {
      Alert.alert('Анхаар', 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Анхаар', 'Нууц үг таарахгүй байна');
      return;
    }
    setLoading(true);
    try {
      await post('/auth/reset-password', {
        token: resetToken,
        phone: phone.trim(),
        newPassword,
      });
      Alert.alert('Амжилттай', 'Нууц үг шинэчлэгдлээ. Нэвтэрнэ үү.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login' as never) },
      ]);
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Нууц үг шинэчилж чадсангүй');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>

        <Text style={{ fontSize: 26, fontWeight: '900', color: C.text }}>Нууц үг сэргээх</Text>
        <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 6, marginBottom: 24 }}>
          Алхам {step} / 3
        </Text>

        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: step >= s ? C.brand : C.bgSection,
              }}
            />
          ))}
        </View>

        {step === 1 && (
          <>
            <Label>Утасны дугаар</Label>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="99XXXXXX"
              placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
              style={inputStyle}
            />
            <PrimaryBtn label="OTP илгээх" onPress={sendOtp} loading={loading} />
          </>
        )}

        {step === 2 && (
          <>
            <Label>Баталгаажуулах код</Label>
            <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 8 }}>
              {phone}-руу илгээгдсэн 6 оронтой код
            </Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
              placeholderTextColor={C.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              style={[inputStyle, { letterSpacing: 6, textAlign: 'center', fontSize: 20 }]}
            />
            <PrimaryBtn label="Баталгаажуулах" onPress={verifyOtp} loading={loading} />
            <TouchableOpacity onPress={() => setStep(1)} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: C.textSub, fontSize: 12 }}>← Утсаа өөрчлөх</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Label>Шинэ нууц үг</Label>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="8+ тэмдэгт"
              placeholderTextColor={C.textMuted}
              secureTextEntry
              style={inputStyle}
            />
            <Label>Нууц үг давтах</Label>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Дахин оруулна уу"
              placeholderTextColor={C.textMuted}
              secureTextEntry
              style={inputStyle}
            />
            <PrimaryBtn label="Нууц үг хадгалах" onPress={resetPassword} loading={loading} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text style={{ color: C.textSub, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
      {children}
    </Text>
  );
}

function PrimaryBtn({
  label, onPress, loading,
}: { label: string; onPress: () => void; loading: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        backgroundColor: loading ? C.textMuted : C.brand,
        borderRadius: R.lg,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const inputStyle = {
  backgroundColor: C.bgCard,
  borderRadius: R.lg,
  padding: 14,
  color: C.text,
  fontSize: 15,
  borderWidth: 0.5,
  borderColor: C.border,
  marginBottom: 14,
};
