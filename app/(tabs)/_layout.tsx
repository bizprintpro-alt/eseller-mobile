import React from 'react'
import { View, Text } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../src/store/auth'
import { C, roleColor } from '../../src/shared/design'

type TabItem = { title: string; icon: string; iconActive: string }

// `/(tabs)` is the BUYER root only. STORE / SELLER / DRIVER routes are
// routed to their own group layouts via routeByRole() in src/shared/routing.ts
// (e.g. STORE → /(owner)/dashboard) and never land here, so this layout
// configures only the BUYER tab bar. Hidden screens (store, gold, feed,
// chat, social, notifications) remain reachable via router.push from
// home/cart/push-notification deep-links — see app/(tabs)/index.tsx and
// src/lib/notifications.ts.
const TAB_CONFIG: Record<string, Record<string, TabItem>> = {
  BUYER: {
    index:   { title: 'Нүүр',    icon: 'home-outline',   iconActive: 'home' },
    orders:  { title: 'Захиалга', icon: 'bag-outline',    iconActive: 'bag' },
    action:  { title: 'Нэмэх',   icon: 'add',            iconActive: 'add' },
    search:  { title: 'Хайлт',   icon: 'search-outline', iconActive: 'search' },
    profile: { title: 'Би',      icon: 'person-outline', iconActive: 'person' },
  },
}

// Every screen file under app/(tabs)/ must be registered here. Names not
// present in TAB_CONFIG[role] render as hidden routes (`href: null`) so
// expo-router doesn't auto-add them to the tab bar with the raw filename
// as label (which is what produced the "notificatio..." truncation).
const ALL_TABS = [
  'index', 'orders', 'action', 'search', 'profile',
  'store', 'feed', 'social', 'chat', 'gold', 'notifications',
] as const

export default function TabsLayout() {
  const { role } = useAuth()
  const color = roleColor(role)
  const config = TAB_CONFIG[role] || TAB_CONFIG.BUYER
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopColor: C.border,
          borderTopWidth: 0.5,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 2,
          paddingTop: 6,
          position: 'absolute',
        },
        tabBarActiveTintColor: color,
        tabBarInactiveTintColor: '#616161',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      {ALL_TABS.map(name => {
        const tabConfig = config[name]

        // Tab энэ role-д байхгүй бол нуух
        if (!tabConfig) {
          return (
            <Tabs.Screen
              key={name}
              name={name}
              options={{ href: null }}
            />
          )
        }

        // Center [+] CTA (action tab in BUYER)
        if (name === 'action') {
          return (
            <Tabs.Screen
              key={name}
              name={name}
              options={{
                title: tabConfig.title,
                tabBarIcon: () => (
                  <View style={{
                    width: 54, height: 54, borderRadius: 27,
                    backgroundColor: color,
                    alignItems: 'center', justifyContent: 'center',
                    marginTop: -16,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    elevation: 8,
                  }}>
                    <Ionicons name="add" size={26} color="#fff" />
                  </View>
                ),
                tabBarLabel: () => (
                  <Text style={{
                    fontSize: 10, color,
                    fontWeight: '700', marginTop: 2,
                  }}>
                    {tabConfig.title}
                  </Text>
                ),
              }}
            />
          )
        }

        // Ердийн tab
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: tabConfig.title,
              tabBarIcon: ({ focused, color: c }: { focused: boolean; color: string }) => (
                <Ionicons
                  name={(focused ? tabConfig.iconActive : tabConfig.icon) as any}
                  size={22}
                  color={c}
                />
              ),
            }}
          />
        )
      })}
    </Tabs>
  )
}
