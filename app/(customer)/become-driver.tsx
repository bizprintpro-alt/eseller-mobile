import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { post } from '../../src/services/api'
import { useAuth } from '../../src/store/auth'
import { C, R } from '../../src/shared/design'

const VEHICLE_TYPES = [
  { id: 'motorbike', label: 'Мотоцикл', icon: '🏍' },
  { id: 'car',       label: 'Авто',     icon: '🚗' },
  { id: 'van',       label: 'Ван',      icon: '🚐' },
  { id: 'truck',     label: 'Ачааны',   icon: '🚚' },
]

export default function BecomeDriver() {
  const { restoreSession } = useAuth() as any
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [password, setPass]   = useState('')
  const [licenseNumber, setLicense] = useState('')
  const [vehicle, setVehicle] = useState('motorbike')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !password) {
      Alert.alert('Дутуу', 'Нэр, утас, нууц үг оруулна уу')
      return
    }
    if (password.length < 6) {
      Alert.alert('Алдаа', 'Нууц үг 6+ тэмдэгт байх ёстой')
      return
    }
    if (!licenseNumber.trim()) {
      Alert.alert('Дутуу', 'Жолооны үнэмлэхний дугаар оруулна уу')
      return
    }
    setSubmitting(true)
    try {
      const res: any = await post('/auth/register', {
        name: name.trim(),
        phone: phone.trim(),
        password,
        role: 'delivery',
        // Driver-specific (backend хадгалахгүй ч ирээдүйд хадгалах боломжтой)
        licenseNumber: licenseNumber.trim(),
        vehicleType: vehicle,
      })
      if (res?.token) {
        await restoreSession(res.token)
        Alert.alert('Амжилттай', 'Жолооч бүртгэгдлээ. Захиалга хүлээн авах боломжтой.', [
          { text: 'OK', onPress: () => router.replace('/(driver)/deliveries' as any) },
        ])
      } else {
        throw new Error('Token буцаагдсангүй')
      }
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Бүртгэл амжилтгүй')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Жолооч болох', headerBackTitle: '' }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: C.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>

          {/* Header */}
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Text style={{ fontSize: 48 }}>🚚</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: C.text, marginTop: 8 }}>
              Жолооч болох
            </Text>
            <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4, textAlign: 'center' }}>
              Хүргэлт бүрт 3,000₮+, өдөр бүр payout
            </Text>
          </View>

          {/* Name */}
          <View>
            <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>Овог нэр *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Б. Болд"
              placeholderTextColor={C.textMuted}
              style={{
                backgroundColor: C.bgCard, borderRadius: R.lg,
                paddingHorizontal: 14, height: 46,
                color: C.text, fontSize: 14,
                borderWidth: 0.5, borderColor: C.border,
              }}
            />
          </View>

          {/* Phone */}
          <View>
            <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>Утас *</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="99001122"
              placeholderTextColor={C.textMuted}
              keyboardType="number-pad"
              maxLength={8}
              style={{
                backgroundColor: C.bgCard, borderRadius: R.lg,
                paddingHorizontal: 14, height: 46,
                color: C.text, fontSize: 14,
                borderWidth: 0.5, borderColor: C.border,
              }}
            />
          </View>

          {/* Password */}
          <View>
            <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>Нууц үг (6+ тэмдэгт) *</Text>
            <TextInput
              value={password}
              onChangeText={setPass}
              placeholder="••••••"
              placeholderTextColor={C.textMuted}
              secureTextEntry
              style={{
                backgroundColor: C.bgCard, borderRadius: R.lg,
                paddingHorizontal: 14, height: 46,
                color: C.text, fontSize: 14,
                borderWidth: 0.5, borderColor: C.border,
              }}
            />
          </View>

          {/* License */}
          <View>
            <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>Жолооны үнэмлэх *</Text>
            <TextInput
              value={licenseNumber}
              onChangeText={setLicense}
              placeholder="AA12345678"
              placeholderTextColor={C.textMuted}
              autoCapitalize="characters"
              style={{
                backgroundColor: C.bgCard, borderRadius: R.lg,
                paddingHorizontal: 14, height: 46,
                color: C.text, fontSize: 14,
                borderWidth: 0.5, borderColor: C.border,
              }}
            />
          </View>

          {/* Vehicle type */}
          <View>
            <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 8 }}>Тээврийн хэрэгсэл</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {VEHICLE_TYPES.map(v => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setVehicle(v.id)}
                  style={{
                    flex: 1, minWidth: '46%',
                    paddingVertical: 14,
                    borderRadius: R.lg,
                    backgroundColor: vehicle === v.id ? '#EA580C' : C.bgCard,
                    alignItems: 'center',
                    borderWidth: 0.5,
                    borderColor: vehicle === v.id ? '#EA580C' : C.border,
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{v.icon}</Text>
                  <Text style={{
                    fontSize: 12, fontWeight: '700',
                    color: vehicle === v.id ? '#fff' : C.textSub,
                  }}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? C.border : '#EA580C',
              borderRadius: R.lg,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>
                  Бүртгүүлэх
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={{ fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 4 }}>
            24 цагт баталгаажуулалт хийгдэж, захиалга хүлээн авч эхэлнэ
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
