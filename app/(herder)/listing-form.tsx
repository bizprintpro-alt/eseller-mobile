import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { HerderAPI } from '../../src/features/herder/api';
import { CATEGORIES } from '../../src/features/herder/constants';
import type { ProductWritable } from '../../src/features/herder/types';
import { C, R } from '../../src/shared/design';

type FormState = {
  name:              string;
  description:       string;
  price:             string;
  salePrice:         string;
  category:          string;
  stock:             string;
  requiresColdChain: boolean;
  images:            string[];
};

const EMPTY: FormState = {
  name:              '',
  description:       '',
  price:             '',
  salePrice:         '',
  category:          CATEGORIES[0],
  stock:             '',
  requiresColdChain: false,
  images:            [],
};

export default function HerderListingForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  const existing = useQuery({
    queryKey: ['herder', 'my', 'products', 'detail', id],
    queryFn:  () => HerderAPI.detail(id as string),
    enabled:  isEdit,
  });

  useEffect(() => {
    if (isEdit && existing.data && !hydrated) {
      const p = existing.data;
      setForm({
        name:              p.name ?? '',
        description:       p.description ?? '',
        price:             String(p.price ?? ''),
        salePrice:         p.salePrice != null ? String(p.salePrice) : '',
        category:          p.category ?? CATEGORIES[0],
        stock:             p.stock != null ? String(p.stock) : '',
        requiresColdChain: !!p.requiresColdChain,
        images:            p.images ?? [],
      });
      setHydrated(true);
    }
  }, [existing.data, isEdit, hydrated]);

  const save = useMutation({
    mutationFn: (payload: ProductWritable) =>
      isEdit
        ? HerderAPI.my.products.update(id as string, payload)
        : HerderAPI.my.products.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['herder', 'my', 'products'] });
      router.back();
    },
    onError: (e: Error) => Alert.alert('Алдаа', e.message),
  });

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!r.canceled) {
      setForm((f) => ({
        ...f,
        images: [...f.images, ...r.assets.map((a) => a.uri)].slice(0, 5),
      }));
    }
  };

  const removeImage = (uri: string) =>
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== uri) }));

  const onSubmit = () => {
    const price = Number(form.price);
    const salePrice = form.salePrice ? Number(form.salePrice) : null;
    const stock = form.stock ? Number(form.stock) : undefined;

    if (!form.name.trim()) return Alert.alert('Алдаа', 'Нэр оруулна уу');
    if (!Number.isFinite(price) || price <= 0)
      return Alert.alert('Алдаа', 'Үнэ 0-ээс их байх ёстой');
    if (salePrice != null && (!Number.isFinite(salePrice) || salePrice >= price))
      return Alert.alert('Алдаа', 'Хямдралтай үнэ нь үндсэн үнээс бага байх ёстой');

    save.mutate({
      name:              form.name.trim(),
      description:       form.description.trim() || undefined,
      price,
      salePrice,
      category:          form.category,
      stock,
      requiresColdChain: form.requiresColdChain,
      images:            form.images,
    });
  };

  if (isEdit && existing.isLoading && !hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.herder} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 140 }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          padding: 16,
          paddingTop: 60,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900' }}>
          {isEdit ? 'Бараа засах' : 'Шинэ бараа'}
        </Text>
      </View>

      <View style={{ padding: 12, gap: 14 }}>
        <Field label="Нэр">
          <TextInput
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="Жишээ: Хонины мах"
            placeholderTextColor={C.textMuted}
            style={inputStyle}
          />
        </Field>

        <Field label="Тайлбар">
          <TextInput
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Бараа болон малын тухай мэдээлэл"
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={3}
            style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
          />
        </Field>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Үнэ (₮)">
              <TextInput
                value={form.price}
                onChangeText={(v) => setForm((f) => ({ ...f, price: v.replace(/\D/g, '') }))}
                placeholder="0"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                style={inputStyle}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Хямдрал (₮)">
              <TextInput
                value={form.salePrice}
                onChangeText={(v) => setForm((f) => ({ ...f, salePrice: v.replace(/\D/g, '') }))}
                placeholder="—"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                style={inputStyle}
              />
            </Field>
          </View>
        </View>

        <Field label="Ангилал">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm((f) => ({ ...f, category: cat }))}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: R.full,
                  backgroundColor: form.category === cat ? C.herder : C.bgCard,
                  borderWidth: 1,
                  borderColor: form.category === cat ? C.herder : C.border,
                }}
              >
                <Text
                  style={{
                    color: form.category === cat ? '#fff' : C.text,
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Нөөц">
          <TextInput
            value={form.stock}
            onChangeText={(v) => setForm((f) => ({ ...f, stock: v.replace(/\D/g, '') }))}
            placeholder="0"
            placeholderTextColor={C.textMuted}
            keyboardType="number-pad"
            style={inputStyle}
          />
        </Field>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: C.bgCard,
            borderRadius: R.lg,
            padding: 14,
            borderWidth: 1,
            borderColor: C.border,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 14 }}>
              ❄ Хүйтэн сүлжээ шаардлагатай
            </Text>
            <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>
              Мах, сүү, бяслаг зэрэг түргэн муудах бараанд
            </Text>
          </View>
          <Switch
            value={form.requiresColdChain}
            onValueChange={(v) => setForm((f) => ({ ...f, requiresColdChain: v }))}
            trackColor={{ false: C.border2, true: C.herder }}
            thumbColor="#fff"
          />
        </View>

        <Field label={`Зураг (${form.images.length}/5)`}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {form.images.map((uri) => (
              <View key={uri} style={{ position: 'relative' }}>
                <Image
                  source={{ uri }}
                  style={{ width: 80, height: 80, borderRadius: R.md, backgroundColor: C.bgSection }}
                />
                <TouchableOpacity
                  onPress={() => removeImage(uri)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: C.error,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {form.images.length < 5 && (
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: R.md,
                  backgroundColor: C.bgSection,
                  borderWidth: 1,
                  borderColor: C.border,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="camera" size={22} color={C.herder} />
                <Text style={{ color: C.herder, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
                  Нэмэх
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Field>
      </View>

      <View style={{ padding: 12, paddingBottom: 32 }}>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={save.isPending}
          style={{
            backgroundColor: save.isPending ? C.textMuted : C.herder,
            borderRadius: R.lg,
            padding: 16,
            alignItems: 'center',
          }}
        >
          {save.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              {isEdit ? 'Хадгалах' : 'Нийтлэх'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: C.bgCard,
  borderRadius: R.lg,
  borderWidth: 1,
  borderColor: C.border,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: C.text,
  fontSize: 15,
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={{ color: C.textSub, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
