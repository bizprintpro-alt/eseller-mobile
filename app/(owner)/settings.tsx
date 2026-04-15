import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useQuery, useMutation } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { get, put } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

const FIELDS = [
  { key: 'name', label: 'Дэлгүүрийн нэр', placeholder: 'Миний дэлгүүр' },
  { key: 'phone', label: 'Утасны дугаар', placeholder: '9911-XXXX', keyboard: 'phone-pad' },
  { key: 'address', label: 'Хаяг', placeholder: 'БЗД, 3-р хороо' },
  { key: 'hours', label: 'Ажиллах цаг', placeholder: '09:00 - 21:00' },
  { key: 'description', label: 'Тайлбар', placeholder: 'Дэлгүүрийн тухай...', multiline: true },
]

export default function OwnerSettings() {
  const [form, setForm] = useState({
    name: '', phone: '', address: '', description: '', hours: '09:00 - 21:00',
  })

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
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>Дэлгүүрийн тохиргоо</Text>
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
      </View>
    </ScrollView>
  )
}
