import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { C, roleColor } from '../../src/shared/design';

const ROLE_TABS: Record<string, { name: string; title: string; icon: string }[]> = {
  BUYER: [
    { name: 'index',   title: 'Нүүр',    icon: 'home' },
    { name: 'store',   title: 'Дэлгүүр', icon: 'storefront' },
    { name: 'feed',    title: 'Зар',      icon: 'list' },
    { name: 'chat',    title: 'Чат',      icon: 'chatbubbles' },
    { name: 'profile', title: 'Миний',    icon: 'person' },
  ],
  STORE: [
    { name: 'index',   title: 'Самбар',     icon: 'grid' },
    { name: 'store',   title: 'Бараа',      icon: 'cube' },
    { name: 'feed',    title: 'Захиалга',   icon: 'receipt' },
    { name: 'chat',    title: 'Чат',        icon: 'chatbubbles' },
    { name: 'profile', title: 'Профайл',    icon: 'person' },
  ],
  SELLER: [
    { name: 'index',   title: 'Бараа',   icon: 'home' },
    { name: 'store',   title: 'Комисс',  icon: 'bar-chart' },
    { name: 'feed',    title: 'Линк',    icon: 'link' },
    { name: 'chat',    title: 'Чат',      icon: 'chatbubbles' },
    { name: 'profile', title: 'Профайл', icon: 'person' },
  ],
  DRIVER: [
    { name: 'index',   title: 'Захиалга', icon: 'car' },
    { name: 'store',   title: 'Маршрут',  icon: 'map' },
    { name: 'feed',    title: 'Орлого',   icon: 'cash' },
    { name: 'chat',    title: 'Чат',      icon: 'chatbubbles' },
    { name: 'profile', title: 'Профайл',  icon: 'person' },
  ],
};

export default function TabsLayout() {
  const { role } = useAuth();
  const color = roleColor(role);
  const tabs = ROLE_TABS[role] || ROLE_TABS.BUYER;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor:  C.border,
          borderTopWidth:  1,
          height:          60,
          paddingBottom:   8,
          paddingTop:      6,
        },
        tabBarActiveTintColor:   color,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '600',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color: c }) => (
              <Ionicons
                name={(focused ? tab.icon : `${tab.icon}-outline`) as any}
                size={22}
                color={c}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
