import { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn';

interface GroupBuy {
  id: string;
  product: { id: string; name: string; price: number; salePrice?: number | null; images: string[] };
  targetCount: number;
  currentCount: number;
  discount: number;
  expiresAt: string;
}

export function GroupBuyCard({
  group, onJoin,
}: {
  group: GroupBuy;
  onJoin: (id: string) => void;
}) {
  const [joining, setJoining] = useState(false);
  const progress = Math.min(100, (group.currentCount / group.targetCount) * 100);
  const remaining = Math.max(0, group.targetCount - group.currentCount);
  const basePrice = group.product.salePrice || group.product.price;
  const discountedPrice = Math.floor(basePrice * (1 - group.discount));

  const diff = new Date(group.expiresAt).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(diff / 3600000));
  const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));

  async function handleJoin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoining(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await fetch(`${API}/api/group-buy/${group.id}/join`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        Alert.alert('Алдаа', data.error || 'Алдаа гарлаа');
        return;
      }
      onJoin(group.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Алдаа', 'Сүлжээний алдаа');
    }
    setJoining(false);
  }

  return (
    <View style={s.card}>
      <View style={s.badge}>
        <Text style={s.badgeText}>👥 Хамтарч авах — {Math.round(group.discount * 100)}% хямд</Text>
      </View>

      <View style={s.row}>
        <Image source={{ uri: group.product.images?.[0] || 'https://via.placeholder.com/80' }} style={s.thumb} />
        <View style={s.info}>
          <Text style={s.name} numberOfLines={2}>{group.product.name}</Text>
          <View style={s.priceRow}>
            <Text style={s.newPrice}>{discountedPrice.toLocaleString()}₮</Text>
            <Text style={s.oldPrice}>{basePrice.toLocaleString()}₮</Text>
          </View>
          <Text style={s.timer}>⏰ {hours}ц {minutes}мин үлдлээ</Text>
        </View>
      </View>

      <View style={s.progressSection}>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progress}%` as any }]} />
        </View>
        <View style={s.progressLabels}>
          <Text style={s.progressText}>{group.currentCount}/{group.targetCount} хүн нэгдсэн</Text>
          <Text style={s.remainText}>{remaining} хүн дутуу</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleJoin} disabled={joining || remaining === 0}
        style={[s.joinBtn, (joining || remaining === 0) && s.joinBtnDisabled]}>
        <Text style={s.joinBtnText}>
          {remaining === 0
            ? '✓ Бүрэн нэгдсэн'
            : joining
              ? 'Нэгдэж байна...'
              : `⚡ Нэгдэх — ${discountedPrice.toLocaleString()}₮`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 2,
  },
  badge: { backgroundColor: '#FFF3CD', paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#856404' },
  row: { flexDirection: 'row', gap: 12, padding: 12 },
  thumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0' },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  newPrice: { fontSize: 16, fontWeight: '700', color: '#1B3A5C' },
  oldPrice: { fontSize: 12, color: '#bbb', textDecorationLine: 'line-through' },
  timer: { fontSize: 10, color: '#E67E22', marginTop: 4 },
  progressSection: { paddingHorizontal: 12, paddingBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#E67E22', borderRadius: 3 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  progressText: { fontSize: 10, color: '#666' },
  remainText: { fontSize: 10, color: '#E67E22', fontWeight: '500' },
  joinBtn: {
    backgroundColor: '#E67E22', margin: 12, marginTop: 4, borderRadius: 10,
    padding: 13, alignItems: 'center',
  },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
