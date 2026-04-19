import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../src/shared/design';
import { useAuth } from '../../src/store/auth';

export default function HerderLayout() {
  const insets = useSafeAreaInsets();
  const { token, role } = useAuth();

  // Deep-link guard: unauth → login, wrong role → buyer tabs.
  // Admin passes through so support can inspect the herder UI.
  if (!token) return <Redirect href={'/login' as never} />;
  const backendRole = (useAuth.getState().user?.role || '').toString().toLowerCase();
  if (role !== 'HERDER' && backendRole !== 'admin' && backendRole !== 'superadmin') {
    return <Redirect href={'/(tabs)' as never} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bgCard,
          borderTopColor: C.border,
          borderTopWidth: 0.5,
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: C.herder,
        tabBarInactiveTintColor: C.textMuted,
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
        name="listings"
        options={{
          title: 'Бүтээгдэхүүн',
          tabBarIcon: ({ color }) => <Ionicons name="leaf" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Захиалга',
          tabBarIcon: ({ color }) => <Ionicons name="receipt" size={22} color={color} />,
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
        name="listing-form"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="order/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
