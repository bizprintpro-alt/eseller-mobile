import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { post } from '../../src/services/api'
import { useAuth } from '../../src/store/auth'
import { C, R, F } from '../../src/shared/design'

const FEED_CATS = [
  { slug: 'auto-moto',       name: 'Авто' },
  { slug: 'real-estate-feed', name: 'Үл хөдлөх' },
  { slug: 'electronics',     name: 'Электроник' },
  { slug: 'fashion',         name: 'Хувцас' },
  { slug: 'services-feed',   name: 'Үйлчилгээ' },
  { slug: 'jobs-feed',       name: 'Ажлын зар' },
  { slug: 'furniture',       name: 'Тавилга' },
  { slug: 'other',           name: 'Бусад' },
]

const DISTRICTS = [
  'СБД', 'ХУД', 'БЗД', 'ЧД', 'БГД', 'СХД', 'НД', 'БНД',
]

export default function CreateFeedScreen() {
  const { user } = useAuth()
  const [title,    setTitle]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [price,    setPrice]    = useState('')
  const [phone,    setPhone]    = useState(user?.phone || '')
  const [category, setCategory] = useState('')
  const [district, setDistrict] = useState('')
  const [images,   setImages]   = useState<string[]>([])
  const [loading,  setLoading]  = useState(false)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    })
    if (!result.canceled) {
      setImages(prev => [
        ...prev,
        ...result.assets.map(a => a.uri),
      ].slice(0, 5))
    }
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Анхаар', 'Гарчиг оруулна уу')
      return
    }
    if (!category) {
      Alert.alert('Анхаар', 'Ангилал сонгоно уу')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', desc.trim())
      formData.append('category', category)
      if (price) formData.append('price', price)
      if (phone) formData.append('phone', phone)
      if (district) formData.append('district', district)

      images.forEach((uri, i) => {
        formData.append('images', {
          uri,
          name: `photo_${i}.jpg`,
          type: 'image/jpeg',
        } as any)
      })

      await post('/feed', formData)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert('Амжилттай', 'Зар нийтлэгдлээ!', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (e: any) {
      Alert.alert('Алдаа', e.message || 'Зар нийтлэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <View style={{
        flex: 1, backgroundColor: C.bg,
        alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <Ionicons name="lock-closed-outline" size={64} color={C.border} />
        <Text style={{ ...F.h3, color: C.text, marginTop: 16 }}>
          Нэвтрэх шаардлагатай
        </Text>
        <Text style={{ color: C.textMuted, marginTop: 8, textAlign: 'center' }}>
          Зар нийтлэхийн тулд нэвтэрнэ үү
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login' as any)}
          style={{
            backgroundColor: C.brand, borderRadius: R.lg,
            padding: 16, paddingHorizontal: 40, marginTop: 24,
          }}
        >
          <Text style={{ color: C.white, fontWeight: '700', fontSize: 15 }}>
            Нэвтрэх
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: C.border, gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={C.text} />
        </TouchableOpacity>
        <Text style={{ ...F.h3, color: C.text, flex: 1 }}>
          Зар нэмэх
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? C.bgSection : C.brand,
            borderRadius: R.lg, paddingHorizontal: 20, paddingVertical: 10,
          }}
        >
          {loading
            ? <ActivityIndicator color={C.white} size="small" />
            : <Text style={{ color: C.white, fontWeight: '700', fontSize: 14 }}>
                Нийтлэх
              </Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Зурагнууд */}
        <Text style={{ ...F.h4, color: C.text, marginBottom: 10 }}>
          Зурагнууд (5 хүртэл)
        </Text>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, marginBottom: 20 }}
        >
          {images.map((uri, i) => (
            <View key={i} style={{ position: 'relative' }}>
              <Image
                source={{ uri }}
                style={{
                  width: 100, height: 100, borderRadius: R.lg,
                  backgroundColor: C.bgSection,
                }}
              />
              <TouchableOpacity
                onPress={() => removeImage(i)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  backgroundColor: C.error, borderRadius: R.full,
                  width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={14} color={C.white} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              onPress={pickImage}
              style={{
                width: 100, height: 100, borderRadius: R.lg,
                backgroundColor: C.bgSection, borderWidth: 1.5,
                borderColor: C.border, borderStyle: 'dashed',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="camera-outline" size={28} color={C.textMuted} />
              <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>
                Зураг
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Гарчиг */}
        <Text style={{ color: C.textSub, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
          Гарчиг *
        </Text>
        <TextInput
          value={title} onChangeText={setTitle}
          placeholder="Жнь: Toyota Prius 2018 он" placeholderTextColor={C.textMuted}
          style={{
            backgroundColor: C.bgSection, borderRadius: R.lg,
            padding: 14, color: C.text, fontSize: 15,
            borderWidth: 1, borderColor: C.border, marginBottom: 16,
          }}
        />

        {/* Тайлбар */}
        <Text style={{ color: C.textSub, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
          Тайлбар
        </Text>
        <TextInput
          value={desc} onChangeText={setDesc}
          placeholder="Дэлгэрэнгүй мэдээлэл..." placeholderTextColor={C.textMuted}
          multiline numberOfLines={4} textAlignVertical="top"
          style={{
            backgroundColor: C.bgSection, borderRadius: R.lg,
            padding: 14, color: C.text, fontSize: 15,
            borderWidth: 1, borderColor: C.border, marginBottom: 16,
            minHeight: 100,
          }}
        />

        {/* Үнэ + Утас */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textSub, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
              Үнэ (₮)
            </Text>
            <TextInput
              value={price} onChangeText={setPrice}
              placeholder="0" placeholderTextColor={C.textMuted}
              keyboardType="number-pad"
              style={{
                backgroundColor: C.bgSection, borderRadius: R.lg,
                padding: 14, color: C.text, fontSize: 15,
                borderWidth: 1, borderColor: C.border,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textSub, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
              Утас
            </Text>
            <TextInput
              value={phone} onChangeText={setPhone}
              placeholder="99XXXXXX" placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
              style={{
                backgroundColor: C.bgSection, borderRadius: R.lg,
                padding: 14, color: C.text, fontSize: 15,
                borderWidth: 1, borderColor: C.border,
              }}
            />
          </View>
        </View>

        {/* Ангилал */}
        <Text style={{ ...F.h4, color: C.text, marginBottom: 10 }}>
          Ангилал *
        </Text>
        <View style={{
          flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20,
        }}>
          {FEED_CATS.map(c => {
            const active = category === c.slug
            return (
              <TouchableOpacity
                key={c.slug}
                onPress={() => setCategory(active ? '' : c.slug)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 9,
                  borderRadius: R.full,
                  backgroundColor: active ? C.primary : C.bgSection,
                  borderWidth: 1,
                  borderColor: active ? C.primary : C.border,
                }}
              >
                <Text style={{
                  color: active ? C.white : C.textSub,
                  fontSize: 13, fontWeight: active ? '700' : '500',
                }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Байршил */}
        <Text style={{ ...F.h4, color: C.text, marginBottom: 10 }}>
          Байршил
        </Text>
        <View style={{
          flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20,
        }}>
          {DISTRICTS.map(d => {
            const active = district === d
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDistrict(active ? '' : d)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 9,
                  borderRadius: R.full,
                  backgroundColor: active ? C.secondary : C.bgSection,
                  borderWidth: 1,
                  borderColor: active ? C.secondary : C.border,
                }}
              >
                <Text style={{
                  color: active ? C.white : C.textSub,
                  fontSize: 13, fontWeight: active ? '700' : '500',
                }}>
                  {d}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Онцлох сонголт */}
        <TouchableOpacity
          style={{
            backgroundColor: C.gold + '10', borderRadius: R.lg,
            padding: 16, borderWidth: 1, borderColor: C.gold + '30',
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}
        >
          <View style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: C.gold + '20',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="flash" size={20} color={C.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.gold, fontWeight: '700', fontSize: 14 }}>
              Зараа онцлох
            </Text>
            <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
              Нүүр хуудсанд гарч илүү олон хүнд хүрнэ
            </Text>
          </View>
          <Text style={{ color: C.gold, fontWeight: '800', fontSize: 14 }}>
            2,900₮
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}
