import React, {
  useState, useEffect
} from 'react'
import { Stack }     from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider }
  from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider }
  from '@tanstack/react-query'
import { GestureHandlerRootView }
  from 'react-native-gesture-handler'
import AsyncStorage
  from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { useAuth }  from '../src/store/auth'
import { C }        from '../src/shared/design'
import SplashScreen
  from '../src/shared/ui/SplashScreen'
import OnboardingScreen
  from '../src/shared/ui/OnboardingScreen'
import { ErrorBoundary }
  from '../src/shared/ui/ErrorBoundary'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:                2,
      staleTime:            1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const [showSplash,     setSplash]      =
    useState(true)
  const [showOnboarding, setOnboarding]  =
    useState(false)
  const { user } = useAuth()

  useEffect(() => {
    AsyncStorage.getItem('onboarded')
      .then(v => {
        if (!v) setOnboarding(true)
      })
      .catch(() => {})
  }, [])

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(
        'onboarded', 'true'
      )
    } catch {}
    setOnboarding(false)
  }

  // 1. Splash
  if (showSplash) {
    return (
      <SplashScreen
        onDone={() => setSplash(false)}
      />
    )
  }

  // 2. Onboarding
  if (showOnboarding && !user) {
    return (
      <OnboardingScreen
        onDone={finishOnboarding}
      />
    )
  }

  // 3. Main app
  return (
    <Stack
      screenOptions={{
        headerShown:  false,
        contentStyle: { backgroundColor: C.bg },
        animation:    'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="product/[id]"
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="orders" />
      <Stack.Screen
        name="chat/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="search" />
      <Stack.Screen name="track/[code]" />
      <Stack.Screen name="storefront/[slug]" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <StatusBar style="light" />
            <AppContent />
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
