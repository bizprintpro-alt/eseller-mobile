import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useQuery, useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { get, put } from '../../src/services/api'
import { useAuth } from '../../src/store/auth'
import { RoleBadge } from '../../src/shared/ui/RoleSwitcher'
import { C, R } from '../../src/shared/design'

const FIELDS = [
  { key: 'name', label: 'Дэлгүүрийн нэр', placeholder: 'Миний дэлгүүр' },
  { key: 'phone', label: 'Утасны дугаар', placeholder: '9911-XXXX', keyboard: 'phone-pad' },
  { key: 'address', label: 'Хаяг', placeholder: 'БЗД, 3-р хороо' },
  { key: 'hours', label: 'Ажиллах цаг', placeholder: '09:00 - 21:00' },
  { key: 'description', label: 'Тайлбар', placeholder: 'Дэлгүүрийн тухай...', multiline: true },
]

export default function OwnerSettings() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    name: '', phone: '', address: '', description: '', hours: '09:00 - 21:00',
  })

  const handleLogout = () => {
    Alert.alert(
      'Гарах',
      'Та системээс гарахдаа итгэлтэй байна уу?',
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Гарах',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/(auth)/login' as never)
          },
        },
      ],
    )
  }

  const { data } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: () => get('/store/settings'),
  })

  useEffect(() => {
    const shop = (data as any)?.shop || (data as any)
    if (shop?.name) {
      setForm({
        name: shop.name || '',
        phone: shop.phone || '',
        address: shop.address || '',
        description: shop.description || '',
        hours: shop.hours || '09:00 - 21:00',
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (d: any) => put('/store/settings', d),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert('Амжилттай', 'Хадгалагдлаа')
    },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  })

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{
        padding: 16, paddingTop: 60,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>Дэлгүүрийн тохиргоо</Text>
        <RoleBadge />
      </View>

      {/* Account card */}
      <View style={{
        marginHorizontal: 12, marginBottom: 12,
        backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14,
        borderWidth: 1, borderColor: C.border,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: C.brand + '22',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="person" size={22} color={C.brand} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
            {user?.name || 'Хэрэглэгч'}
          </Text>
          <Text style={{ color: C.textSub, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
            {user?.email || user?.phone || ''}
          </Text>
        </View>
      </View>

      <View style={{ padding: 12 }}>
        {FIELDS.map(f => (
          <View key={f.key} style={{ marginBottom: 14 }}>
            <Text style={{ color: C.textSub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{f.label.toUpperCase()}</Text>
            <TextInput
              value={(form as any)[f.key]}
              onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
              placeholder={f.placeholder}
              placeholderTextColor={C.textMuted}
              keyboardType={(f as any).keyboard || 'default'}
              multiline={f.multiline}
              numberOfLines={f.multiline ? 3 : 1}
              style={{
                backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14,
                color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border,
                textAlignVertical: f.multiline ? 'top' : 'center',
              }}
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          style={{
            backgroundColor: saveMutation.isPending ? C.textMuted : '#34A853',
            borderRadius: R.lg, padding: 16, alignItems: 'center', marginTop: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
            {saveMutation.isPending ? 'Хадгалж байна...' : 'Хадгалах'}
          </Text>
        </TouchableOpacity>

        {/* Logout button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: 'transparent',
            borderRadius: R.lg, padding: 16,
            alignItems: 'center', marginTop: 20,
            borderWidth: 1, borderColor: C.brand,
            flexDirection: 'row', justifyContent: 'center', gap: 8,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={C.brand} />
          <Text style={{ color: C.brand, fontWeight: '700', fontSize: 15 }}>
            Системээс гарах
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
