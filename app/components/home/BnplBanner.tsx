import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { H } from './tokens';

export function BnplBanner() {
  return (
    <TouchableOpacity
      onPress={() => router.push('/(customer)/bnpl' as never)}
      activeOpacity={0.88}
      style={{
        marginHorizontal: H.mx,
        marginBottom: 14,
        backgroundColor: '#0F172A',
        borderRadius: H.cardRadius,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
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
            marginBottom: 7,
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
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Мэдэх →</Text>
      </View>
    </TouchableOpacity>
  );
}
