import { useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { R } from '../src/shared/design'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    icon: 'storefront' as const,
    color: '#E8242C',
    title: 'Монголын хамгийн том зах зээл',
    desc: '10,000+ бараа, 500+ дэлгүүр нэг дор. Хурдан хайж, аюулгүй худалдаа хий.',
    bg: '#1a0505',
  },
  {
    icon: 'people' as const,
    color: '#1A73E8',
    title: '4 дүрийн систем',
    desc: 'Худалдан авагч, дэлгүүрийн эзэн, борлуулагч, жолооч — нэг аппаас бүгдийг удирд.',
    bg: '#05101a',
  },
  {
    icon: 'shield-checkmark' as const,
    color: '#34A853',
    title: 'Аюулгүй Escrow төлбөр',
    desc: '3 өдрийн дундын данс хамгаалалт. Бараа хүргэгдсэний дараа л мөнгө шилждэг.',
    bg: '#05150a',
  },
  {
    icon: 'car' as const,
    color: '#7C3AED',
    title: '2-4 цагт хүргэлт',
    desc: 'Өөрийн жолооч систем. 50,000₮-с дээш захиалгад үнэгүй хүргэлт.',
    bg: '#0d0520',
  },
]

export default function Onboarding() {
  const scrollRef = useRef<ScrollView>(null)
  const [idx, setIdx] = useState(0)

  const next = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (idx < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (idx + 1) * width, animated: true })
      setIdx(idx + 1)
    } else {
      await AsyncStorage.setItem('onboarded', 'true')
      router.replace('/(auth)/login')
    }
  }

  const skip = async () => {
    await AsyncStorage.setItem('onboarded', 'true')
    router.replace('/(auth)/login')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEnabled={false}>
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width, flex: 1, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <View
              style={{
                width: 120, height: 120, borderRadius: 60,
                backgroundColor: s.color + '20', alignItems: 'center', justifyContent: 'center',
                marginBottom: 32, borderWidth: 2, borderColor: s.color + '40',
              }}
            >
              <Ionicons name={s.icon} size={52} color={s.color} />
            </View>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 16, lineHeight: 34 }}>{s.title}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, textAlign: 'center', lineHeight: 26 }}>{s.desc}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              height: 6, borderRadius: 3,
              backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.3)',
              width: i === idx ? 24 : 8,
            }}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 48 : 32, gap: 12 }}>
        <TouchableOpacity onPress={next} style={{ backgroundColor: SLIDES[idx].color, borderRadius: R.lg, padding: 18, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17 }}>
            {idx === SLIDES.length - 1 ? 'Эхлэх →' : 'Үргэлжлүүлэх →'}
          </Text>
        </TouchableOpacity>
        {idx < SLIDES.length - 1 && (
          <TouchableOpacity onPress={skip} style={{ alignItems: 'center', padding: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Алгасах</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
