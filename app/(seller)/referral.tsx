import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'

export default function ReferralScreen() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'SELL-MUUGII-2025'
  const referralLink = `https://eseller.mn/ref/${referralCode}`

  const copyLink = async () => {
    await Clipboard.setStringAsync(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = async () => {
    await Share.share({
      message: `Eseller.mn дээр захиалга өгч хямдрал авааарай! ${referralLink}`,
      url: referralLink,
    })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name="gift-outline" size={48} color="#fff" />
        <Text style={styles.heroTitle}>Миний Referral</Text>
        <Text style={styles.heroSub}>Найздаа хуваалц — комисс ол</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Таны код</Text>
        <Text style={styles.code}>{referralCode}</Text>
        <Text style={styles.linkText}>{referralLink}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, copied && styles.btnSuccess]} onPress={copyLink}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#fff" />
            <Text style={styles.btnText}>{copied ? 'Хуулагдлаа!' : 'Хуулах'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#3498db' }]} onPress={shareLink}>
            <Ionicons name="share-social-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Хуваалцах</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>Урьсан</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>₮0</Text>
          <Text style={styles.statLabel}>Нийт орлого</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  hero: { backgroundColor: '#e74c3c', padding: 32, alignItems: 'center', gap: 8 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  card: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  label: { fontSize: 13, color: '#888', marginBottom: 8 },
  code: { fontSize: 28, fontWeight: '900', color: '#e74c3c', letterSpacing: 2 },
  linkText: { fontSize: 12, color: '#666', marginTop: 4, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#e74c3c', padding: 12, borderRadius: 10 },
  btnSuccess: { backgroundColor: '#2ecc71' },
  btnText: { color: '#fff', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
})
