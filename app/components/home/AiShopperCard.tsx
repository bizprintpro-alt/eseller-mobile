import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { C, R } from '../../../src/shared/design';

export function AiShopperCard() {
  return (
    <TouchableOpacity
      onPress={() => router.push('/(customer)/ai-shopper' as never)}
      activeOpacity={0.85}
      style={{
        marginHorizontal: 12,
        marginBottom: 16,
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 0.5,
        borderColor: C.border,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: '#4F46E522',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#4F46E555',
        }}
      >
        <Text style={{ fontSize: 24 }}>🤖</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '800',
            color: C.text,
            marginBottom: 3,
          }}
        >
          AI худалдан авалтын туслах
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: C.textMuted,
            lineHeight: 14,
          }}
          numberOfLines={1}
        >
          "Надад iPhone 14-тай тохирох кейс олоорой"
        </Text>
      </View>

      <View
        style={{
          backgroundColor: '#4F46E5',
          borderRadius: 9,
          paddingHorizontal: 11,
          paddingVertical: 7,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>Асуух →</Text>
      </View>
    </TouchableOpacity>
  );
}
