import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { get, put } from '../../src/services/api';
import { C, R, F } from '../../src/shared/design';

const TIERS = [
  { key: 'micro', label: 'Микро', range: '1K-10K', bonus: '+2%', color: '#3B82F6', min: 1000 },
  { key: 'influencer', label: 'Инфлюэнсер', range: '10K-100K', bonus: '+3%', color: '#8B5CF6', min: 10000 },
  { key: 'mega', label: 'Мега', range: '100K+', bonus: '+5%', color: '#F59E0B', min: 100000 },
];
const PLATFORMS = [
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok' },
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
];

function getTier(f: number) { if (f >= 100000) return TIERS[2]; if (f >= 10000) return TIERS[1]; if (f >= 1000) return TIERS[0]; return null; }

export default function InfluencerScreen() {
  const { data } = useQuery({ queryKey: ['seller-profile'], queryFn: () => get('/affiliate/earnings') });
  const d = data as any;
  const [followers, setFollowers] = useState('');
  const [platform, setPlatform] = useState('tiktok');

  const saveMut = useMutation({
    mutationFn: (body: any) => put('/seller/profile', body),
    onSuccess: () => Alert.alert('Амжилттай'),
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const fNum = parseInt(followers) || 0;
  const tier = getTier(fNum);
  const baseRate = d?.commissionRate || 10;
  const bonusRate = tier ? parseInt(tier.bonus) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <View style={[st.tierCard, tier && { borderColor: tier.color + '44' }]}>
        <Ionicons name="star" size={32} color={tier?.color || C.textMuted} />
        <View style={{ flex: 1 }}>
          <Text style={{ ...F.h3, color: C.white }}>{tier?.label || 'Tier байхгүй'}</Text>
          <Text style={{ ...F.tiny, color: C.textMuted }}>{tier ? `${tier.range} followers` : '1,000+ хэрэгтэй'}</Text>
        </View>
        <View style={st.rateBadge}><Text style={{ ...F.h3, color: tier?.color || C.textMuted }}>{baseRate + bonusRate}%</Text><Text style={{ ...F.tiny, color: C.textMuted }}>Комисс</Text></View>
      </View>

      <View style={st.breakCard}>
        <View style={st.breakRow}><Text style={{ ...F.small, color: C.textSub }}>Суурь</Text><Text style={{ ...F.body, color: C.text, fontWeight: '700' }}>{baseRate}%</Text></View>
        <View style={st.breakRow}><Text style={{ ...F.small, color: C.textSub }}>Бонус</Text><Text style={{ ...F.body, color: C.seller, fontWeight: '700' }}>+{bonusRate}%</Text></View>
        <View style={[st.breakRow, { borderTopWidth: 1, borderTopColor: C.border, paddingTop: R.sm }]}><Text style={{ ...F.body, color: C.white, fontWeight: '800' }}>Нийт</Text><Text style={{ ...F.h3, color: C.seller }}>{baseRate + bonusRate}%</Text></View>
      </View>

      <Text style={{ ...F.h4, color: C.white, marginTop: R.lg, marginBottom: R.md }}>Tier түвшин</Text>
      {TIERS.map(t => {
        const active = tier?.key === t.key;
        return (
          <View key={t.key} style={[st.tierItem, active && { borderColor: t.color + '66' }]}>
            <View style={[st.dot, { backgroundColor: t.color }]}>{active && <Ionicons name="checkmark" size={14} color={C.white} />}</View>
            <View style={{ flex: 1 }}><Text style={{ ...F.body, color: active ? C.white : C.textSub, fontWeight: '700' }}>{t.label}</Text><Text style={{ ...F.tiny, color: C.textMuted }}>{t.range}</Text></View>
            <Text style={{ ...F.h4, color: t.color }}>{t.bonus}</Text>
          </View>
        );
      })}

      <Text style={{ ...F.h4, color: C.white, marginTop: R.lg, marginBottom: R.sm }}>Followers тоо</Text>
      <TextInput style={st.input} placeholder="Жишээ: 15000" placeholderTextColor={C.textMuted} value={followers} onChangeText={setFollowers} keyboardType="number-pad" />

      <Text style={{ ...F.small, color: C.textSub, marginBottom: R.sm }}>Платформ</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: R.xl }}>
        {PLATFORMS.map(p => (
          <TouchableOpacity key={p.key} style={[st.platChip, platform === p.key && { backgroundColor: C.seller, borderColor: C.seller }]} onPress={() => setPlatform(p.key)}>
            <Ionicons name={p.icon as any} size={20} color={platform === p.key ? C.white : C.textMuted} />
            <Text style={{ ...F.tiny, color: platform === p.key ? C.white : C.textMuted }}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.saveBtn, saveMut.isPending && { opacity: 0.5 }]} onPress={() => saveMut.mutate({ followers: fNum, platform })} disabled={saveMut.isPending}>
        {saveMut.isPending ? <ActivityIndicator color={C.white} /> : <Text style={{ ...F.body, color: C.white, fontWeight: '800' }}>Хадгалах</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  tierCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.bgCard, borderRadius: R.lg, padding: R.lg, marginBottom: R.md, borderWidth: 1, borderColor: C.border },
  rateBadge: { alignItems: 'center', backgroundColor: C.bgSection, borderRadius: R.md, padding: 10 },
  breakCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: R.md, borderWidth: 0.5, borderColor: C.border },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tierItem: { flexDirection: 'row', alignItems: 'center', gap: R.md, backgroundColor: C.bgCard, borderRadius: R.md, padding: R.md, marginBottom: R.sm, borderWidth: 0.5, borderColor: C.border },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: C.bgCard, borderRadius: R.md, padding: 14, color: C.white, fontSize: 16, marginBottom: R.lg, borderWidth: 0.5, borderColor: C.border },
  platChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.bgCard, borderRadius: R.md, paddingVertical: R.md, borderWidth: 0.5, borderColor: C.border },
  saveBtn: { backgroundColor: C.seller, borderRadius: 14, padding: R.lg, alignItems: 'center' },
});
