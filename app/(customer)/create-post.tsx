import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { SocialAPI, get } from '../../src/services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Search products
  useEffect(() => {
    if (search.length < 2) { setProducts([]); return; }
    const t = setTimeout(async () => {
      try {
        const data: any = await get('/products', { search, limit: 8 });
        setProducts(data?.data?.products || data?.products || []);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  }

  function toggleProduct(p: Product) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedProducts.find((sp) => sp.id === p.id)) {
      setSelectedProducts(selectedProducts.filter((sp) => sp.id !== p.id));
    } else {
      setSelectedProducts([...selectedProducts, p]);
    }
  }

  async function handleSubmit() {
    if (selectedProducts.length === 0) {
      Alert.alert('Анхааруулга', 'Дор хаяж 1 бараа сонгоно уу');
      return;
    }
    setSubmitting(true);
    try {
      await SocialAPI.create({
        content: content.trim() || undefined,
        images,
        productIds: selectedProducts.map((p) => p.id),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Alert.alert('Алдаа', e.message || 'Пост үүсгэхэд алдаа гарлаа');
    }
    setSubmitting(false);
  }

  return (
    <ScrollView style={s.screen}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Шинэ пост</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || selectedProducts.length === 0}
          style={[s.publishBtn, (submitting || selectedProducts.length === 0) && { opacity: 0.4 }]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.publishBtnText}>Нийтлэх</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={s.section}>
        <Text style={s.label}>Юу бичих вэ?</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Барааны тухай сэтгэгдлээ хуваалц..."
          placeholderTextColor="#999"
          multiline
          style={s.textArea}
        />
      </View>

      {/* Images */}
      <View style={s.section}>
        <Text style={s.label}>Зураг</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {images.map((uri, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setImages(images.filter((_, idx) => idx !== i))}
            >
              <Image source={{ uri }} style={s.imagePreview} />
              <View style={s.removeBadge}>
                <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={pickImage} style={s.addImageBtn}>
            <Text style={{ fontSize: 32, color: '#aaa' }}>＋</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Selected products */}
      {selectedProducts.length > 0 && (
        <View style={s.section}>
          <Text style={s.label}>Сонгосон бараа ({selectedProducts.length})</Text>
          {selectedProducts.map((p) => (
            <View key={p.id} style={s.selectedProduct}>
              <Image
                source={{ uri: p.images?.[0] || 'https://via.placeholder.com/40' }}
                style={s.selectedThumb}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.selectedName} numberOfLines={1}>{p.name}</Text>
                <Text style={s.selectedPrice}>{p.price.toLocaleString()}₮</Text>
              </View>
              <TouchableOpacity onPress={() => toggleProduct(p)}>
                <Text style={{ color: '#E74C3C', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Product search */}
      <View style={s.section}>
        <Text style={s.label}>Бараа таглах</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Бараа хайх..."
          placeholderTextColor="#999"
          style={s.searchInput}
        />
        {products.length > 0 && (
          <View style={{ marginTop: 8 }}>
            {products.map((p) => {
              const isSelected = selectedProducts.find((sp) => sp.id === p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => toggleProduct(p)}
                  style={[s.searchResult, isSelected && { borderColor: '#1B3A5C' }]}
                >
                  <Image
                    source={{ uri: p.images?.[0] || 'https://via.placeholder.com/40' }}
                    style={s.searchThumb}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.searchName} numberOfLines={1}>{p.name}</Text>
                    <Text style={s.searchPrice}>{p.price.toLocaleString()}₮</Text>
                  </View>
                  {isSelected && <Text style={{ color: '#1B3A5C', fontSize: 18 }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#1B3A5C',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  publishBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  publishBtnText: { color: '#1B3A5C', fontSize: 13, fontWeight: '700' },
  section: { padding: 16, backgroundColor: '#fff', marginTop: 8 },
  label: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 8 },
  textArea: {
    minHeight: 80, fontSize: 14, color: '#222',
    backgroundColor: '#F5F7FA', borderRadius: 12, padding: 12,
    textAlignVertical: 'top',
  },
  imagePreview: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f0f0f0' },
  removeBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  addImageBtn: {
    width: 100, height: 100, borderRadius: 12,
    backgroundColor: '#F5F7FA', borderWidth: 2,
    borderColor: '#e5e5e5', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  selectedProduct: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  selectedThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f0f0f0' },
  selectedName: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  selectedPrice: { fontSize: 13, fontWeight: '700', color: '#1B3A5C', marginTop: 2 },
  searchInput: {
    backgroundColor: '#F5F7FA', borderRadius: 12, padding: 12,
    fontSize: 13, color: '#222',
  },
  searchResult: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 12, marginBottom: 6,
    borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff',
  },
  searchThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f0f0f0' },
  searchName: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  searchPrice: { fontSize: 12, fontWeight: '600', color: '#1B3A5C', marginTop: 2 },
});
