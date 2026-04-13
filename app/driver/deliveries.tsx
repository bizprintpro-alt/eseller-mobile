import { useState, useEffect, useRef } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { get, post, put } from '../../src/services/api'
import { C, R } from '../../src/shared/design'

const LOCATION_TASK = 'background-location'
const COUNTDOWN_SECS = 30

// Background GPS task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: any) => {
  if (error) return
  const { locations } = data
  if (locations?.length > 0) {
    const { latitude, longitude } = locations[0].coords
    try { await post('/tracking/location', { lat: latitude, lng: longitude }) } catch {}
  }
})

export default function DriverDeliveriesScreen() {
  const qc = useQueryClient()
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [gpsActive, setGpsActive] = useState(false)

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['driver-orders'],
    queryFn: () => get('/buyer/orders?status=confirmed'),
    refetchInterval: 15000,
  })

  const acceptMutation = useMutation({
    mutationFn: (orderId: string) => post(`/orders/${orderId}/status`, { status: 'delivering' }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      qc.invalidateQueries({ queryKey: ['driver-orders'] })
      startGPS()
    },
  })

  const orders = (data as any)?.orders || (Array.isArray(data) ? data : [])

  // Init countdowns for new orders
  useEffect(() => {
    const initial: Record<string, number> = {}
    orders.forEach((o: any) => {
      const id = o.id || o._id
      if (countdowns[id] === undefined) initial[id] = COUNTDOWN_SECS
    })
    if (Object.keys(initial).length > 0) {
      setCountdowns(prev => ({ ...prev, ...initial }))
    }
  }, [orders])

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdowns(prev => {
        const next = { ...prev }
        let changed = false
        for (const key of Object.keys(next)) {
          if (next[key] > 0) {
            next[key] -= 1
            changed = true
            if (next[key] === 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            }
          }
        }
        return changed ? next : prev
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // Background GPS
  const startGPS = async () => {
    if (gpsActive) return
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const { status: bg } = await Location.requestBackgroundPermissionsAsync()
    if (bg !== 'granted') return
    const running = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK)
    if (!running) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 30,
        foregroundService: {
          notificationTitle: 'eSeller хүргэлт',
          notificationBody: 'Байршил шинэчлэгдэж байна...',
        },
      })
    }
    setGpsActive(true)
  }

  // Filter out expired orders (countdown hit 0)
  const visibleOrders = orders.filter((o: any) => {
    const id = o.id || o._id
    return countdowns[id] === undefined || countdowns[id] > 0
  })

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: C.text, fontSize: 22, fontWeight: '900' }}>Хүргэлтүүд</Text>
          <Text style={{ color: C.textSub, fontSize: 13, marginTop: 2 }}>{visibleOrders.length} захиалга хүлээж байна</Text>
        </View>
        {gpsActive && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.secondaryDim, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Ionicons name="navigate" size={12} color={C.secondary} />
            <Text style={{ color: C.secondary, fontSize: 10, fontWeight: '700' }}>GPS</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={C.brand} style={{ marginTop: 60 }} size="large" />
      ) : (
        <FlatList
          data={visibleOrders}
          keyExtractor={o => o.id || o._id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />}
          renderItem={({ item: o }) => {
            const oid = o.id || o._id
            const secs = countdowns[oid] ?? COUNTDOWN_SECS
            const urgent = secs <= 10
            return (
              <View style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>#{o.orderNumber || o.trackingCode || o.id?.slice(-6)}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Countdown */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: urgent ? C.brand : C.goldDim, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Ionicons name="time" size={12} color={urgent ? C.white : C.gold} />
                      <Text style={{ color: urgent ? C.white : C.gold, fontSize: 13, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                        00:{String(secs).padStart(2, '0')}
                      </Text>
                    </View>
                    <Text style={{ color: C.brand, fontWeight: '800', fontSize: 16 }}>{(o.total || o.totalAmount || 0).toLocaleString()}₮</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Ionicons name="location" size={14} color={C.textSub} />
                  <Text style={{ color: C.textSub, fontSize: 13, flex: 1 }} numberOfLines={2}>{o.deliveryAddress || o.delivery?.address || 'Хаяг'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Ionicons name="cube" size={14} color={C.textSub} />
                  <Text style={{ color: C.textSub, fontSize: 13 }}>{o.items?.length || 0} бараа</Text>
                </View>
                <TouchableOpacity onPress={() => acceptMutation.mutate(oid)} disabled={acceptMutation.isPending}
                  style={{ backgroundColor: C.brand, borderRadius: R.md, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Хүлээн авах</Text>
                </TouchableOpacity>
              </View>
            )
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Text style={{ fontSize: 48 }}>🚗</Text>
              <Text style={{ color: C.textSub, marginTop: 12, fontSize: 16 }}>Хүргэх захиалга байхгүй байна</Text>
            </View>
          }
        />
      )}
    </View>
  )
}
