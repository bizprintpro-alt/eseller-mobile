import React from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery }   from '@tanstack/react-query'
import { Ionicons }   from '@expo/vector-icons'
import { get }        from '../../src/services/api'
import { C, R, F }    from '../../src/shared/design'

const STEPS = [
  { key:'PENDING',    label:'Захиалга хүлээгдэж байна',
    icon:'time-outline' },
  { key:'CONFIRMED',  label:'Захиалга баталгаажсан',
    icon:'checkmark-circle-outline' },
  { key:'PREPARING',  label:'Бараа бэлдэж байна',
    icon:'cube-outline' },
  { key:'DELIVERING', label:'Хүргэлтэнд гарсан',
    icon:'car-outline' },
  { key:'DELIVERED',  label:'Хүргэгдсэн',
    icon:'checkmark-done-outline' },
]

export default function TrackScreen() {
  const { code } = useLocalSearchParams()

  const { data } = useQuery({
    queryKey: ['track', code],
    queryFn:  () => get(`/tracking/${code}`),
    refetchInterval: 30000,
  })

  const order       = data as any
  const currentStep = STEPS.findIndex(
    s => s.key === order?.status
  )

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 52, paddingHorizontal: 16,
        paddingBottom: 16, borderBottomWidth: 1,
        borderBottomColor: C.border, gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={{ ...F.h3, color: C.text }}>
          Захиалга #{code}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Status card */}
        <View style={{
          backgroundColor: C.bgCard, borderRadius: R.xl,
          padding: 20, marginBottom: 24,
          borderWidth: 1, borderColor: C.border, alignItems: 'center',
        }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: C.secondary + '15',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Ionicons
              name={(STEPS[currentStep]?.icon || 'cube-outline') as any}
              size={32} color={C.secondary}
            />
          </View>
          <Text style={{ ...F.h3, color: C.text, textAlign: 'center' }}>
            {STEPS[currentStep]?.label || 'Хүлээгдэж байна'}
          </Text>
          {order?.estimatedDelivery && (
            <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>
              Тооцоолсон цаг:{' '}
              {new Date(order.estimatedDelivery).toLocaleTimeString('mn-MN', {
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          )}
        </View>

        {/* Timeline */}
        <View style={{
          backgroundColor: C.bgCard, borderRadius: R.xl,
          padding: 20, borderWidth: 1, borderColor: C.border,
        }}>
          <Text style={{ ...F.h4, color: C.text, marginBottom: 20 }}>
            Хүргэлтийн явц
          </Text>

          {STEPS.map((step, i) => {
            const done    = i <= currentStep
            const current = i === currentStep
            return (
              <View key={step.key} style={{ flexDirection: 'row' }}>
                <View style={{
                  alignItems: 'center', marginRight: 16, width: 24,
                }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: done ? C.secondary : C.bgSection,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: done ? 0 : 1, borderColor: C.border, zIndex: 1,
                  }}>
                    {done && (
                      <Ionicons name="checkmark" size={14} color={C.white} />
                    )}
                  </View>
                  {i < STEPS.length - 1 && (
                    <View style={{
                      width: 2, flex: 1, minHeight: 32,
                      backgroundColor: i < currentStep ? C.secondary : C.border,
                      marginVertical: 4,
                    }} />
                  )}
                </View>
                <View style={{
                  flex: 1, paddingBottom: i < STEPS.length - 1 ? 24 : 0,
                }}>
                  <Text style={{
                    color: done ? C.text : C.textMuted,
                    fontWeight: current ? '700' : '400', fontSize: 14,
                  }}>
                    {step.label}
                  </Text>
                  {current && (
                    <Text style={{ color: C.secondary, fontSize: 12, marginTop: 2 }}>
                      Одоогийн төлөв
                    </Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>

        {/* Driver info */}
        {order?.driver && (
          <View style={{
            backgroundColor: C.bgCard, borderRadius: R.xl,
            padding: 16, marginTop: 16,
            borderWidth: 1, borderColor: C.border,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: C.driver + '20',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="person" size={24} color={C.driver} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '700' }}>
                {order.driver.name}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 13 }}>
                Жолооч
              </Text>
            </View>
            <TouchableOpacity style={{
              backgroundColor: C.secondary + '15', borderRadius: R.full,
              padding: 10, borderWidth: 1, borderColor: C.secondary + '30',
            }}>
              <Ionicons name="call" size={20} color={C.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
