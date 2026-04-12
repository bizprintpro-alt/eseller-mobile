import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '../src/store/cart'
import { C, R } from '../src/shared/design'

export default function CartScreen() {
  const { items, remove, update, total, count, clear } = useCart()

  if (!items.length) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 64 }}>🛒</Text>
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>Сагс хоосон байна</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)/store' as any)}
        style={{ backgroundColor: C.brand, borderRadius: R.lg, paddingHorizontal: 24, paddingVertical: 14 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Дэлгүүр үзэх</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>Сагс ({count()})</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 12, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: C.border }}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: R.md, backgroundColor: C.bgSection }} resizeMode="cover" />
            ) : (
              <View style={{ width: 80, height: 80, borderRadius: R.md, backgroundColor: C.bgSection, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cube-outline" size={28} color={C.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>{item.name}</Text>
              <Text style={{ color: C.brand, fontWeight: '800', fontSize: 16, marginTop: 4 }}>{item.price.toLocaleString()}₮</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
                <TouchableOpacity onPress={() => update(item.id, item.qty - 1)}
                  style={{ backgroundColor: C.bgSection, borderRadius: 6, padding: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.text, fontWeight: '700' }}>−</Text>
                </TouchableOpacity>
                <Text style={{ color: C.text, fontWeight: '700', minWidth: 24, textAlign: 'center' }}>{item.qty}</Text>
                <TouchableOpacity onPress={() => update(item.id, item.qty + 1)}
                  style={{ backgroundColor: C.bgSection, borderRadius: 6, padding: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.text, fontWeight: '700' }}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.id)} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="trash-outline" size={18} color={C.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.bgCard, padding: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: C.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ color: C.textSub, fontSize: 16 }}>Нийт дүн:</Text>
          <Text style={{ color: C.brand, fontSize: 22, fontWeight: '900' }}>{total().toLocaleString()}₮</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/checkout' as any)}
          style={{ backgroundColor: C.brand, borderRadius: R.lg, padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Захиалах ({count()} бараа)</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
