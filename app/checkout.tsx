import { useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Linking, Image } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '../src/store/cart'
import { post } from '../src/services/api'
import { C, R } from '../src/shared/design'

const BANKS = [
  { name: 'Хаан банк', icon: '🏦' },
  { name: 'Голомт', icon: '🏛' },
  { name: 'TDB', icon: '💳' },
  { name: 'Мост Мани', icon: '📱' },
]

export default function CheckoutScreen() {
  const { items, total, clear } = useCart()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [qpayData, setQpayData] = useState<any>(null)
  const [countdown, setCountdown] = useState(300)

  const createOrder = async () => {
    if (!address || !phone) {
      Alert.alert('Анхааруулга', 'Хаяг, утасны дугаар оруулна уу')
      return
    }
    setLoading(true)
    try {
      const res: any = await post('/checkout/create-invoice', {
        items: items.map(i => ({ productId: i.id, qty: i.qty, price: i.price })),
        deliveryAddress: address,
        phone,
        totalAmount: total(),
      })
      setQpayData(res)
      clear()
      let t = 300
      const interval = setInterval(() => {
        t--
        setCountdown(t)
        if (t <= 0) clearInterval(interval)
      }, 1000)
    } catch (e: any) {
      Alert.alert('Алдаа', e.message || 'Захиалга үүсгэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  // QPay payment screen
  if (qpayData) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', padding: 24, paddingTop: 80 }}>
      <Text style={{ color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>QPay төлбөр</Text>
      <Text style={{ color: C.textSub, marginBottom: 24, textAlign: 'center' }}>QR кодыг банкны аппаар скан хийнэ үү</Text>

      {qpayData.qrImage && (
        <View style={{ backgroundColor: '#fff', borderRadius: R.lg, padding: 12 }}>
          <Image source={{ uri: `data:image/png;base64,${qpayData.qrImage}` }}
            style={{ width: 200, height: 200 }} />
        </View>
      )}

      <Text style={{ color: C.brand, fontSize: 28, fontWeight: '900', marginTop: 16 }}>
        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
      </Text>
      <Text style={{ color: C.textMuted, marginTop: 4 }}>Хугацаа дуусахаас өмнө төлнө үү</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24, justifyContent: 'center' }}>
        {BANKS.map(b => (
          <TouchableOpacity key={b.name}
            style={{ backgroundColor: C.bgSection, borderRadius: R.md, padding: 12, minWidth: 120, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 20 }}>{b.icon}</Text>
            <Text style={{ color: C.text, fontSize: 12, fontWeight: '600', marginTop: 4 }}>{b.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={{ marginTop: 32 }}>
        <Text style={{ color: C.textSub, fontWeight: '600' }}>Нүүр хуудас руу буцах</Text>
      </TouchableOpacity>
    </View>
  )

  // Checkout form
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>Захиалга</Text>
      </View>

      {/* Items */}
      <View style={{ margin: 12, backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: C.text, flex: 1 }} numberOfLines={1}>{item.name} ×{item.qty}</Text>
            <Text style={{ color: C.brand, fontWeight: '700' }}>{(item.price * item.qty).toLocaleString()}₮</Text>
          </View>
        ))}
        <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: C.text, fontWeight: '700' }}>Нийт</Text>
          <Text style={{ color: C.brand, fontWeight: '900', fontSize: 18 }}>{total().toLocaleString()}₮</Text>
        </View>
      </View>

      {/* Address */}
      <View style={{ margin: 12 }}>
        <Text style={{ color: C.textSub, fontWeight: '600', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Хүргэх хаяг</Text>
        <TextInput placeholder="Дүүрэг, хороо, байшин..." placeholderTextColor={C.textMuted} value={address} onChangeText={setAddress}
          multiline style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14, color: C.text, fontSize: 14, textAlignVertical: 'top', minHeight: 80, borderWidth: 1, borderColor: C.border }} />
      </View>

      {/* Phone */}
      <View style={{ margin: 12 }}>
        <Text style={{ color: C.textSub, fontWeight: '600', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Утасны дугаар</Text>
        <TextInput placeholder="8811-XXXX" placeholderTextColor={C.textMuted} value={phone} onChangeText={setPhone}
          keyboardType="phone-pad" style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 14, color: C.text, fontSize: 16, borderWidth: 1, borderColor: C.border }} />
      </View>

      <TouchableOpacity onPress={createOrder} disabled={loading}
        style={{ margin: 12, backgroundColor: loading ? C.textMuted : C.brand, borderRadius: R.lg, padding: 18, alignItems: 'center' }}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>💳 QPay-р төлөх</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}
