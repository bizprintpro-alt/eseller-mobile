import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function DeliveryDetailScreen() {
  const { id, from, to, customerName, customerPhone, items, fee } = useLocalSearchParams()

  const callCustomer = () => {
    if (customerPhone) Linking.openURL(`tel:${customerPhone}`)
  }

  const openMap = () => {
    const addr = encodeURIComponent(to as string)
    Linking.openURL(`https://maps.google.com/?q=${addr}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Хүргэлтийн дэлгэрэнгүй</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📦 Авах хаяг</Text>
        <Text style={styles.value}>{from}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🏠 Хүргэх хаяг</Text>
        <Text style={styles.value}>{to}</Text>
        <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
          <Ionicons name="map-outline" size={16} color="#fff" />
          <Text style={styles.mapBtnText}>Газрын зураг нээх</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>👤 Хэрэглэгч</Text>
        <Text style={styles.value}>{customerName}</Text>
        <TouchableOpacity style={styles.callBtn} onPress={callCustomer}>
          <Ionicons name="call-outline" size={16} color="#fff" />
          <Text style={styles.callBtnText}>Залгах</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>💰 Хүргэлтийн төлбөр</Text>
        <Text style={styles.feeText}>₮{Number(fee || 0).toLocaleString()}</Text>
      </View>

      <View style={styles.statusRow}>
        <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#f39c12' }]}>
          <Text style={styles.statusBtnText}>Авлаа</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#3498db' }]}>
          <Text style={styles.statusBtnText}>Замдаа</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#2ecc71' }]}>
          <Text style={styles.statusBtnText}>Хүргэлээ ✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '700', color: '#333' },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  label: { fontSize: 13, color: '#888', marginBottom: 4 },
  value: { fontSize: 15, color: '#333', fontWeight: '600' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3498db', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
  mapBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2ecc71', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
  callBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  feeText: { fontSize: 22, fontWeight: '800', color: '#e74c3c', marginTop: 4 },
  statusRow: { flexDirection: 'row', gap: 8, padding: 16, marginTop: 8 },
  statusBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  statusBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
})
