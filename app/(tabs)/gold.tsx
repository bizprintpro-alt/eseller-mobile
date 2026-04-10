import React from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity,
} from 'react-native'
import { router }         from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons }       from '@expo/vector-icons'
import { C, R, F }        from '../../src/shared/design'

const BENEFITS = [
  { icon:'car',      label:'Үнэгүй хүргэлт',
    desc:'Дурын захиалгад' },
  { icon:'pricetag', label:'5% нэмэлт хямдрал',
    desc:'Бүх бараанд' },
  { icon:'star',     label:'2x оноо',
    desc:'Худалдан авалт бүрт' },
  { icon:'flash',    label:'Эрт хандах',
    desc:'Flash sale-д' },
  { icon:'headset',  label:'VIP дэмжлэг',
    desc:'24/7 тусгай суваг' },
  { icon:'gift',     label:'Сарын бэлэг',
    desc:'Гишүүд бүрт' },
]

export default function GoldScreen() {
  return (
    <ScrollView style={{
      flex:            1,
      backgroundColor: C.bg,
    }}>

      {/* Hero */}
      <LinearGradient
        colors={['#1A1100', '#2D1F00', '#1A1100']}
        style={{
          paddingTop:     80,
          paddingBottom:  40,
          alignItems:     'center',
          paddingHorizontal: 24,
        }}
      >
        <View style={{
          width:           110,
          height:          110,
          borderRadius:    55,
          backgroundColor: 'rgba(249,168,37,0.15)',
          alignItems:      'center',
          justifyContent:  'center',
          borderWidth:     2,
          borderColor:     'rgba(249,168,37,0.3)',
          marginBottom:    20,
        }}>
          <Ionicons name="star" size={52} color={C.gold} />
        </View>

        <Text style={{
          color:         C.gold,
          fontSize:      36,
          fontWeight:    '900',
          letterSpacing: 4,
          marginBottom:  6,
        }}>
          GOLD
        </Text>
        <Text style={{
          color:     'rgba(249,168,37,0.6)',
          fontSize:  14,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          Онцгой эрх эдлэгчийн клуб
        </Text>

        <View style={{
          backgroundColor: 'rgba(249,168,37,0.1)',
          borderRadius:    R.xl,
          paddingHorizontal: 24,
          paddingVertical:   14,
          borderWidth:     1,
          borderColor:     'rgba(249,168,37,0.2)',
        }}>
          <Text style={{
            color:      C.gold,
            fontSize:   32,
            fontWeight: '900',
            textAlign:  'center',
          }}>
            19,900₮
            <Text style={{ fontSize: 16, fontWeight: '400' }}>
              /сар
            </Text>
          </Text>
        </View>
      </LinearGradient>

      {/* Benefits */}
      <View style={{ padding: 16 }}>
        <Text style={{
          ...F.h3,
          color:        C.text,
          marginBottom: 14,
        }}>
          Gold давуу талууд
        </Text>

        <View style={{
          flexDirection: 'row',
          flexWrap:      'wrap',
          gap:           10,
        }}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={{
              width:           '47%' as any,
              backgroundColor: 'rgba(249,168,37,0.06)',
              borderRadius:    R.lg,
              padding:         14,
              borderWidth:     1,
              borderColor:     'rgba(249,168,37,0.15)',
            }}>
              <View style={{
                width:           36,
                height:          36,
                borderRadius:    18,
                backgroundColor: 'rgba(249,168,37,0.15)',
                alignItems:      'center',
                justifyContent:  'center',
                marginBottom:    8,
              }}>
                <Ionicons
                  name={b.icon as any}
                  size={18}
                  color={C.gold}
                />
              </View>
              <Text style={{
                color:      C.text,
                fontWeight: '700',
                fontSize:   13,
                marginBottom: 2,
              }}>
                {b.label}
              </Text>
              <Text style={{
                color:    C.textMuted,
                fontSize: 11,
              }}>
                {b.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() =>
            router.push('/checkout?type=gold' as any)
          }
          style={{
            backgroundColor: C.gold,
            borderRadius:    R.xl,
            padding:         18,
            alignItems:      'center',
            marginTop:       24,
            flexDirection:   'row',
            justifyContent:  'center',
            gap:             8,
          }}
        >
          <Ionicons name="star" size={18} color={C.black} />
          <Text style={{
            color:      C.black,
            fontWeight: '800',
            fontSize:   16,
          }}>
            Gold гишүүн болох
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            padding:    16,
            marginTop:  8,
          }}
        >
          <Text style={{
            color:    C.textMuted,
            fontSize: 14,
          }}>
            Дараа шийдэх
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  )
}
