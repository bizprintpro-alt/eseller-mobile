import React, {
  useState, useRef,
} from 'react'
import {
  View, Text, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native'
import { C, R } from '../design'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    icon:  '🛍',
    title: 'Монголын бараа бүтээгдэхүүн',
    desc:  '10,000+ бараа, 500+ дэлгүүр нэг дороос',
    color: '#E8242C',
  },
  {
    icon:  '💰',
    title: 'Борлуулагч болж орлого ол',
    desc:  'Share хийж commission авах — хамгийн хялбар арга',
    color: '#2563EB',
  },
  {
    icon:  '🔒',
    title: 'Аюулгүй төлбөр',
    desc:  'Escrow систем — бараа авмагц л мөнгө шилжинэ',
    color: '#16A34A',
  },
  {
    icon:  '🚗',
    title: '2-4 цагт хүргэлт',
    desc:  'Өөрийн жолоочийн систем — хурдан найдвартай',
    color: '#7C3AED',
  },
]

export default function OnboardingScreen({
  onDone
}: {
  onDone: () => void
}) {
  const [idx, setIdx] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  const next = () => {
    if (idx < SLIDES.length - 1) {
      const nextIdx = idx + 1
      scrollRef.current?.scrollTo({
        x:        nextIdx * width,
        animated: true,
      })
      setIdx(nextIdx)
    } else {
      onDone()
    }
  }

  const skip = () => onDone()

  const s = SLIDES[idx]

  return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
    }}>

      <TouchableOpacity
        onPress={skip}
        style={{
          position: 'absolute',
          top:      52,
          right:    20,
          zIndex:   10,
          padding:  8,
        }}
      >
        <Text style={{
          color:    C.textMuted,
          fontSize: 14,
        }}>
          Алгасах
        </Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={{
            width,
            flex:           1,
            alignItems:     'center',
            justifyContent: 'center',
            padding:        40,
          }}>
            <View style={{
              width:           140,
              height:          140,
              borderRadius:    70,
              backgroundColor: slide.color + '18',
              alignItems:      'center',
              justifyContent:  'center',
              marginBottom:    40,
              borderWidth:     2,
              borderColor:     slide.color + '30',
            }}>
              <Text style={{ fontSize: 60 }}>
                {slide.icon}
              </Text>
            </View>

            <Text style={{
              color:        C.text,
              fontSize:     26,
              fontWeight:   '800',
              textAlign:    'center',
              marginBottom: 16,
              lineHeight:   34,
            }}>
              {slide.title}
            </Text>
            <Text style={{
              color:      C.textSub,
              fontSize:   16,
              textAlign:  'center',
              lineHeight: 24,
            }}>
              {slide.desc}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{
        paddingHorizontal: 24,
        paddingBottom:     52,
      }}>
        <View style={{
          flexDirection:  'row',
          justifyContent: 'center',
          gap:            8,
          marginBottom:   28,
        }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{
              width:           i === idx ? 24 : 8,
              height:          8,
              borderRadius:    4,
              backgroundColor: i === idx
                ? s.color
                : C.border,
            }} />
          ))}
        </View>

        <TouchableOpacity
          onPress={next}
          style={{
            backgroundColor: s.color,
            borderRadius:    R.xl,
            padding:         18,
            alignItems:      'center',
          }}
        >
          <Text style={{
            color:      C.white,
            fontWeight: '800',
            fontSize:   16,
          }}>
            {idx === SLIDES.length - 1
              ? 'Эхлэх'
              : 'Үргэлжлүүлэх'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
