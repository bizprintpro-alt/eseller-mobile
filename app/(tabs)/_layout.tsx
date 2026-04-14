import React from 'react'
import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../src/store/auth'
import { C, roleColor } from '../../src/shared/design'

// Role бүрт tab title + icon тохиргоо
const TAB_CONFIG: Record<string, Record<string, { title: string; icon: string; iconActive: string }>> = {
  BUYER: {
    index:   { title: 'Нүүр',    icon: 'home-outline',       iconActive: 'home' },
    store:   { title: 'Дэлгүүр', icon: 'storefront-outline', iconActive: 'storefront' },
    feed:    { title: 'Зар',     icon: 'pricetag-outline',   iconActive: 'pricetag' },
    social:  { title: 'Найзууд', icon: 'people-outline',     iconActive: 'people' },
    chat:    { title: 'Чат',     icon: 'chatbubble-outline', iconActive: 'chatbubble' },
    profile: { title: 'Профайл', icon: 'person-outline',     iconActive: 'person' },
    gold:    { title: 'Gold',    icon: 'star-outline',       iconActive: 'star' },
  },
  STORE: {
    index:   { title: 'Самбар',    icon: 'grid-outline',       iconActive: 'grid' },
    store:   { title: 'Бараа',     icon: 'cube-outline',       iconActive: 'cube' },
    feed:    { title: 'Захиалга',  icon: 'receipt-outline',    iconActive: 'receipt' },
    chat:    { title: 'Чат',       icon: 'chatbubble-outline', iconActive: 'chatbubble' },
    profile: { title: 'Профайл',   icon: 'person-outline',     iconActive: 'person' },
  },
  SELLER: {
    index:   { title: 'Бараа',   icon: 'bag-outline',         iconActive: 'bag' },
    store:   { title: 'Комисс',  icon: 'trending-up-outline', iconActive: 'trending-up' },
    feed:    { title: 'Линк',    icon: 'link-outline',        iconActive: 'link' },
    chat:    { title: 'Таталт',  icon: 'wallet-outline',      iconActive: 'wallet' },
    profile: { title: 'Профайл', icon: 'person-outline',      iconActive: 'person' },
  },
  DRIVER: {
    index:   { title: 'Хүргэлт',  icon: 'car-outline',       iconActive: 'car' },
    store:   { title: 'Маршрут',   icon: 'navigate-outline',  iconActive: 'navigate' },
    feed:    { title: 'Баталгаа',  icon: 'camera-outline',    iconActive: 'camera' },
    chat:    { title: 'Орлого',    icon: 'cash-outline',      iconActive: 'cash' },
    profile: { title: 'Профайл',   icon: 'person-outline',    iconActive: 'person' },
  },
}

// Бүх tab screen-ийн нэр (static)
const ALL_TABS = ['index', 'store', 'feed', 'social', 'chat', 'profile', 'gold'] as const

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

        // Gold tab-д тусгай icon
        if (name === 'gold') {
          return (
            <Tabs.Screen
              key={name}
              name={name}
              options={{
                title: 'Gold',
                tabBarActiveTintColor: '#F9A825',
                tabBarIcon: ({ focused }: { focused: boolean }) => (
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: focused ? '#F9A825' : 'transparent',
                    borderWidth: focused ? 0 : 1.5,
                    borderColor: '#F9A825',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons
                      name={focused ? 'star' : 'star-outline'}
                      size={14}
                      color={focused ? '#000' : '#F9A825'}
                    />
                  </View>
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
