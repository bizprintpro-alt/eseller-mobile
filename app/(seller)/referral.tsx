import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Share, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { C, R, F } from '../../src/shared/design'

export default function ReferralScreen() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'SELL-MUUGII-2025'
  const referralLink = `https://eseller.mn/ref/${referralCode}`

  const copyLink = async () => {
    await Clipboard.setStringAsync(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  // Hidden behind the (seller) tabs href:null; only reachable via push from
  // SellerProfile. Static placeholder data here is unchanged in this PR —
  // hooking it to /api/seller/referral-summary is deferred (no API/business
  // logic changes in the shell-UI normalization).

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
        <Text style={styles.heroTitle}>Миний урилгын код</Text>
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
  container: { flex: 1, backgroundColor: C.bg },
  hero: { backgroundColor: C.brand, padding: R.xxxl, alignItems: 'center', gap: R.sm },
  heroTitle: { ...F.h2, color: C.white },
  heroSub: { ...F.small, color: 'rgba(255,255,255,0.8)' },
  card: {
    backgroundColor: C.bgCard,
    margin: R.lg,
    padding: R.xl,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  label: { ...F.small, color: C.textMuted, marginBottom: R.sm },
  code: { fontSize: 28, fontWeight: '900', color: C.brand, letterSpacing: 2 },
  linkText: { ...F.tiny, color: C.textSub, marginTop: R.xs, marginBottom: R.lg },
  btnRow: { flexDirection: 'row', gap: R.sm },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: R.xs,
    backgroundColor: C.brand,
    padding: R.md,
    borderRadius: R.md,
  },
  btnSuccess: { backgroundColor: C.success },
  btnText: { color: C.white, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: R.md, marginHorizontal: R.lg },
  statCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    padding: R.lg,
    borderRadius: R.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  statNum: { ...F.h2, color: C.text },
  statLabel: { ...F.tiny, color: C.textMuted, marginTop: R.xs },
})
