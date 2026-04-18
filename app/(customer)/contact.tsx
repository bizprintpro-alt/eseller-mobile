import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Linking, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { C, R } from '../../src/shared/design';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Анхаар', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    setSending(true);
    try {
      // Backend /api/contact route байхгүй — зөвхөн email-ээр илгээх
      const body = encodeURIComponent(
        `Нэр: ${name}\nУтас: ${phone}\n\n${message}`,
      );
      await Linking.openURL(
        `mailto:info@eseller.mn?subject=eSeller%20app%20санал&body=${body}`,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Мэйл', 'Таны мэйл клиент нээгдэнэ');
      setName('');
      setPhone('');
      setMessage('');
    } catch (e: any) {
      Alert.alert('Алдаа', e?.message || 'Илгээх боломжгүй');
    } finally {
      setSending(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 60 }}
    >
      <Text style={{ fontSize: 22, fontWeight: '900', color: C.text }}>Холбоо барих</Text>
      <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4, marginBottom: 20 }}>
        Санал, асуултаа бидэнтэй хуваалцаарай
      </Text>

      {/* Quick contact cards */}
      <View style={{ gap: 10, marginBottom: 20 }}>
        <ContactCard
          icon="call-outline"
          label="Утас"
          value="+976 7700-0000"
          onPress={() => Linking.openURL('tel:+97677000000')}
        />
        <ContactCard
          icon="mail-outline"
          label="Имэйл"
          value="info@eseller.mn"
          onPress={() => Linking.openURL('mailto:info@eseller.mn')}
        />
        <ContactCard
          icon="location-outline"
          label="Хаяг"
          value="Улаанбаатар хот, Монгол улс"
        />
        <ContactCard
          icon="time-outline"
          label="Ажлын цаг"
          value="Даваа–Баасан 9:00 – 18:00"
        />
        <ContactCard
          icon="logo-facebook"
          label="Facebook Messenger"
          value="m.me/eseller.mn"
          onPress={() => Linking.openURL('https://m.me/eseller.mn')}
        />
      </View>

      {/* Feedback form */}
      <Text style={{ fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 10 }}>
        Санал хүсэлт илгээх
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Нэр"
        placeholderTextColor={C.textMuted}
        style={inputStyle}
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Утасны дугаар"
        placeholderTextColor={C.textMuted}
        keyboardType="phone-pad"
        style={inputStyle}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Таны санал..."
        placeholderTextColor={C.textMuted}
        multiline
        numberOfLines={5}
        style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={sending}
        style={{
          backgroundColor: sending ? C.textMuted : C.brand,
          borderRadius: R.lg,
          padding: 16,
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Илгээх</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: C.bgCard,
  borderRadius: R.lg,
  padding: 14,
  color: C.text,
  fontSize: 14,
  borderWidth: 0.5,
  borderColor: C.border,
  marginBottom: 10,
};

function ContactCard({
  icon, label, value, onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const Wrap: any = onPress ? TouchableOpacity : View;
  return (
    <Wrap
      onPress={onPress}
      style={{
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 0.5,
        borderColor: C.border,
      }}
    >
      <View
        style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: C.brand + '22',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={20} color={C.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: C.textMuted }}>{label}</Text>
        <Text style={{ fontSize: 13, color: C.text, fontWeight: '600', marginTop: 1 }}>
          {value}
        </Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={C.textMuted} />}
    </Wrap>
  );
}
