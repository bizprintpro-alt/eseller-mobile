import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { C, R, F } from '../design';

export interface ErrorStateProps {
  /** Primary line. Default — "Алдаа гарлаа". */
  title?: string;
  /** Optional secondary line — usually a hint about what to do next. */
  subtitle?: string;
  /** Called when the user taps "Дахин оролдох". When omitted, the retry
   *  button is hidden — use that for terminal errors where retry is not
   *  meaningful (e.g. permission denied). */
  onRetry?: () => void;
  /** Override the default vertical padding for compact rows inside cards. */
  compact?: boolean;
}

/**
 * Canonical error state shown when a fetch/operation failed. Centered
 * icon + title + optional retry. Use this instead of inline "Алдаа" rows
 * so the visual treatment is consistent across roles.
 */
export function ErrorState({ title, subtitle, onRetry, compact }: ErrorStateProps) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: compact ? R.xl : R.xxxl, paddingHorizontal: R.lg }}>
      <Text style={{ fontSize: 40, marginBottom: R.sm }}>⚠️</Text>
      <Text style={{ ...F.body, color: C.error, textAlign: 'center', fontWeight: '700' }}>
        {title ?? 'Алдаа гарлаа'}
      </Text>
      {subtitle ? (
        <Text style={{ ...F.small, color: C.textMuted, textAlign: 'center', marginTop: R.xs }}>
          {subtitle}
        </Text>
      ) : null}
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.85}
          style={{
            marginTop: R.lg,
            paddingVertical: R.sm,
            paddingHorizontal: R.lg,
            backgroundColor: C.error,
            borderRadius: R.full,
          }}
        >
          <Text style={{ ...F.small, color: C.white, fontWeight: '700' }}>Дахин оролдох</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
