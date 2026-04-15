import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../store/auth';
import { C, R } from '../design';

const ROLES = [
  { key: 'BUYER',  icon: '🛍️', label: 'Авагч',      color: C.buyer,  route: '/(tabs)'              },
  { key: 'STORE',  icon: '🏪', label: 'Дэлгүүр',    color: C.store,  route: '/(owner)/dashboard'   },
  { key: 'SELLER', icon: '📢', label: 'Борлуулагч', color: C.seller, route: '/(seller)/dashboard'  },
  { key: 'DRIVER', icon: '🚚', label: 'Жолооч',     color: C.driver, route: '/(driver)/deliveries' },
] as const;

/**
 * Horizontal 4-pill role switcher shown at the top of each role's home
 * screen. Tap → setRole + router.replace to that group's root.
 */
export function RoleSwitcherBar() {
  const { role, setRole, user } = useAuth();
  if (!user) return null;

  function handleSelect(r: (typeof ROLES)[number]) {
    if (role === r.key) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRole(r.key);
    router.replace(r.route as never);
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: C.bgCard,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
      }}
    >
      {ROLES.map((r) => {
        const active = role === r.key;
        return (
          <TouchableOpacity
            key={r.key}
            onPress={() => handleSelect(r)}
            activeOpacity={0.75}
            style={{
              flex: 1,
              backgroundColor: active ? r.color : C.bgSection,
              borderWidth: 1,
              borderColor: active ? r.color : C.border,
              borderRadius: R.full,
              paddingVertical: 8,
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Text style={{ fontSize: 16 }}>{r.icon}</Text>
            <Text
              style={{
                color: active ? '#fff' : C.textSub,
                fontSize: 10,
                fontWeight: '700',
              }}
            >
              {r.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
