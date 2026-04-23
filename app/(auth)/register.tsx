import React, { useState } from 'react'
import {
  View, Text, TextInput,
  TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native'
import { router }   from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { post }     from '../../src/services/api'
import { useAuth }  from '../../src/store/auth'
import { C, R, F }  from '../../src/shared/design'
import { routeByRole } from '../../src/shared/routing'

export default function RegisterScreen() {
  const { login }              = useAuth()
  const [name,     setName]    = useState('')
  const [email,    setEmail]   = useState('')
  const [phone,    setPhone]   = useState('')
  const [pass,     setPass]    = useState('')
  const [pass2,    setPass2]   = useState('')
  const [role,     setRole]    = useState('buyer')
  const [loading,  setLoading] = useState(false)
  const [showPass, setShowPass]= useState(false)

  const ROLES = [
    { key: 'buyer',    icon: 'cart-outline' as const,       label: 'Худалдан авагч', desc: 'Бараа захиалах', color: C.primary },
    { key: 'seller',   icon: 'storefront-outline' as const, label: 'Дэлгүүр эзэн',  desc: 'Дэлгүүр удирдах', color: '#0D652D' },
    { key: 'affiliate',icon: 'megaphone-outline' as const,  label: 'Борлуулагч',    desc: 'Комисс олох',    color: '#E37400' },
    { key: 'delivery', icon: 'car-outline' as const,        label: 'Жолооч',        desc: 'Хүргэлт хийх',   color: '#C62828' },
  ]

  const handleRegister = async () => {
    if (!name || !email || !pass) {
      Alert.alert('Анхаар', 'Бүх талбарыг бөглөнө үү')
      return
    }
    if (pass !== pass2) {
      Alert.alert('Анхаар', 'Нууц үг таарахгүй байна')
      return
    }
    if (pass.length < 6) {
      Alert.alert('Анхаар', 'Нууц үг 6+ тэмдэгт байх ёстой')
      return
    }

    setLoading(true)
    try {
      // Register буцааж token + user өгдөг
      const res: any = await post('/auth/register', {
        name, email, phone: phone || undefined, password: pass, role,
      })

      if (res?.token) {
        // Token-ийг /auth/me-ээр баталгаажуулаад, canonical user-ийг ачаална.
        // Шууд setState хийвэл token хүчингүй / user shape дутуу бол
        // tabs руу ороход UI эвдэрч магадгүй.
        await useAuth.getState().restoreSession(res.token)
      } else {
        // Token буцаагаагүй бол login хийх
        await login(email, pass)
      }
      const user = useAuth.getState().user
      routeByRole(user?.role)
    } catch (e: any) {
      Alert.alert('Алдаа',
        e.message || 'Бүртгэл үүсгэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={{
      flex: 1, backgroundColor: C.bg,
    }}>
      <View style={{ padding: 24, paddingTop: 60 }}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 32 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>

        <Text style={{ ...F.h1, color: C.text, marginBottom: 6 }}>
          Бүртгүүлэх
        </Text>
        <Text style={{
          color: C.textMuted, marginBottom: 32, fontSize: 14,
        }}>
          Eseller.mn-д тавтай морил
        </Text>

        {/* Role picker */}
        <Text style={{
          color: C.textSub, fontSize: 13,
          fontWeight: '600', marginBottom: 8,
        }}>Ролл сонгох</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {ROLES.map(r => (
            <TouchableOpacity key={r.key} onPress={() => setRole(r.key)}
              style={{
                width: '47%' as any, flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: role === r.key ? r.color + '18' : C.bgSection,
                borderRadius: R.lg, padding: 12,
                borderWidth: 1.5, borderColor: role === r.key ? r.color : C.border,
              }}>
              <Ionicons name={r.icon} size={20} color={role === r.key ? r.color : C.textMuted} />
              <View>
                <Text style={{ color: role === r.key ? C.text : C.textSub, fontSize: 12, fontWeight: '700' }}>{r.label}</Text>
                <Text style={{ color: C.textMuted, fontSize: 10 }}>{r.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {[
          { label:'Нэр', value: name, set: setName,
            ph: 'Таны нэр', type: 'default' },
          { label:'Имэйл', value: email, set: setEmail,
            ph: 'example@gmail.com', type: 'email-address' },
          { label:'Утасны дугаар', value: phone, set: setPhone,
            ph: '99XXXXXX', type: 'phone-pad' },
        ].map((f, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={{
              color: C.textSub, fontSize: 13,
              fontWeight: '600', marginBottom: 6,
            }}>
              {f.label}
            </Text>
            <TextInput
              value={f.value}
              onChangeText={f.set}
              placeholder={f.ph}
              placeholderTextColor={C.textMuted}
              keyboardType={f.type as any}
              autoCapitalize="none"
              style={{
                backgroundColor: C.bgSection, borderRadius: R.lg,
                padding: 14, color: C.text, fontSize: 15,
                borderWidth: 1, borderColor: C.border,
              }}
            />
          </View>
        ))}

        {['Нууц үг', 'Нууц үг давтах'].map((label, i) => (
          <View key={label} style={{ marginBottom: 16 }}>
            <Text style={{
              color: C.textSub, fontSize: 13,
              fontWeight: '600', marginBottom: 6,
            }}>
              {label}
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: C.bgSection, borderRadius: R.lg,
              borderWidth: 1, borderColor: C.border,
            }}>
              <TextInput
                value={i === 0 ? pass : pass2}
                onChangeText={i === 0 ? setPass : setPass2}
                placeholder="••••••••"
                placeholderTextColor={C.textMuted}
                secureTextEntry={!showPass}
                style={{
                  flex: 1, padding: 14,
                  color: C.text, fontSize: 15,
                }}
              />
              {i === 0 && (
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={{ paddingRight: 14 }}
                >
                  <Ionicons
                    name={showPass ? 'eye-off' : 'eye'}
                    size={20} color={C.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: loading ? C.bgSection : C.brand,
            borderRadius: R.xl, padding: 17,
            alignItems: 'center', marginTop: 8, marginBottom: 20,
          }}
        >
          {loading
            ? <ActivityIndicator color={C.white} />
            : <Text style={{
                color: C.white, fontWeight: '800', fontSize: 16,
              }}>Бүртгүүлэх</Text>
          }
        </TouchableOpacity>

        <View style={{
          flexDirection: 'row', justifyContent: 'center', gap: 6,
        }}>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>
            Бүртгэл байгаа юу?
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text style={{
              color: C.brand, fontSize: 14, fontWeight: '600',
            }}>Нэвтрэх</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  )
}
