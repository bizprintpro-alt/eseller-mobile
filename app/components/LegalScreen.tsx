import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { C, R } from '../../src/shared/design';

interface Section {
  title: string;
  body: string;
}

interface Props {
  title: string;
  updated: string;
  sections: Section[];
}

/** Shared container for Privacy Policy + Terms of Service screens. */
export function LegalScreen({ title, updated, sections }: Props) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: 40, paddingBottom: 60 }}
    >
      <Text style={{ fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 20 }}>
        Шинэчлэгдсэн: {updated}
      </Text>

      {sections.map((s, i) => (
        <View
          key={i}
          style={{
            backgroundColor: C.bgCard,
            borderRadius: R.lg,
            padding: 16,
            marginBottom: 12,
            borderWidth: 0.5,
            borderColor: C.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '800',
              color: C.text,
              marginBottom: 8,
            }}
          >
            {s.title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: C.textSub,
              lineHeight: 20,
            }}
          >
            {s.body}
          </Text>
        </View>
      ))}

      <Text style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', marginTop: 16 }}>
        © 2024–2026 eSeller LLC
      </Text>
    </ScrollView>
  );
}
