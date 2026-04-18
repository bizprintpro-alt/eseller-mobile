import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { H } from './tokens';

interface Props {
  title: string;
  icon?: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  onMore?: () => void;
  moreColor?: string;
}

/**
 * Section header sits on the dark root bg (not inside a card), so
 * title + badge use white / rgba-white colors. Card-internal labels
 * use H.textPrimary on white.
 */
export function SectionHeader({
  title,
  icon,
  badge,
  badgeBg,
  badgeColor,
  onMore,
  moreColor = '#A5B4FC',
}: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: H.mx,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        {!!icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
        <Text
          style={{
            fontSize: 15,
            fontWeight: '800',
            color: '#FFFFFF',
          }}
        >
          {title}
        </Text>
        {!!badge && (
          <View
            style={{
              backgroundColor: badgeBg ?? 'rgba(255,255,255,0.12)',
              borderRadius: 99,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: '800',
                color: badgeColor ?? '#FFFFFF',
                letterSpacing: 0.3,
              }}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>
      {onMore && (
        <TouchableOpacity
          onPress={onMore}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: moreColor }}>
            Бүгд →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
