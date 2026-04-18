import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { C, R } from '../../src/shared/design';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const runtimeRaw = Constants.expoConfig?.runtimeVersion;
  const runtime =
    typeof runtimeRaw === 'string' ? runtimeRaw : (runtimeRaw as any)?.policy ?? '1.0.0';

  function openLink(url: string) {
    Linking.openURL(url).catch(() => {});
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: 40, paddingBottom: 60, alignItems: 'center' }}
    >
      {/* Logo */}
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 22,
          backgroundColor: C.brand,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 42 }}>🛍️</Text>
      </View>

      <Text style={{ fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5 }}>
        eseller<Text style={{ color: C.brand }}>.mn</Text>
      </Text>
      <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
        Монголын нэгдсэн цахим зах
      </Text>

      {/* Description */}
      <View
        style={{
          marginTop: 28,
          backgroundColor: C.bgCard,
          borderRadius: R.lg,
          padding: 18,
          borderWidth: 0.5,
          borderColor: C.border,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 13, color: C.textSub, lineHeight: 20 }}>
          eSeller.mn бол Монголын анхны super-app e-commerce платформ.
          Авагч, дэлгүүрийн эзэн, борлуулагч, жолооч — бүгдийг нэг апп-д нэгтгэсэн.
        </Text>
        <Text style={{ fontSize: 13, color: C.textSub, lineHeight: 20 }}>
          Бид escrow (3 хоногийн баталгаа), QPay/SocialPay төлбөр, live commerce,
          loyalty оноо, BNPL зэрэг орчин үеийн тоглолтуудыг Монголын зах зээлд нэвтрүүлж байна.
        </Text>
        <Text style={{ fontSize: 13, color: C.textSub, lineHeight: 20 }}>
          Манай зорилго — Монголын жижиг, дунд бизнесийг цахим шилжилтэнд туслах,
          хэрэглэгчдэд цаг хугацаа хэмнэсэн, найдвартай худалдан авалтын туршлагыг олгох.
        </Text>
      </View>

      {/* Meta */}
      <View
        style={{
          marginTop: 20,
          alignSelf: 'stretch',
          backgroundColor: C.bgCard,
          borderRadius: R.lg,
          padding: 14,
          borderWidth: 0.5,
          borderColor: C.border,
          gap: 8,
        }}
      >
        <MetaRow label="Байгуулагдсан" value="2024" />
        <MetaRow label="Хувилбар" value={`v${version}`} />
        <MetaRow label="Runtime" value={runtime} />
        <MetaRow label="Платформ" value="iOS · Android" />
      </View>

      {/* Links */}
      <View style={{ marginTop: 24, flexDirection: 'row', gap: 12 }}>
        <SocialBtn icon="globe-outline" label="Вэб" onPress={() => openLink('https://eseller.mn')} />
        <SocialBtn icon="logo-facebook" label="Facebook" onPress={() => openLink('https://facebook.com/eseller.mn')} />
        <SocialBtn icon="logo-instagram" label="Instagram" onPress={() => openLink('https://instagram.com/eseller.mn')} />
      </View>

      <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 30 }}>
        © 2024–2026 eSeller LLC · Бүх эрх хуулиар хамгаалагдсан
      </Text>
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: C.textSub, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: C.text, fontSize: 12, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

function SocialBtn({
  icon, label, onPress,
}: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: C.bgCard,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 4,
        borderWidth: 0.5,
        borderColor: C.border,
        minWidth: 80,
      }}
    >
      <Ionicons name={icon} size={20} color={C.brand} />
      <Text style={{ fontSize: 11, color: C.text, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}
