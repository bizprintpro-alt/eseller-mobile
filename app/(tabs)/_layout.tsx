import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/store/auth';
import { C, roleColor } from '../../src/shared/design';

const ROLE_TABS: Record<string, { name: string; title: string; icon: string; iconActive: string }[]> = {
  BUYER: [
    { name: 'index',   title: 'Нүүр',    icon: 'home-outline',       iconActive: 'home' },
    { name: 'store',   title: 'Дэлгүүр', icon: 'storefront-outline', iconActive: 'storefront' },
    { name: 'feed',    title: 'Зар',      icon: 'pricetag-outline',   iconActive: 'pricetag' },
    { name: 'chat',    title: 'Чат',      icon: 'chatbubble-outline', iconActive: 'chatbubble' },
    { name: 'profile', title: 'Профайл', icon: 'person-outline',     iconActive: 'person' },
  ],
  STORE: [
    { name: 'index',   title: 'Самбар',     icon: 'grid-outline',        iconActive: 'grid' },
    { name: 'store',   title: 'Бараа',      icon: 'cube-outline',        iconActive: 'cube' },
    { name: 'feed',    title: 'Захиалга',   icon: 'receipt-outline',     iconActive: 'receipt' },
    { name: 'chat',    title: 'Чат',        icon: 'chatbubble-outline',  iconActive: 'chatbubble' },
    { name: 'profile', title: 'Профайл',   icon: 'person-outline',      iconActive: 'person' },
  ],
  SELLER: [
    { name: 'index',   title: 'Бараа',   icon: 'bag-outline',          iconActive: 'bag' },
    { name: 'store',   title: 'Комисс',  icon: 'trending-up-outline',  iconActive: 'trending-up' },
    { name: 'feed',    title: 'Линк',    icon: 'link-outline',         iconActive: 'link' },
    { name: 'chat',    title: 'Таталт',  icon: 'wallet-outline',       iconActive: 'wallet' },
    { name: 'profile', title: 'Профайл', icon: 'person-outline',       iconActive: 'person' },
  ],
  DRIVER: [
    { name: 'index',   title: 'Хүргэлт',  icon: 'car-outline',        iconActive: 'car' },
    { name: 'store',   title: 'Маршрут',   icon: 'navigate-outline',   iconActive: 'navigate' },
    { name: 'feed',    title: 'Баталгаа',  icon: 'camera-outline',     iconActive: 'camera' },
    { name: 'chat',    title: 'Орлого',    icon: 'cash-outline',       iconActive: 'cash' },
    { name: 'profile', title: 'Профайл',   icon: 'person-outline',     iconActive: 'person' },
  ],
};

export default function TabsLayout() {
  const { role } = useAuth();
  const color = roleColor(role);
  const tabs = ROLE_TABS[role as keyof typeof ROLE_TABS] || ROLE_TABS.BUYER;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = tabs.find((t) => t.name === route.name);
        // Hide tabs not in current role
        if (!tab) return { href: null };

        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0D0D0D',
            borderTopColor: C.border,
            borderTopWidth: 0.5,
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom + 2,
            paddingTop: 6,
            position: 'absolute' as const,
          },
          tabBarActiveTintColor: color,
          tabBarInactiveTintColor: '#616161',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600' as const,
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color: c }: { focused: boolean; color: string }) => (
            <Ionicons
              name={(focused ? tab.iconActive : tab.icon) as any}
              size={22}
              color={c}
            />
          ),
        };
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
      {/* Gold tab — зөвхөн BUYER-д харагдана */}
      <Tabs.Screen
        name="gold"
        options={{
          href: role === 'BUYER' ? undefined : null,
          title: 'Gold',
          tabBarIcon: ({ focused, color: c }) => (
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
          tabBarActiveTintColor: '#F9A825',
        }}
      />
    </Tabs>
  );
}
