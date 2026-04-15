import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Driver navigation group — bottom Tabs.
 * Only registers screens that actually exist in this folder
 * (deliveries.tsx + earnings.tsx).
 */
export default function DriverLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F2238',
          borderTopColor: '#1B3A5C',
          borderTopWidth: 0.5,
          height: 60,
        },
        tabBarActiveTintColor: '#27AE60',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Хүргэлт',
          tabBarIcon: ({ color }) => <Ionicons name="car" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Орлого',
          tabBarIcon: ({ color }) => <Ionicons name="cash" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
