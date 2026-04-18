import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Light theme colors for profile screens
export const PC = {
  bg: '#F5F6FA',
  card: '#FFFFFF',
  border: 'rgba(0,0,0,0.06)',
  text: '#1A1A2E',
  textSub: '#5A6472',
  textMuted: '#9AA3B2',
  divider: 'rgba(0,0,0,0.05)',
};

/** Gradient hero header for profile screens. */
export function ProfileHeader({
  gradient,
  icon,
  name,
  sub,
  roleLabel,
  extra,
}: {
  gradient: [string, string, ...string[]];
  icon: string;
  name: string;
  sub?: string;
  roleLabel: string;
  extra?: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: 52,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.35)',
        }}
      >
        <Text style={{ fontSize: 36 }}>{icon}</Text>
      </View>
      <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800' }}>{name}</Text>
      {!!sub && (
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{sub}</Text>
      )}
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 99,
          paddingHorizontal: 14,
          paddingVertical: 5,
          marginTop: 2,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
          {roleLabel}
        </Text>
      </View>
      {extra}
    </LinearGradient>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: PC.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 12,
        marginBottom: 8,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: PC.card,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: PC.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

export function InfoRow({
  icon,
  label,
  value,
  accent,
  onCopy,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: string;
  onCopy?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: PC.divider,
      }}
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 13, color: PC.textSub }}>{label}</Text>
      <Text
        style={{
          fontSize: 13,
          color: accent ?? PC.text,
          fontWeight: '700',
          maxWidth: 180,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      {onCopy && (
        <TouchableOpacity onPress={onCopy} hitSlop={8}>
          <Ionicons name="copy-outline" size={16} color="#7C3AED" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function MenuRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: PC.divider,
      }}
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color: danger ? '#E74C3C' : PC.text,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={PC.textMuted} />
    </TouchableOpacity>
  );
}

export function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '47%',
        backgroundColor: PC.card,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: PC.border,
        padding: 14,
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: PC.textMuted }}>{label}</Text>
    </View>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: 'ok' | 'pending' | 'missing';
  label: string;
}) {
  const palette = {
    ok: { bg: '#D1FAE5', fg: '#065F46', icon: '✓' },
    pending: { bg: '#FEF3C7', fg: '#92400E', icon: '⏳' },
    missing: { bg: '#FEE2E2', fg: '#991B1B', icon: '✕' },
  }[status];
  return (
    <View
      style={{
        backgroundColor: palette.bg,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 11 }}>{palette.icon}</Text>
      <Text style={{ fontSize: 11, color: palette.fg, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}
