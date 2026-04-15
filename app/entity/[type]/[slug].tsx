import { ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

const ENTITY_ICONS: Record<string, string> = {
  REAL_ESTATE: '🏠',
  AUTO: '🚗',
  SERVICE: '⚙️',
  BUILDING: '🏗️',
  DIGITAL: '💻',
  PRE_ORDER: '📦',
};

const ENTITY_LABELS: Record<string, string> = {
  REAL_ESTATE: 'Үл хөдлөх',
  AUTO: 'Авто',
  SERVICE: 'Үйлчилгээ',
  BUILDING: 'Барилга',
  DIGITAL: 'Дижитал',
  PRE_ORDER: 'Урьдчилсан захиалга',
};

export default function EntityDetail() {
  const { type, slug } = useLocalSearchParams<{ type: string; slug: string }>();

  const { data: entity, isLoading } = useQuery<any>({
    queryKey: ['entity', type, slug],
    queryFn: async () => unwrap<any>(await get(`/entities/${type}/${slug}`)),
    enabled: !!type && !!slug,
    retry: false,
  });

  const typeKey = (type ?? '').toUpperCase();
  const icon = ENTITY_ICONS[typeKey] ?? '📋';
  const label = ENTITY_LABELS[typeKey] ?? type ?? '';

  return (
    <>
      <Stack.Screen options={{ title: entity?.title ?? label, headerBackTitle: '' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#121212' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {isLoading && (
          <Text
            style={{
              color: 'rgba(255,255,255,.4)',
              textAlign: 'center',
              marginTop: 60,
              fontSize: 14,
            }}
          >
            Уншиж байна...
          </Text>
        )}

        {entity && (
          <>
            <View
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 16,
                height: 180,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,.07)',
              }}
            >
              <Text style={{ fontSize: 64 }}>{icon}</Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <View
                  style={{
                    backgroundColor: '#1E1B4B',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: '#A5B4FC', fontSize: 10, fontWeight: '700' }}>{label}</Text>
                </View>
                {entity.featured && (
                  <View
                    style={{
                      backgroundColor: '#1C1400',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: '#FDE68A', fontSize: 10, fontWeight: '700' }}>
                      ⭐ Онцлох
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 6 }}>
                {entity.title}
              </Text>
              {entity.price != null && (
                <Text style={{ fontSize: 22, fontWeight: '900', color: '#4F46E5' }}>
                  {Number(entity.price).toLocaleString()}₮
                </Text>
              )}
            </View>

            {entity.description && (
              <View
                style={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 12,
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,.07)',
                }}
              >
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 21 }}>
                  {entity.description}
                </Text>
              </View>
            )}

            {entity.attributes && Object.entries(entity.attributes).length > 0 && (
              <View
                style={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: 14,
                  overflow: 'hidden',
                  marginBottom: 12,
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,.07)',
                }}
              >
                {Object.entries(entity.attributes).map(([k, v], i, arr) => (
                  <View
                    key={k}
                    style={{
                      flexDirection: 'row',
                      padding: 12,
                      borderBottomWidth: i < arr.length - 1 ? 0.5 : 0,
                      borderBottomColor: 'rgba(255,255,255,.06)',
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{k}</Text>
                    <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                      {String(v)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {entity.contactPhone && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${entity.contactPhone}`)}
                style={{
                  backgroundColor: '#4F46E5',
                  borderRadius: 12,
                  padding: 15,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>
                  📞 Холбоо барих
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}
