import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, F } from '../../src/shared/design';

const FAQ = [
  { q: 'Хүргэлт хэдэн хоногт ирэх вэ?', a: 'Улаанбаатар хотод 1-3 өдөр, хөдөө орон нутагт 3-7 өдрийн дотор хүргэнэ.' },
  { q: 'Буцаалт хэрхэн хийх вэ?', a: 'Бараа хүлээн авснаас 48 цагийн дотор Профайл → Буцаалт хэсгээс хүсэлт илгээнэ.' },
  { q: 'QPay төлбөр амжилтгүй болвол?', a: 'Төлбөр амжилтгүй бол 5 минутын дотор автомат цуцлагдана. Мөнгө буцаагдана.' },
  { q: 'Оноо хэрхэн ашиглах вэ?', a: 'Хэтэвч → Оноо хөрвүүлэх дарж 100 оноо = 100₮ харьцаагаар мөнгө болгоно.' },
  { q: 'Gold гишүүнчлэл гэж юу вэ?', a: 'Сарын 9,900₮-аар үнэгүй хүргэлт, Flash sale эрт нэвтрэх, 2x оноо авна.' },
];

export default function HelpScreen() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <Text style={{ ...F.h2, color: C.white, marginBottom: R.lg }}>Тусламж</Text>

      {/* FAQ */}
      {FAQ.map((item, i) => (
        <TouchableOpacity key={i} style={st.faqCard} onPress={() => setOpen(open === i ? null : i)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ ...F.body, color: C.white, fontWeight: '600', flex: 1 }}>{item.q}</Text>
            <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={18} color={C.textMuted} />
          </View>
          {open === i && <Text style={{ ...F.small, color: C.textSub, marginTop: R.sm }}>{item.a}</Text>}
        </TouchableOpacity>
      ))}

      {/* Contact */}
      <Text style={{ ...F.h3, color: C.white, marginTop: R.xxl, marginBottom: R.md }}>Холбоо барих</Text>
      <TouchableOpacity style={st.contactBtn} onPress={() => Linking.openURL('tel:70001234')}>
        <Ionicons name="call" size={20} color={C.primary} /><Text style={{ ...F.body, color: C.text }}>7000-1234</Text>
      </TouchableOpacity>
      <TouchableOpacity style={st.contactBtn} onPress={() => Linking.openURL('mailto:info@eseller.mn')}>
        <Ionicons name="mail" size={20} color={C.primary} /><Text style={{ ...F.body, color: C.text }}>info@eseller.mn</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  faqCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: R.md, backgroundColor: C.bgCard, borderRadius: R.md, padding: 14, marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border },
});
