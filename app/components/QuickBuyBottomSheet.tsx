import { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  StyleSheet, Image, ActivityIndicator, Linking, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn';

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock?: number;
  };
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickBuyBottomSheet({ product, visible, onClose, onSuccess }: Props) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const stock = product.stock ?? 999;

  async function handleOrder() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await fetch(`${API}/api/quick-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        Alert.alert('Алдаа', data.error || 'Алдаа гарлаа');
        return;
      }
      const link = data.data?.followUpLink || data.followUpLink;
      if (link) {
        await Linking.openURL(link);
        onSuccess?.();
        onClose();
      } else {
        Alert.alert('Алдаа', 'Төлбөрийн link үүсгэж чадсангүй');
      }
    } catch {
      Alert.alert('Алдаа', 'Сүлжээний алдаа');
    }
    setLoading(false);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} onPress={onClose} activeOpacity={1} />
      <View style={s.sheet}>
        <View style={s.handle} />

        <View style={s.productRow}>
          <Image
            source={{ uri: product.images?.[0] || 'https://via.placeholder.com/72' }}
            style={s.thumb}
          />
          <View style={s.productInfo}>
            <Text style={s.productName}>{product.name}</Text>
            <Text style={s.productPrice}>{(product.price * qty).toLocaleString()}₮</Text>
            <Text style={s.productStock}>Нөөц: {stock}ш</Text>
          </View>
        </View>

        <View style={s.qtyRow}>
          <Text style={s.qtyLabel}>Тоо хэмжээ</Text>
          <View style={s.qtyCtrl}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setQty(Math.max(1, qty - 1));
              }}
              style={s.qtyBtn}
            >
              <Text style={s.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{qty}</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setQty(Math.min(stock, qty + 1));
              }}
              style={[s.qtyBtn, s.qtyBtnActive]}
            >
              <Text style={[s.qtyBtnText, { color: '#fff' }]}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleOrder}
          disabled={loading}
          style={[s.orderBtn, loading && s.orderBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.orderBtnText}>
              {(product.price * qty).toLocaleString()}₮ — QPay-р төлөх 🏦
            </Text>
          )}
        </TouchableOpacity>
        <Text style={s.safeText}>🔒 Аюулгүй · Escrow хамгаалалт</Text>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#fff', borderRadius: 24, paddingBottom: 34, paddingTop: 4 },
  handle: { width: 36, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  productRow: {
    flexDirection: 'row', gap: 12, padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  thumb: { width: 72, height: 72, borderRadius: 12 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  productPrice: { fontSize: 18, fontWeight: '700', color: '#1B3A5C', marginTop: 4 },
  productStock: { fontSize: 11, color: '#aaa', marginTop: 2 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  qtyLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 0.5, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnActive: { backgroundColor: '#1B3A5C', borderColor: '#1B3A5C' },
  qtyBtnText: { fontSize: 18, color: '#333', fontWeight: '300' },
  qtyNum: { fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  orderBtn: {
    backgroundColor: '#1B3A5C', borderRadius: 12,
    padding: 16, margin: 16, alignItems: 'center',
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  safeText: { textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: -8 },
});
