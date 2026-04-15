import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';

interface LogoutButtonProps {
  variant?: 'full' | 'menu-item' | 'icon';
}

export function LogoutButton({ variant = 'full' }: LogoutButtonProps) {
  const { logout } = useAuth();

  function handleLogout() {
    Alert.alert('Гарах', 'Аккаунтаас гарах уу?', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Гарах',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as never);
        },
      },
    ]);
  }

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(231,76,60,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="log-out-outline" size={18} color="#E74C3C" />
      </TouchableOpacity>
    );
  }

  if (variant === 'menu-item') {
    return (
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
        <Text style={{ fontSize: 15, color: '#E74C3C', fontWeight: '600' }}>
          Гарах
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 16,
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#E74C3C',
      }}
    >
      <Ionicons name="log-out-outline" size={18} color="#E74C3C" />
      <Text style={{ color: '#E74C3C', fontSize: 15, fontWeight: '700' }}>
        Системээс гарах
      </Text>
    </TouchableOpacity>
  );
}
