import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export function BnplBanner() {
  return (
    <TouchableOpacity
      onPress={() => router.push('/(customer)/bnpl' as never)}
      activeOpacity={0.85}
      style={{
        marginHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: '#1E293B',
      }}
    >
      <Text
        style={{
          position: 'absolute',
          right: 14,
          top: 10,
          fontSize: 56,
          opacity: 0.18,
        }}
      >
        💳
      </Text>

      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: '#3B82F6',
            borderRadius: 5,
            paddingHorizontal: 8,
            paddingVertical: 2,
            alignSelf: 'flex-start',
            marginBottom: 6,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 }}>
            ЗУУРМАГ ТӨЛБӨР · ШИНЭ
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900', lineHeight: 20 }}>
          0% хүүтэй{'\n'}4 хуваан төлөх
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 4 }}>
          Одоо авч, дараа төл
        </Text>
      </View>

      <View
        style={{
          backgroundColor: '#3B82F6',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 9,
          marginLeft: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Мэдэх →</Text>
      </View>
    </TouchableOpacity>
  );
}
