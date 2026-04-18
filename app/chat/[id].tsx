import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get, post } from '../../src/services/api'
import { useAuth } from '../../src/store/auth'
import { C, R } from '../../src/shared/design'

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()
  const listRef = useRef<FlatList>(null)
  const [msg, setMsg] = useState('')
  const [isFocused, setIsFocused] = useState(true)

  // Chat polling 3с тутамд гүйдэг — blur үед зогсоох нь battery/data хэмнэнэ
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true)
      return () => setIsFocused(false)
    }, []),
  )

  const { data, isLoading } = useQuery({
    queryKey: ['chat', id],
    queryFn: () => get(`/chat/conversations/${id}/messages`),
    refetchInterval: isFocused ? 3000 : false,
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) => post(`/chat/conversations/${id}/messages`, { content }),
    onSuccess: () => {
      setMsg('')
      qc.invalidateQueries({ queryKey: ['chat', id] })
    },
  })

  const messages = (data as any)?.messages || (Array.isArray(data) ? data : [])

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages.length])

  const send = () => {
    if (!msg.trim()) return
    sendMutation.mutate(msg.trim())
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '700' }}>Чат</Text>
      </View>

      {/* Messages */}
      {isLoading ? (
        <ActivityIndicator color={C.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id || m._id}
          contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
          renderItem={({ item: m }) => {
            const mine = m.senderId === (user?.id || user?._id)
            return (
              <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <View style={{
                  backgroundColor: mine ? C.brand : C.bgCard,
                  borderRadius: R.lg,
                  borderBottomRightRadius: mine ? 4 : R.lg,
                  borderBottomLeftRadius: mine ? R.lg : 4,
                  padding: 12, maxWidth: '75%',
                  borderWidth: mine ? 0 : 1, borderColor: C.border,
                }}>
                  <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20 }}>{m.content}</Text>
                </View>
                <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 3 }}>
                  {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
            )
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48 }}>💬</Text>
              <Text style={{ color: C.textSub, marginTop: 12 }}>Мессеж байхгүй байна</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={{ flexDirection: 'row', padding: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgCard, gap: 10, alignItems: 'flex-end' }}>
        <TextInput placeholder="Мессеж бичих..." placeholderTextColor={C.textMuted} value={msg} onChangeText={setMsg}
          multiline style={{ flex: 1, backgroundColor: C.bgSection, borderRadius: R.xl, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 15, maxHeight: 120 }} />
        <TouchableOpacity onPress={send} disabled={!msg.trim() || sendMutation.isPending}
          style={{ backgroundColor: msg.trim() ? C.brand : C.bgSection, borderRadius: R.full, padding: 10 }}>
          <Ionicons name="send" size={18} color={msg.trim() ? '#fff' : C.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
