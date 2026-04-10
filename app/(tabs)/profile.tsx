import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, R, roleColor } from '../../src/shared/design';
import { useAuth } from '../../src/store/auth';

export default function ProfileScreen() {
  const { user, role, setRole, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Гарах', 'Та гарахдаа итгэлтэй байна уу?', [
      { text: 'Болих', style: 'cancel' },
      { text: 'Гарах', style: 'destructive', onPress: logout },
    ]);
  };

  const color = roleColor(role);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>
          Профайл
        </Text>

        {/* Avatar */}
        <View style={{
          alignItems: 'center', marginTop: 32,
        }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: color + '20',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: color,
          }}>
            <Text style={{ fontSize: 32, color: color, fontWeight: '800' }}>
              {user?.name?.[0] || '?'}
            </Text>
          </View>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginTop: 12 }}>
            {user?.name || 'Зочин'}
          </Text>
          <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
            {user?.email || 'Нэвтрээгүй'}
          </Text>
        </View>

        {/* Role badge */}
        <View style={{
          alignSelf: 'center', marginTop: 16,
          backgroundColor: color + '20', borderRadius: R.full,
          paddingHorizontal: 16, paddingVertical: 8,
          borderWidth: 1, borderColor: color + '40',
        }}>
          <Text style={{ color, fontSize: 13, fontWeight: '700' }}>
            {role}
          </Text>
        </View>

        {/* Actions */}
        {user && (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: C.error + '15', borderRadius: R.lg,
              padding: 16, alignItems: 'center', marginTop: 40,
              borderWidth: 1, borderColor: C.error + '30',
            }}
          >
            <Text style={{ color: C.error, fontWeight: '700' }}>
              Гарах
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
