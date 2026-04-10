import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../src/shared/design';

export default function StoreScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{
        flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <Ionicons name="storefront" size={48} color={C.store} />
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '700', marginTop: 16 }}>
          Дэлгүүр
        </Text>
        <Text style={{ color: C.textSub, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
          Тун удахгүй...
        </Text>
      </View>
    </SafeAreaView>
  );
}
