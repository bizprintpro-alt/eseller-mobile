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
import * as SecureStore from 'expo-secure-store'

export default function RegisterScreen() {
  const { login }              = useAuth()
  const [name,     setName]    = useState('')
  const [email,    setEmail]   = useState('')
  const [phone,    setPhone]   = useState('')
  const [pass,     setPass]    = useState('')
  const [pass2,    setPass2]   = useState('')
  const [loading,  setLoading] = useState(false)
  const [showPass, setShowPass]= useState(false)

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
        name, email, phone: phone || undefined, password: pass,
      })

      if (res?.token && res?.user) {
        // Token-г хадгалаад шууд нэвтрэх
        await SecureStore.setItemAsync('token', res.token)
        // Auth store-д user тохируулах — login дуудахгүй
        useAuth.setState({
          user:  res.user,
          token: res.token,
          role:  'BUYER',
        })
        router.replace('/(tabs)' as any)
      } else {
        // Token буцаагаагүй бол login хийх
        await login(email, pass)
        router.replace('/(tabs)' as any)
      }
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
