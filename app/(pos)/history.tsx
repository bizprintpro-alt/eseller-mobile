import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function POSHistory() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          backgroundColor: '#1E293B',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
          Борлуулалтын түүх
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <Text style={{ fontSize: 40 }}>🖥️</Text>
        <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
          Backend POS route дараа нэмэгдэнэ
        </Text>
        <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center' }}>
          /api/orders/pos/history
        </Text>
      </View>
    </View>
  );
}
