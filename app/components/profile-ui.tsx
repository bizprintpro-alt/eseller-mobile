import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R } from '../../src/shared/design';

/** Small capitalized section header. */
export function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '600',
        color: C.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginTop: 6,
        marginBottom: 6,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}

/** Card container that groups InfoRow / MenuRow children with dividers. */
export function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        borderWidth: 0.5,
        borderColor: C.border,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

/** Read-only row: emoji/icon + label + value (+ optional copyable hint). */
export function InfoRow({
  icon,
  label,
  value,
  copyable,
}: {
  icon: string;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
      }}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 13, color: C.textSub }}>{label}</Text>
      <Text style={{ fontSize: 13, color: C.text, fontWeight: '600' }}>{value}</Text>
      {copyable && (
        <Text style={{ fontSize: 11, color: C.brand, marginLeft: 4 }}>Хуулах</Text>
      )}
    </View>
  );
}

/** Tappable row with chevron. */
export function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
      }}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: '500' }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
    </TouchableOpacity>
  );
}

/** Social account link row — "Нэмэх →" action hint. */
export function SocialRow({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
      }}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 13, color: C.text }}>{label}</Text>
      <Text style={{ fontSize: 12, color: C.brand, fontWeight: '600' }}>Нэмэх →</Text>
    </TouchableOpacity>
  );
}

/** Centered avatar + name block shown at the top of every profile screen. */
export function ProfileHeader({
  icon,
  name,
  sub,
  roleLabel,
  color,
}: {
  icon: string;
  name: string;
  sub?: string;
  roleLabel: string;
  color: string;
}) {
  return (
    <View
      style={{
        backgroundColor: color,
        padding: 20,
        paddingTop: 52,
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 32 }}>{icon}</Text>
      </View>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{name}</Text>
      {!!sub && (
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{sub}</Text>
      )}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: R.full,
          paddingHorizontal: 12,
          paddingVertical: 4,
          marginTop: 2,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
          {roleLabel}
        </Text>
      </View>
    </View>
  );
}
