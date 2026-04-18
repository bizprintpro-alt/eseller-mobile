import { useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Linking, Image } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '../src/store/cart'
import { post } from '../src/services/api'
import { C, R } from '../src/shared/design'

const PAYMENT_METHODS = [
  { id: 'qpay', label: 'QPay', icon: 'qr-code' as const, color: '#E8242C' },
  { id: 'socialpay', label: 'SocialPay', icon: 'phone-portrait' as const, color: '#1A73E8' },
  { id: 'card', label: 'Visa / MC', icon: 'card' as const, color: '#6366F1' },
]

const BANKS = [
  { name: 'Хаан банк', url: 'khanbank://', color: '#006341' },
  { name: 'Голомт', url: 'golomt://', color: '#E8242C' },
  { name: 'TDB', url: 'tdb://', color: '#003087' },
  { name: 'Мост Мани', url: 'mostmoney://', color: '#FF6B00' },
  { name: 'SocialPay', url: 'socialpay://', color: '#1A73E8' },
]

export default function CheckoutScreen() {
  const { items, total, clear } = useCart()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('qpay')
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
        paymentMethod: method,
      })
      console.log('[checkout response]', JSON.stringify({
        orderId: res?.orderId, invoiceId: res?.invoiceId,
        isDemoMode: res?.isDemoMode,
        hasQrDataUrl: !!res?.qrDataUrl, hasQrImage: !!res?.qrImage,
      }))

      // Demo mode — QPay credentials байхгүй, бодит төлбөр хийх шаардлагагүй
      if (res?.isDemoMode) {
        clear()
        Alert.alert(
          '✅ Захиалга үүслээ',
          `Захиалга #${String(res.orderId).slice(-6).toUpperCase()}\n` +
          `Нийт: ${Number(res.amount ?? 0).toLocaleString()}₮\n\n` +
          `(Demo горим — QPay тохируулаагүй)`,
          [{ text: 'OK', onPress: () => router.replace('/orders' as any) }],
        )
        return
      }

      setQpayData(res)
      clear()
      let t = 300
      const interval = setInterval(() => { t--; setCountdown(t); if (t <= 0) clearInterval(interval) }, 1000)
    } catch (e: any) {
      console.error('[checkout error]', e)
      Alert.alert('Алдаа', e.message || 'Захиалга үүсгэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  // qrDataUrl нь аль хэдийн `data:image/png;base64,...` бүрэн URL,
  // харин qrImage нь зөвхөн base64 string — хоёуланг handle хийнэ
  const qrUri =
    qpayData?.qrDataUrl ||
    (qpayData?.qrImage ? `data:image/png;base64,${qpayData.qrImage}` : null)

  // ═══ QPay QR Screen ═══
  if (qpayData) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', padding: 24, paddingTop: 80 }}>
      {/* Escrow notice */}
      <View style={{ backgroundColor: '#34A85315', borderRadius: R.lg, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#34A85340', flexDirection: 'row', gap: 10, alignItems: 'flex-start', width: '100%' }}>
        <Ionicons name="shield-checkmark" size={20} color="#34A853" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#34A853', fontWeight: '700', fontSize: 13 }}>Дундын данс (Escrow)</Text>
          <Text style={{ color: '#34A85390', fontSize: 12, marginTop: 2 }}>Таны төлбөр 3 хоног хамгаалагдаж, бараа хүргэгдсэний дараа л дэлгүүрт шилжинэ</Text>
        </View>
      </View>

      <Text style={{ color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>QPay төлбөр</Text>
      <Text style={{ color: C.textSub, marginBottom: 24, textAlign: 'center' }}>QR кодыг банкны аппаар скан хийнэ үү</Text>

      {qrUri && (
        <View style={{ backgroundColor: '#fff', borderRadius: R.lg, padding: 12 }}>
          <Image source={{ uri: qrUri }} style={{ width: 200, height: 200 }} />
        </View>
      )}

      <Text style={{ color: C.brand, fontSize: 28, fontWeight: '900', marginTop: 16 }}>
        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
      </Text>
      <Text style={{ color: C.textMuted, marginTop: 4, marginBottom: 24 }}>Хугацаа дуусахаас өмнө төлнө үү</Text>

      {/* Bank deep links */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' }}>
        {BANKS.map(b => (
          <TouchableOpacity key={b.name}
            onPress={() => Linking.openURL(b.url).catch(() => Alert.alert('Апп олдсонгүй', `${b.name} апп суулгаагүй байна`))}
            style={{ backgroundColor: b.color + '15', borderRadius: R.md, padding: 12, minWidth: '44%', alignItems: 'center', borderWidth: 1, borderColor: b.color + '40' }}>
            <Text style={{ color: b.color, fontSize: 13, fontWeight: '700' }}>{b.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={{ marginTop: 24, padding: 14 }}>
        <Text style={{ color: C.textSub, fontWeight: '600' }}>Нүүр хуудас руу буцах</Text>
      </TouchableOpacity>
    </View>
  )

  // ═══ Checkout Form ═══
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>Захиалга</Text>
      </View>

      {/* Escrow notice */}
      <View style={{ margin: 12, backgroundColor: '#34A85315', borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: '#34A85340', flexDirection: 'row', gap: 10 }}>
        <Ionicons name="shield-checkmark" size={20} color="#34A853" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#34A853', fontWeight: '700', fontSize: 13 }}>3 өдрийн дундын данс хамгаалалт</Text>
          <Text style={{ color: '#34A85390', fontSize: 12, marginTop: 2 }}>Бараа хүргэгдсэний дараа л төлбөр шилжинэ</Text>
        </View>
      </View>

      {/* Items */}
      <View style={{ margin: 12, backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ color: C.textSub, fontWeight: '700', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Захиалгын дэлгэрэнгүй</Text>
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

      {/* Payment method selector */}
      <View style={{ margin: 12 }}>
        <Text style={{ color: C.textSub, fontWeight: '600', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Төлбөрийн арга</Text>
        <View style={{ gap: 8 }}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity key={m.id} onPress={() => setMethod(m.id)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: method === m.id ? m.color + '15' : C.bgCard, borderRadius: R.lg, padding: 14, gap: 12, borderWidth: 1, borderColor: method === m.id ? m.color : C.border }}>
              <Ionicons name={m.icon} size={22} color={m.color} />
              <Text style={{ flex: 1, color: C.text, fontWeight: '600' }}>{m.label}</Text>
              {method === m.id && <Ionicons name="checkmark-circle" size={20} color={m.color} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Address */}
      <View style={{ margin: 12 }}>
        <Text style={{ color: C.textSub, fontWeight: '600', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Хүргэх хаяг</Text>
        <TextInput placeholder="Дүүрэг, хороо, байшин, орц, тоот..." placeholderTextColor={C.textMuted} value={address} onChangeText={setAddress}
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
          : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              💳 {method === 'qpay' ? 'QPay-р' : method === 'socialpay' ? 'SocialPay-р' : 'Картаар'} төлөх
            </Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}
