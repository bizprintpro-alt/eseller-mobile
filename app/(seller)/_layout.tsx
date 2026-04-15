import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Seller (affiliate) navigation group — bottom Tabs with 6 screens.
 */
export default function SellerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1B3A5C',
          borderTopColor: '#2E5F8E',
          borderTopWidth: 0.5,
          height: 60,
        },
        tabBarActiveTintColor: '#E37400',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Самбар',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Каталог',
          tabBarIcon: ({ color }) => <Ionicons name="cube" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Миний',
          tabBarIcon: ({ color }) => <Ionicons name="bag" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Орлого',
          tabBarIcon: ({ color }) => <Ionicons name="cash" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Топ',
          tabBarIcon: ({ color }) => <Ionicons name="trophy" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="influencer"
        options={{
          title: 'Инфлюэнсэр',
          tabBarIcon: ({ color }) => <Ionicons name="megaphone" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
