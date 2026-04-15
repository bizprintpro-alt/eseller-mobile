import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardTypeOptions,
} from 'react-native';
import { Stack } from 'expo-router';
import { post } from '../../src/services/api';

export default function CorporateOrder() {
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!company || !contact || !phone || !details) {
      Alert.alert('Анхаарна уу', 'Бүх талбарыг бөглөнө үү.');
      return;
    }
    setLoading(true);
    try {
      await post('/corporate-order', {
        company,
        contact,
        phone,
        email,
        details,
        quantity: Number(qty) || undefined,
      });
      Alert.alert(
        'Амжилттай',
        'Таны корпорат захиалгыг хүлээн авлаа.\nАжлын 1 хоногт холбогдоно.',
        [{ text: 'За' }],
      );
    } catch {
      Alert.alert('Алдаа', 'Илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  }

  const INPUT = {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#fff',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,.08)',
  } as const;

  const FIELDS: {
    label: string;
    value: string;
    setter: (v: string) => void;
    placeholder: string;
    keyboard?: KeyboardTypeOptions;
  }[] = [
    { label: 'Байгууллагын нэр *', value: company, setter: setCompany, placeholder: 'ХК, ХХК, NGO...' },
    { label: 'Холбоо барих хүн *', value: contact, setter: setContact, placeholder: 'Таны нэр' },
    { label: 'Утасны дугаар *', value: phone, setter: setPhone, placeholder: '99112233', keyboard: 'phone-pad' },
    { label: 'Имэйл', value: email, setter: setEmail, placeholder: 'company@mail.mn', keyboard: 'email-address' },
    { label: 'Тоо хэмжээ (ойролцоо)', value: qty, setter: setQty, placeholder: '100+', keyboard: 'number-pad' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Корпорат захиалга', headerBackTitle: '' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#121212' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: '#1B1B3A',
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            borderWidth: 0.5,
            borderColor: '#3730A3',
          }}
        >
          <Text style={{ fontSize: 13, color: '#A5B4FC', lineHeight: 21 }}>
            💼 Байгууллагын хэмжээний захиалга — хямдрал, BNPL, тусгай нөхцөлтэйгөөр бэлтгэнэ.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {FIELDS.map((f) => (
            <View key={f.label}>
              <Text
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,.45)',
                  fontWeight: '600',
                  marginBottom: 5,
                }}
              >
                {f.label}
              </Text>
              <TextInput
                value={f.value}
                onChangeText={f.setter}
                placeholder={f.placeholder}
                placeholderTextColor="rgba(255,255,255,.2)"
                keyboardType={f.keyboard ?? 'default'}
                style={INPUT}
              />
            </View>
          ))}

          <View>
            <Text
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,.45)',
                fontWeight: '600',
                marginBottom: 5,
              }}
            >
              Захиалгын дэлгэрэнгүй *
            </Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Ямар бараа, хэдэн ширхэг, хэзээ хэрэгтэй..."
              placeholderTextColor="rgba(255,255,255,.2)"
              multiline
              numberOfLines={4}
              style={{ ...INPUT, height: 110, textAlignVertical: 'top' }}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={submit}
          disabled={loading}
          style={{
            backgroundColor: '#4F46E5',
            borderRadius: 12,
            padding: 15,
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Илгээх</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
