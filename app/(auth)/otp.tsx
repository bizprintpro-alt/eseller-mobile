import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { routeByRole } from '../../src/shared/routing';
import { post } from '../../src/services/api';
import { C, R } from '../../src/shared/design';
import { OTP_ENABLED_DEFAULT } from '../../src/config/flags';

export default function OtpScreen() {
  // Deep-link safeguard (see forgot-password.tsx).
  if (!OTP_ENABLED_DEFAULT) {
    return <Redirect href={'/(auth)/login' as never} />;
  }
  const { loginWithOTP } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const sendOtp = async () => {
    if (phone.length < 8) {
      Alert.alert('Алдаа', 'Утасны дугаар оруулна уу');
      return;
    }
    setLoading(true);
    try {
      await post('/auth/otp-send', { phone });
      setSent(true);
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) { clearInterval(interval); return 0; }
          return t - 1;
        });
      }, 1000);
    } catch (e: any) {
      Alert.alert('Алдаа', e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert('Алдаа', 'OTP код оруулна уу');
      return;
    }
    setLoading(true);
    try {
      await loginWithOTP(phone, otp);
      const currentUser = useAuth.getState().user;
      routeByRole(currentUser?.role || 'buyer');
    } catch (e: any) {
      Alert.alert('Алдаа', e.message || 'OTP код буруу байна');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: 'center' }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
        <Text style={{ color: C.brand, fontSize: 16 }}>← Буцах</Text>
      </TouchableOpacity>

      <Text style={{ color: C.text, fontSize: 26, fontWeight: '800', marginBottom: 8 }}>
        Утасны дугаар
      </Text>
      <Text style={{ color: C.textSub, fontSize: 14, marginBottom: 32 }}>
        OTP код авч нэвтрэнэ үү
      </Text>

      {/* Phone input */}
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="99XXXXXX"
        placeholderTextColor={C.textMuted}
        keyboardType="phone-pad"
        maxLength={8}
        editable={!sent}
        style={{
          backgroundColor: C.bgSection, borderRadius: R.lg,
          padding: 16, color: C.text, fontSize: 20, letterSpacing: 4,
          marginBottom: 12, borderWidth: 1, borderColor: C.border,
        }}
      />

      {!sent ? (
        <TouchableOpacity
          onPress={sendOtp}
          disabled={loading}
          style={{
            backgroundColor: C.brand, borderRadius: R.lg,
            padding: 17, alignItems: 'center',
          }}
        >
          {loading
            ? <ActivityIndicator color={C.white} />
            : <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>OTP илгээх</Text>
          }
        </TouchableOpacity>
      ) : (
        <>
          <Text style={{ color: C.success, fontSize: 13, marginBottom: 16 }}>
            {phone} дугаарт код илгээлээ
          </Text>

          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="0000"
            placeholderTextColor={C.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            style={{
              backgroundColor: C.bgSection, borderRadius: R.lg,
              padding: 16, color: C.text, fontSize: 28, letterSpacing: 8,
              textAlign: 'center', marginBottom: 16,
              borderWidth: 1, borderColor: C.brand,
            }}
          />

          <TouchableOpacity
            onPress={verifyOtp}
            disabled={loading}
            style={{
              backgroundColor: C.brand, borderRadius: R.lg,
              padding: 17, alignItems: 'center', marginBottom: 12,
            }}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>Баталгаажуулах</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={timer === 0 ? sendOtp : undefined}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ color: timer > 0 ? C.textMuted : C.brand, fontSize: 14 }}>
              {timer > 0 ? `Дахин илгээх (${timer}с)` : 'Дахин илгээх'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
