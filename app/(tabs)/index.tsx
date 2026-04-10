import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, R } from '../../src/shared/design';
import { useAuth } from '../../src/store/auth';

const CATEGORIES = [
  { icon: 'storefront', label: 'Дэлгүүр',   color: C.store },
  { icon: 'home',       label: 'Үл хөдлөх', color: C.buyer },
  { icon: 'car',        label: 'Авто',       color: C.driver },
  { icon: 'construct',  label: 'Үйлчилгээ', color: C.seller },
  { icon: 'hammer',     label: 'Барилга',    color: C.warning },
  { icon: 'bag',        label: 'Pre-order',  color: C.brand },
];

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', padding: 20,
        }}>
          <View>
            <Text style={{ color: C.textSub, fontSize: 13 }}>
              Сайн байна уу{user ? `, ${user.name}` : ''} 👋
            </Text>
            <Text style={{ color: C.text, fontSize: 24, fontWeight: '800', marginTop: 4 }}>
              eseller.mn
            </Text>
          </View>
          <TouchableOpacity style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: C.border,
          }}>
            <Ionicons name="notifications-outline" size={20} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: C.bgCard, marginHorizontal: 20, borderRadius: R.lg,
          padding: 14, gap: 10, borderWidth: 1, borderColor: C.border,
        }}>
          <Ionicons name="search" size={18} color={C.textMuted} />
          <Text style={{ color: C.textMuted, fontSize: 14 }}>
            Бараа хайх...
          </Text>
        </TouchableOpacity>

        {/* Banner */}
        <View style={{
          margin: 20, borderRadius: R.xl, overflow: 'hidden',
          backgroundColor: C.brand, padding: 24,
        }}>
          <Text style={{ color: C.white, fontSize: 20, fontWeight: '800' }}>
            Шинэ бараанууд
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 6 }}>
            Өдөр бүр шинэ бараа нэмэгдэж байна
          </Text>
        </View>

        {/* Categories */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 14 }}>
            Ангилал
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity key={i} style={{
                width: '30%', backgroundColor: C.bgCard,
                borderRadius: R.lg, padding: 14, alignItems: 'center', gap: 8,
                borderWidth: 1, borderColor: C.border,
              }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: cat.color + '20',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={{ color: C.text, fontSize: 11, fontWeight: '600' }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
