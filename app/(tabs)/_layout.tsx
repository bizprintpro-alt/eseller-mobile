import React from 'react'
import { View, Text } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../src/store/auth'
import { C, roleColor } from '../../src/shared/design'

type TabItem = { title: string; icon: string; iconActive: string }

const TAB_CONFIG: Record<string, Record<string, TabItem>> = {
  BUYER: {
    index:   { title: 'Нүүр',    icon: 'home-outline',   iconActive: 'home' },
    orders:  { title: 'Захиалга', icon: 'bag-outline',    iconActive: 'bag' },
    action:  { title: 'Нэмэх',   icon: 'add',            iconActive: 'add' },
    search:  { title: 'Хайлт',   icon: 'search-outline', iconActive: 'search' },
    profile: { title: 'Би',      icon: 'person-outline', iconActive: 'person' },
  },
  STORE: {
    index:   { title: 'Самбар',    icon: 'grid-outline',       iconActive: 'grid' },
    store:   { title: 'Бараа',     icon: 'cube-outline',       iconActive: 'cube' },
    feed:    { title: 'Захиалга',  icon: 'receipt-outline',    iconActive: 'receipt' },
    chat:    { title: 'Чат',       icon: 'chatbubble-outline', iconActive: 'chatbubble' },
    profile: { title: 'Профайл',   icon: 'person-outline',     iconActive: 'person' },
  },
}

// Every screen file under app/(tabs)/ must be registered here
const ALL_TABS = [
  'index', 'orders', 'action', 'search', 'profile',
  'store', 'feed', 'social', 'chat', 'gold',
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

        // Gold tab (legacy BUYER — no longer in config but keep handler)
        if (name === 'gold') {
          return (
            <Tabs.Screen key={name} name={name} options={{ href: null }} />
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
