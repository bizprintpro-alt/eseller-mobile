import {
  View, Text, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native'
import { router }   from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth }  from '../../src/store/auth'
import { useCart }  from '../../src/store/cart'
import { C, R, roleColor }
  from '../../src/shared/design'

const ROLE_LABELS: Record<string, string> = {
  BUYER:  'Худалдан авагч',
  STORE:  'Дэлгүүр эзэн',
  SELLER: 'Борлуулагч',
  DRIVER: 'Жолооч',
}

export default function ProfileScreen() {
  const { user, role, logout } = useAuth()
  const { count }              = useCart()
  const color                  = roleColor(role)

  const MENU = user ? [
    // Захиалга & Худалдан авалт
    { icon:'cube-outline',
      label:'Захиалгын түүх',
      onPress: () => router.push('/orders' as any) },
    { icon:'cart-outline',
      label:`Сагс (${count()})`,
      onPress: () => router.push('/cart' as any) },
    { icon:'heart-outline',
      label:'Хадгалсан',
      onPress: () => router.push('/(customer)/wishlist' as any) },
    { icon:'refresh-outline',
      label:'Буцаалт & Маргаан',
      sub: '48 цагт буцаах',
      onPress: () => router.push('/(customer)/returns' as any) },
    { icon:'location-outline',
      label:'Хүргэлтийн хаяг',
      onPress: () => router.push('/(customer)/addresses' as any) },
    // Хэтэвч & Урамшуулал
    { icon:'wallet-outline',
      label:'eSeller хэтэвч',
      accent: true,
      onPress: () => router.push('/(customer)/wallet' as any) },
    { icon:'flash-outline',
      label:'Flash Sale 🔥',
      onPress: () => router.push('/(customer)/flash-sale' as any) },
    { icon:'gift-outline',
      label:'Купон & Промо код',
      onPress: () => router.push('/(customer)/coupons' as any) },
    { icon:'trophy-outline',
      label:'Урамшааллын оноо',
      onPress: () => router.push('/(customer)/tier-details' as any) },
    // Бизнес
    { icon:'storefront-outline',
      label:'Дэлгүүр нээх',
      accent: true,
      onPress: () => router.push('/(customer)/register-shop' as any) },
    // Тохиргоо
    { icon:'person-outline',
      label:'Профайл засах',
      onPress: () => router.push('/(customer)/edit-profile' as any) },
    { icon:'notifications-outline',
      label:'Мэдэгдэл тохиргоо',
      onPress: () => router.push('/(customer)/notification-settings' as any) },
    { icon:'shield-checkmark-outline',
      label:'Аюулгүй байдал',
      onPress: () => router.push('/(customer)/security' as any) },
    { icon:'help-circle-outline',
      label:'Тусламж & FAQ',
      onPress: () => router.push('/(customer)/help' as any) },
  ] : []

  return (
    <ScrollView style={{
      flex:            1,
      backgroundColor: C.bg,
    }}>

      {/* Header */}
      <View style={{
        paddingTop:      60,
        paddingBottom:   32,
        alignItems:      'center',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: C.bgCard,
      }}>
        {/* Avatar */}
        <View style={{
          width:           80,
          height:          80,
          borderRadius:    40,
          backgroundColor: color,
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    12,
          borderWidth:     2,
          borderColor:     color + '60',
        }}>
          <Text style={{
            color:      C.white,
            fontSize:   30,
            fontWeight: '800',
          }}>
            {user
              ? user.name?.[0]?.toUpperCase()
              : '?'
            }
          </Text>
        </View>

        <Text style={{
          color:      C.text,
          fontSize:   20,
          fontWeight: '800',
          marginBottom: 4,
        }}>
          {user?.name || 'Зочин'}
        </Text>
        <Text style={{
          color:        C.textMuted,
          fontSize:     13,
          marginBottom: 12,
        }}>
          {user?.email || 'Нэвтрээгүй'}
        </Text>

        {/* Role badge */}
        <View style={{
          backgroundColor:   color + '18',
          borderRadius:      R.full,
          paddingHorizontal: 16,
          paddingVertical:   6,
          borderWidth:       1,
          borderColor:       color + '40',
        }}>
          <Text style={{
            color:      color,
            fontWeight: '700',
            fontSize:   13,
          }}>
            {ROLE_LABELS[role] || role}
          </Text>
        </View>
      </View>

      {/* Нэвтрэх / Бүртгүүлэх */}
      {!user && (
        <View style={{
          margin: 16,
          gap:    10,
        }}>
          <TouchableOpacity
            onPress={() =>
              router.push('/(auth)/login' as any)
            }
            style={{
              backgroundColor: C.brand,
              borderRadius:    R.lg,
              padding:         16,
              alignItems:      'center',
            }}
          >
            <Text style={{
              color:      C.white,
              fontWeight: '700',
              fontSize:   16,
            }}>
              Нэвтрэх
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push('/(auth)/register' as any)
            }
            style={{
              backgroundColor: C.bgSection,
              borderRadius:    R.lg,
              padding:         16,
              alignItems:      'center',
              borderWidth:     1,
              borderColor:     C.border,
            }}
          >
            <Text style={{
              color:      C.text,
              fontWeight: '600',
              fontSize:   16,
            }}>
              Бүртгүүлэх
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu */}
      {user && (
        <View style={{ padding: 16, gap: 8 }}>
          {MENU.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={item.onPress}
              style={{
                flexDirection:   'row',
                alignItems:      'center',
                backgroundColor: C.bgSection,
                borderRadius:    R.lg,
                padding:         16,
                gap:             12,
                borderWidth:     1,
                borderColor:     C.border,
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={C.textSub}
              />
              <Text style={{
                flex:       1,
                color:      C.text,
                fontSize:   15,
                fontWeight: '500',
              }}>
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={C.border}
              />
            </TouchableOpacity>
          ))}

          {/* Гарах */}
          <TouchableOpacity
            onPress={() => Alert.alert(
              'Гарах',
              'Гарахдаа итгэлтэй байна уу?',
              [
                { text:'Болих', style:'cancel' },
                {
                  text:    'Гарах',
                  style:   'destructive',
                  onPress: logout,
                },
              ]
            )}
            style={{
              flexDirection:   'row',
              alignItems:      'center',
              backgroundColor: C.bgSection,
              borderRadius:    R.lg,
              padding:         16,
              gap:             12,
              borderWidth:     1,
              borderColor:     C.brand + '30',
              marginTop:       8,
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={C.brand}
            />
            <Text style={{
              flex:       1,
              color:      C.brand,
              fontSize:   15,
              fontWeight: '600',
            }}>
              Гарах
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  )
}
