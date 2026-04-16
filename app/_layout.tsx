import React, {
  useState, useEffect, useRef
} from 'react'
import { Stack, router }     from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Updates  from 'expo-updates'
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
import { routeByRole } from '../src/shared/routing'
import {
  registerPushToken,
  resolveNotificationRoute,
} from '../src/lib/notifications'
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
  const hasAutoRouted = useRef(false)

  // OTA update шалгах
  useEffect(() => {
    async function checkUpdates() {
      try {
        if (__DEV__) return
        const update = await Updates.checkForUpdateAsync()
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync()
          await Updates.reloadAsync()
        }
      } catch {}
    }
    checkUpdates()
  }, [])

  useEffect(() => {
    AsyncStorage.getItem('onboarded')
      .then(v => {
        if (!v) setOnboarding(true)
      })
      .catch(() => {})
  }, [])

  // Push token бүртгэх + foreground/tap listeners (нэвтэрсэн үед)
  useEffect(() => {
    if (!user) return

    registerPushToken()

    const receivedSub = Notifications.addNotificationReceivedListener((n) => {
      console.log('[Push]', n.request.content.title, n.request.content.body)
    })
    const responseSub = Notifications.addNotificationResponseReceivedListener((r) => {
      const route = resolveNotificationRoute(r)
      try {
        router.push(route as never)
      } catch (e) {
        console.warn('[Push] route error:', e)
      }
    })

    return () => {
      receivedSub.remove()
      responseSub.remove()
    }
  }, [user])

  // Auto-route DRIVER/SELLER to their own navigation group on cold start.
  // BUYER + STORE keep the default (tabs) entry so role-branching / legacy
  // screens continue to work for them.
  useEffect(() => {
    if (showSplash || showOnboarding) return
    if (!user) return
    if (hasAutoRouted.current) return

    const role = (user.role ?? '').toLowerCase()
    if (['delivery', 'driver', 'affiliate', 'seller', 'store', 'owner'].includes(role)) {
      hasAutoRouted.current = true
      routeByRole(role)
    }
  }, [user, showSplash, showOnboarding])

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
      <Stack.Screen name="(pos)" options={{ headerShown: false, animation: 'fade' }} />
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
      <Stack.Screen
        name="feed/create"
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen name="storefront/[slug]" />
      {/* Customer screens */}
      <Stack.Screen name="(customer)/flash-sale" options={{ headerShown: true, title: 'Flash Sale 🔥' }} />
      <Stack.Screen name="(customer)/wallet" options={{ headerShown: true, title: 'Хэтэвч' }} />
      <Stack.Screen name="(customer)/addresses" options={{ headerShown: true, title: 'Хаяг' }} />
      <Stack.Screen name="(customer)/returns" options={{ headerShown: true, title: 'Буцаалт' }} />
      <Stack.Screen name="(customer)/coupons" options={{ headerShown: true, title: 'Купон' }} />
      <Stack.Screen name="(customer)/edit-profile" options={{ headerShown: true, title: 'Профайл засах' }} />
      <Stack.Screen name="(customer)/notification-settings" options={{ headerShown: true, title: 'Мэдэгдэл' }} />
      <Stack.Screen name="(customer)/help" options={{ headerShown: true, title: 'Тусламж' }} />
      <Stack.Screen name="(customer)/register-shop" options={{ headerShown: true, title: 'Дэлгүүр нээх' }} />
      <Stack.Screen name="(customer)/tier-details" options={{ headerShown: true, title: 'Түвшин' }} />
      <Stack.Screen name="(customer)/security" options={{ headerShown: true, title: 'Аюулгүй байдал' }} />
      <Stack.Screen name="(customer)/about" options={{ headerShown: true, title: 'Тухай' }} />
      <Stack.Screen name="(customer)/contact" options={{ headerShown: true, title: 'Холбоо барих' }} />
      <Stack.Screen name="(customer)/legal/privacy" options={{ headerShown: true, title: 'Нууцлалын бодлого' }} />
      <Stack.Screen name="(customer)/legal/terms" options={{ headerShown: true, title: 'Үйлчилгээний нөхцөл' }} />
      <Stack.Screen name="receipt/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="review/[orderId]" options={{ headerShown: false }} />
      {/* Seller + Driver groups now have their own Tabs layout */}
      <Stack.Screen name="(seller)" options={{ headerShown: false }} />
      <Stack.Screen name="(driver)" options={{ headerShown: false }} />
      <Stack.Screen name="(seller)/influencer" options={{ headerShown: true, title: 'Инфлюэнсер' }} />
      <Stack.Screen name="feed/[id]" options={{ headerShown: true, title: 'Зарын дэлгэрэнгүй' }} />
      <Stack.Screen name="(customer)/wishlist" options={{ headerShown: true, title: 'Хадгалсан' }} />
      <Stack.Screen name="chat/ai-support" options={{ headerShown: true, title: 'AI Туслах' }} />
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
