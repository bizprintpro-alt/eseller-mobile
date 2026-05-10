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
import * as Sentry from '@sentry/react-native'

// Sentry init — production-only, guard against missing native module
try {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    enabled: !__DEV__,
    tracesSampleRate: 0.1,
    environment: __DEV__ ? 'development' : 'production',
  })
} catch (e) {
  console.warn('[Sentry] init failed (native module missing — will work after next EAS build):', e)
}
import { useAuth }  from '../src/store/auth'
import { useRemoteConfig } from '../src/config/remoteFlags'
import { routeByRole } from '../src/shared/routing'
import { runSessionGate } from '../src/shared/sessionGate'
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
  // Cold-start session gate. While this runs we keep the splash overlay so
  // there's no flash of public UI between the splash dismissal and the
  // biometric prompt / silent restore. See src/shared/sessionGate.ts.
  const [gateRunning, setGateRunning] = useState(true)
  const [gateBlocked, setGateBlocked] = useState(false)
  const { user } = useAuth()
  const hasAutoRouted = useRef(false)

  // Run the gate exactly once. It reads SecureStore('token'), prompts
  // biometric if enabled, and calls restoreSession on success. While the
  // gate is running we hold the splash so the user never lands on a public
  // tab thinking they were logged out.
  //
  // Two non-authenticated terminal states require bouncing to login:
  //   - biometric-failed: user dismissed the prompt or it errored. Token
  //     was preserved; they can retry from login.
  //   - session-invalid: /auth/me rejected a stored token (terminal) OR a
  //     transient/offline error left state empty. Either way the user has
  //     nothing to operate on and shouldn't see protected UI. The login
  //     screen reads SESSION_INVALIDATED_KEY itself to decide whether to
  //     surface the "session expired" alert (only set on real 401, not on
  //     transient network errors).
  useEffect(() => {
    let cancelled = false
    runSessionGate()
      .then((result) => {
        if (cancelled) return
        if (__DEV__) console.log('[gate] result:', result)
        if (result.status === 'biometric-failed' || result.status === 'session-invalid') {
          setGateBlocked(true)
        }
      })
      .catch((e) => {
        if (__DEV__) console.warn('[gate] unexpected throw:', e)
      })
      .finally(() => {
        if (!cancelled) setGateRunning(false)
      })
    return () => { cancelled = true }
  }, [])

  // If the gate ended in biometric-failed (user dismissed the prompt or it
  // errored), bounce them to the login screen so they have a way out.
  useEffect(() => {
    if (gateRunning) return
    if (!gateBlocked) return
    try { router.replace('/(auth)/login' as never) } catch {}
  }, [gateRunning, gateBlocked])

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

  // Remote config: hydrate from cache synchronously-ish, then fetch.
  // Fires once on mount; refresh() self-throttles via lastFetched.
  useEffect(() => {
    const { hydrate, refresh } = useRemoteConfig.getState()
    hydrate().finally(() => { refresh() })
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
    // Stack navigator mount болсны дараа route хийх
    const timer = setTimeout(() => {
      const role = (user.role ?? '').toLowerCase()
      routeByRole(role)
    }, 100)
    return () => clearTimeout(timer)
  }, [user, showSplash, showOnboarding])

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(
        'onboarded', 'true'
      )
    } catch {}
    setOnboarding(false)
  }

  // 1. Splash. Hold it open while the cold-start session gate is still
  // running so we never flash unauthenticated UI before the biometric
  // prompt or silent restoreSession finishes.
  if (showSplash || gateRunning) {
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
      <Stack.Screen name="(owner)" options={{ headerShown: false }} />
      <Stack.Screen name="(seller)" options={{ headerShown: false }} />
      <Stack.Screen name="(driver)" options={{ headerShown: false }} />
      <Stack.Screen name="(herder)" options={{ headerShown: false }} />
      <Stack.Screen name="(coordinator)" options={{ headerShown: false }} />
      <Stack.Screen name="(seller)/influencer" options={{ headerShown: true, title: 'Инфлюэнсер' }} />
      <Stack.Screen name="feed/[id]" options={{ headerShown: true, title: 'Зарын дэлгэрэнгүй' }} />
      <Stack.Screen name="(customer)/wishlist" options={{ headerShown: true, title: 'Хадгалсан' }} />
      <Stack.Screen name="chat/ai-support" options={{ headerShown: true, title: 'AI Туслах' }} />
    </Stack>
  )
}

function RootLayout() {
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

// Wrap with Sentry if available, otherwise export raw (native module may be missing on OTA-only updates)
let WrappedLayout: typeof RootLayout = RootLayout
try {
  WrappedLayout = Sentry.wrap(RootLayout) as typeof RootLayout
} catch {}

export default WrappedLayout




