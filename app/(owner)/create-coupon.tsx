import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function CreateCouponScreen() {
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [minOrder, setMinOrder] = useState('')
  const [expiry, setExpiry] = useState('')

  const handleCreate = () => {
    if (!code || !discount) return Alert.alert('Анхаар', 'Код болон хямдрал оруулна уу')
    Alert.alert('Амжилт', `"${code}" купон үүслээ!`, [{ text: 'За', onPress: () => router.back() }])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Купон үүсгэх</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Купоны код</Text>
        <TextInput style={styles.input} placeholder="SUMMER2025" value={code} onChangeText={t => setCode(t.toUpperCase())} autoCapitalize="characters" />

        <Text style={styles.label}>Хямдралын төрөл</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity style={[styles.typeBtn, type === 'percent' && styles.typeBtnActive]} onPress={() => setType('percent')}>
            <Text style={[styles.typeBtnText, type === 'percent' && styles.typeBtnTextActive]}>% Хувиар</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type === 'fixed' && styles.typeBtnActive]} onPress={() => setType('fixed')}>
            <Text style={[styles.typeBtnText, type === 'fixed' && styles.typeBtnTextActive]}>₮ Төгрөгөөр</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Хямдралын хэмжээ {type === 'percent' ? '(%)' : '(₮)'}</Text>
        <TextInput style={styles.input} placeholder={type === 'percent' ? '10' : '5000'} value={discount} onChangeText={setDiscount} keyboardType="numeric" />

        <Text style={styles.label}>Хамгийн бага захиалгын дүн (₮)</Text>
        <TextInput style={styles.input} placeholder="20000" value={minOrder} onChangeText={setMinOrder} keyboardType="numeric" />

        <Text style={styles.label}>Дуусах огноо</Text>
        <TextInput style={styles.input} placeholder="2025-12-31" value={expiry} onChangeText={setExpiry} />

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Купон үүсгэх</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '700' },
  form: { padding: 16, gap: 4 },
  label: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center' },
  typeBtnActive: { borderColor: '#e74c3c', backgroundColor: '#ffeaea' },
  typeBtnText: { fontWeight: '600', color: '#666' },
  typeBtnTextActive: { color: '#e74c3c' },
  createBtn: { backgroundColor: '#e74c3c', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  createBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
})
