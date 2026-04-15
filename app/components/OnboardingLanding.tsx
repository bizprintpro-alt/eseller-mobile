import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';

export interface OnboardingStep {
  icon: string;
  title: string;
  desc: string;
}

export interface OnboardingConfig {
  title: string;
  subtitle: string;
  color: string;
  darkColor: string;
  icon: string;
  steps: OnboardingStep[];
  cta: string;
  ctaRoute: string;
  stats: { label: string; value: string }[];
}

export function OnboardingLanding({ config }: { config: OnboardingConfig }) {
  return (
    <>
      <Stack.Screen options={{ title: config.title, headerBackTitle: '' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#121212' }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View
          style={{
            backgroundColor: config.darkColor,
            padding: 28,
            alignItems: 'center',
            paddingTop: 40,
          }}
        >
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: config.color,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 40 }}>{config.icon}</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 6 }}>
            {config.title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,.65)',
              textAlign: 'center',
              paddingHorizontal: 20,
            }}
          >
            {config.subtitle}
          </Text>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 12 }}>
            Хэрхэн эхлэх вэ?
          </Text>
          <View style={{ gap: 10, marginBottom: 20 }}>
            {config.steps.map((s, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#1E1E1E',
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,.07)',
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: config.darkColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{s.title}</Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>
                    {s.desc}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '900', color: config.color }}>
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {config.stats.map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: '#1E1E1E',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,.07)',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '900', color: config.color }}>
                  {s.value}
                </Text>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push(config.ctaRoute as any)}
            style={{
              backgroundColor: config.color,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>{config.cta}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
