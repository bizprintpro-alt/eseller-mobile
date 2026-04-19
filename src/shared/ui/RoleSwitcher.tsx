import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth, type AppRole } from '../../store/auth';
import { C, R, roleColor } from '../design';

// Test account phone numbers — role switcher is only visible for these
const TEST_PHONES = ['99000001', '99000002', '99000003', '99000004'];
const isTestUser = (phone?: string | null) =>
  !!phone && TEST_PHONES.includes(phone);

const ROLES = [
  { key: 'BUYER',  icon: 'cart',       label: 'Худалдан авагч', desc: 'Бараа авах, захиалах',     color: C.buyer },
  { key: 'STORE',  icon: 'storefront', label: 'Дэлгүүр эзэн',  desc: 'Дэлгүүр удирдах',          color: C.store },
  { key: 'SELLER', icon: 'megaphone',  label: 'Борлуулагч',     desc: 'Share хийж комисс авах',    color: C.seller },
  { key: 'DRIVER', icon: 'car',        label: 'Жолооч',         desc: 'Хүргэлт хийх',             color: C.driver },
] as const;

// Inline badge — header дотор ашиглах
export function RoleBadge() {
  const { role, user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  // Show only for test accounts or in dev builds — avoid confusing real users
  if (!__DEV__ && !isTestUser(user.phone)) return null;

  const current = ROLES.find((r) => r.key === role);
  const color = roleColor(role);

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
        style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: color + '18', borderRadius: R.full,
          paddingHorizontal: 10, paddingVertical: 5, gap: 4,
          borderWidth: 1, borderColor: color + '40',
        }}
      >
        <Ionicons name={current?.icon as any} size={12} color={color} />
        <Text style={{ color, fontSize: 10, fontWeight: '700' }}>
          {current?.label}
        </Text>
        <Ionicons name="chevron-down" size={10} color={color} />
      </TouchableOpacity>

      <RoleModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// Floating badge — хуучин хувилбар (хэрэгтэй бол)
export function RoleSwitcher() {
  const { role, user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  if (!__DEV__ && !isTestUser(user.phone)) return null;

  const current = ROLES.find((r) => r.key === role);
  const color = roleColor(role);

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
        style={{
          position: 'absolute', bottom: 90, left: 16, zIndex: 100,
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: color + '18', borderRadius: R.full,
          paddingHorizontal: 12, paddingVertical: 7, gap: 6,
          borderWidth: 1, borderColor: color + '40',
        }}
      >
        <Ionicons name={current?.icon as any} size={13} color={color} />
        <Text style={{ color, fontSize: 11, fontWeight: '700' }}>
          {current?.label}
        </Text>
        <Ionicons name="chevron-down" size={11} color={color} />
      </TouchableOpacity>

      <RoleModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// Shared modal
function RoleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, setRole } = useAuth();

  const handleSelect = (key: AppRole) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(key);
    onClose();

    // Cross-group navigation: STORE owners live in /(owner),
    // everyone else (BUYER/SELLER/DRIVER) renders inside /(tabs)
    // where the role-based tab bar + lazy-loaded screens do the work.
    if (key === 'STORE') {
      router.replace('/(owner)/dashboard' as never);
    } else {
      router.replace('/(tabs)' as never);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={{
        backgroundColor: C.bgCard,
        borderTopLeftRadius: R.xxl, borderTopRightRadius: R.xxl,
        padding: 24, paddingBottom: 48,
        borderTopWidth: 1, borderTopColor: C.border,
      }}>
        <View style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: C.border, alignSelf: 'center', marginBottom: 20,
        }} />
        <Text style={{ color: C.text, fontSize: 19, fontWeight: '800', marginBottom: 16 }}>
          Роль сонгох
        </Text>
        <View style={{ gap: 10 }}>
          {ROLES.map((r) => {
            const active = role === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                onPress={() => handleSelect(r.key)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: active ? r.color + '15' : C.bgSection,
                  borderRadius: R.lg, padding: 16, gap: 14,
                  borderWidth: active ? 1.5 : 1,
                  borderColor: active ? r.color : C.border,
                }}
              >
                <View style={{
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: r.color + '18',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={r.icon as any} size={24} color={r.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>{r.label}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{r.desc}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color={r.color} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
