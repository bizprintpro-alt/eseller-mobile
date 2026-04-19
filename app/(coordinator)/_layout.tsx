import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../src/shared/design';
import { useAuth } from '../../src/store/auth';

export default function CoordinatorLayout() {
  const insets = useSafeAreaInsets();
  const { token, role } = useAuth();

  // Deep-link guard: unauth → login, wrong role → buyer tabs.
  // Admin passes through so support can inspect the coordinator UI.
  if (!token) return <Redirect href={'/login' as never} />;
  const backendRole = (useAuth.getState().user?.role || '').toString().toLowerCase();
  if (role !== 'COORDINATOR' && backendRole !== 'admin' && backendRole !== 'superadmin') {
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
        name="applications"
        options={{
          title: 'Өргөдөл',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="herders"
        options={{
          title: 'Малчид',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="application/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
