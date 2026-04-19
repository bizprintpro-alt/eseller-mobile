import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, Image, TextInput, Alert, RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { get, post, del } from '../../src/services/api'
import { uploadMultipleImages } from '../../src/lib/uploadImage'
import { C, R } from '../../src/shared/design'

export default function OwnerProducts() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    name: '', price: '', description: '', stock: '', category: 'other', images: [] as string[],
  })
  const [uploading, setUploading] = useState(false)

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['owner-products'],
    queryFn: () => get('/seller/products'),
  })

  const addMutation = useMutation({
    mutationFn: (d: any) => post('/seller/products', d),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      qc.invalidateQueries({ queryKey: ['owner-products'] })
      setModal(false)
      setForm({ name: '', price: '', description: '', stock: '', category: 'other', images: [] })
    },
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`/seller/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-products'] }),
  })

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (r.canceled) return
    const localUris = r.assets.map(a => a.uri)
    setUploading(true)
    try {
      const cloudUrls = await uploadMultipleImages(localUris)
      setForm(f => ({ ...f, images: [...f.images, ...cloudUrls].slice(0, 5) }))
    } catch {
      Alert.alert('Алдаа', 'Зураг хуулахад алдаа гарлаа')
    } finally {
      setUploading(false)
    }
  }

  const products = ((data as any)?.products || (Array.isArray(data) ? data : []))
    .filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>Бараанууд</Text>
        <TouchableOpacity onPress={() => setModal(true)} style={{ backgroundColor: C.brand, borderRadius: R.full, padding: 10 }}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={{ marginHorizontal: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: R.lg, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border }}>
        <Ionicons name="search" size={16} color={C.textMuted} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Бараа хайх..." placeholderTextColor={C.textMuted}
          style={{ flex: 1, color: C.text, padding: 12, fontSize: 14 }} />
      </View>

      {/* Product list */}
      <FlatList
        data={products}
        keyExtractor={(p: any) => p.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
        renderItem={({ item: p }) => (
          <View style={{ flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: R.lg, padding: 12, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: C.border }}>
            {p.images?.[0] ? (
              <Image source={{ uri: p.images[0] }} style={{ width: 72, height: 72, borderRadius: R.md }} resizeMode="cover" />
            ) : (
              <View style={{ width: 72, height: 72, borderRadius: R.md, backgroundColor: C.bgSection, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="image-outline" size={24} color={C.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }} numberOfLines={2}>{p.name}</Text>
              <Text style={{ color: C.brand, fontWeight: '800', fontSize: 15, marginTop: 4 }}>{p.price?.toLocaleString()}₮</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Text style={{ color: C.textSub, fontSize: 12 }}>Нөөц: {p.stock ?? 0}</Text>
                <View style={{ backgroundColor: p.isActive ? '#34A85320' : '#E8242C20', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: p.isActive ? '#34A853' : C.brand }}>{p.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}</Text>
                </View>
              </View>
            </View>
            <View style={{ gap: 8, justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => router.push(`/product/${p.id}` as any)}>
                <Ionicons name="eye-outline" size={18} color={C.textSub} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Устгах', `"${p.name}" устгах уу?`, [
                { text: 'Болих', style: 'cancel' },
                { text: 'Устгах', style: 'destructive', onPress: () => deleteMutation.mutate(p.id) },
              ])}>
                <Ionicons name="trash-outline" size={18} color={C.brand} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={{ color: C.textSub, marginTop: 12, fontSize: 16 }}>Бараа байхгүй байна</Text>
            <TouchableOpacity onPress={() => setModal(true)} style={{ backgroundColor: C.brand, borderRadius: R.lg, padding: 14, marginTop: 16 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>+ Бараа нэмэх</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add product modal */}
      {modal && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, maxHeight: '85%' }}>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 16 }}>Бараа нэмэх</Text>
            {[
              { key: 'name', placeholder: 'Барааны нэр *', keyboard: 'default' },
              { key: 'price', placeholder: 'Үнэ (₮) *', keyboard: 'numeric' },
              { key: 'stock', placeholder: 'Нөөц тоо', keyboard: 'numeric' },
              { key: 'description', placeholder: 'Тайлбар', keyboard: 'default' },
            ].map(f => (
              <TextInput
                key={f.key}
                value={(form as any)[f.key]}
                onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={C.textMuted}
                keyboardType={f.keyboard as any}
                style={{ backgroundColor: C.bgSection, borderRadius: R.lg, padding: 12, color: C.text, fontSize: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border }}
              />
            ))}
            <TouchableOpacity onPress={pickImage} disabled={uploading} style={{ backgroundColor: C.bgSection, borderRadius: R.lg, padding: 14, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              {uploading
                ? <ActivityIndicator size="small" color={C.brand} />
                : <Ionicons name="camera" size={18} color={C.textMuted} />}
              <Text style={{ color: C.textMuted, fontWeight: '600' }}>
                {uploading ? 'Зураг хуулж байна...' : `Зураг нэмэх (${form.images.length}/5)`}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setModal(false)} style={{ flex: 1, backgroundColor: C.bgSection, borderRadius: R.lg, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
                <Text style={{ color: C.textSub, fontWeight: '700' }}>Болих</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addMutation.mutate({ name: form.name, price: parseInt(form.price) || 0, stock: parseInt(form.stock) || 0, description: form.description, images: form.images, category: form.category })}
                disabled={!form.name || !form.price || addMutation.isPending}
                style={{ flex: 2, backgroundColor: (!form.name || !form.price) ? C.textMuted : C.brand, borderRadius: R.lg, padding: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{addMutation.isPending ? 'Нэмж байна...' : 'Нэмэх'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
