import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../../src/shared/design';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{
        flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '700' }}>
          Бараа #{id}
        </Text>
        <Text style={{ color: C.textSub, fontSize: 14, marginTop: 8 }}>
          Тун удахгүй...
        </Text>
      </View>
    </SafeAreaView>
  );
}
