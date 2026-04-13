import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { post } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK = ['Захиалга хаана байна?', 'Буцаалт хэрхэн хийх вэ?', 'Оноо хэрхэн ашиглах вэ?', 'Хүргэлтийн хугацаа?'];

export default function AISupportScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Сайн байна уу! 👋 Би eSeller.mn-ийн AI туслах. Захиалга, хүргэлт, буцаалт, хэтэвч, оноо системийн талаар тусална. Юу асуух вэ?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res: any = await post('/chat/ai', { message: text.trim(), history });
      const reply = res?.reply || res?.message || res?.content || 'Уучлаарай, хариулж чадсангүй.';
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Холболтын алдаа. Дахин оролдоно уу.' }]);
    }
    setLoading(false);
    setTimeout(() => flatRef.current?.scrollToEnd(), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: R.lg, paddingBottom: 10 }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: R.sm, marginBottom: R.lg }}>
            {QUICK.map(q => (
              <TouchableOpacity key={q} onPress={() => send(q)} style={st.quickChip}>
                <Text style={{ ...F.tiny, color: C.primary }}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <View style={[st.bubble, item.role === 'user' ? st.userBubble : st.aiBubble]}>
            {item.role === 'assistant' && <Ionicons name="sparkles" size={16} color={C.primary} style={{ marginRight: 6, marginTop: 2 }} />}
            <Text style={{ ...F.body, color: C.text, flex: 1 }}>{item.content}</Text>
          </View>
        )}
      />

      {loading && <ActivityIndicator color={C.primary} style={{ marginBottom: R.sm }} />}

      <View style={st.inputRow}>
        <TextInput style={st.input} placeholder="Асуултаа бичнэ үү..." placeholderTextColor={C.textMuted}
          value={input} onChangeText={setInput} onSubmitEditing={() => send(input)} returnKeyType="send" />
        <TouchableOpacity style={[st.sendBtn, !input.trim() && { opacity: 0.4 }]} onPress={() => send(input)} disabled={!input.trim() || loading}>
          <Ionicons name="send" size={20} color={C.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  quickChip: { backgroundColor: C.primaryDim, borderRadius: R.full, paddingHorizontal: R.md, paddingVertical: 6, borderWidth: 0.5, borderColor: C.primary + '33' },
  bubble: { flexDirection: 'row', maxWidth: '85%', borderRadius: 14, padding: R.md, marginBottom: R.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: C.brand, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: C.bgCard, borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: C.border },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: R.sm, padding: R.md, paddingBottom: Platform.OS === 'ios' ? 30 : R.md, borderTopWidth: 0.5, borderTopColor: C.border, backgroundColor: C.bgCard },
  input: { flex: 1, backgroundColor: C.bgInput, borderRadius: R.full, paddingHorizontal: R.lg, paddingVertical: 10, color: C.white, fontSize: 14 },
  sendBtn: { backgroundColor: C.primary, borderRadius: R.full, padding: 10 },
});
