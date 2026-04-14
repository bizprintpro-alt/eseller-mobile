import { useState } from 'react'
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useTheme } from '../../shared/useTheme'
import { useHaptic } from '../../shared/hooks/useHaptic'

export default function ProofScreen() {
  const { colors, accent } = useTheme()
  const haptic = useHaptic()
  const [photo, setPhoto] = useState<string | null>(null)

  async function takePhoto() {
    haptic.medium()
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Анхаар', 'Камерын зөвшөөрөл хэрэгтэй')
      return
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (!res.canceled) setPhoto(res.assets[0].uri)
  }

  async function submit() {
    if (!photo) return Alert.alert('Анхаар', 'Эхлээд зураг авна уу')
    haptic.success()
    Alert.alert('✅', 'Баталгаа илгээгдлээ')
    setPhoto(null)
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, paddingTop: 52 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 }}>
          Хүргэлтийн баталгаа
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSub, marginBottom: 16 }}>
          Хүргэлт хийсэн зургаа баталгаажуул
        </Text>

        <View style={{
          backgroundColor: colors.bgCard, borderRadius: 12, padding: 20,
          borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', gap: 16,
        }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: '100%', height: 240, borderRadius: 10 }} />
          ) : (
            <View style={{
              width: '100%', height: 240, borderRadius: 10,
              backgroundColor: colors.bgSection, alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
            }}>
              <Text style={{ fontSize: 48 }}>📷</Text>
              <Text style={{ color: colors.textSub, marginTop: 8 }}>Зураг хараахан авсан байгаа</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={takePhoto}
            style={{
              backgroundColor: accent, borderRadius: 10, padding: 14,
              width: '100%', alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
              📷 {photo ? 'Дахин авах' : 'Зураг авах'}
            </Text>
          </TouchableOpacity>

          {photo && (
            <TouchableOpacity
              onPress={submit}
              style={{
                backgroundColor: '#34A853', borderRadius: 10, padding: 14,
                width: '100%', alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✅ Илгээх</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
