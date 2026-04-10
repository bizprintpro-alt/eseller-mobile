import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { C, R } from '../design'

export function Skeleton({
  width,
  height,
  borderRadius = R.md,
  style,
}: {
  width:         number | string
  height:        number
  borderRadius?: number
  style?:        any
}) {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1,   { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      false
    )
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[
      {
        width,
        height,
        borderRadius,
        backgroundColor: C.bgSection,
      },
      animStyle,
      style,
    ]} />
  )
}

export function ProductCardSkeleton() {
  return (
    <View style={{
      flex:            1,
      margin:          6,
      backgroundColor: C.bgCard,
      borderRadius:    R.lg,
      overflow:        'hidden',
      borderWidth:     1,
      borderColor:     C.border,
    }}>
      <Skeleton
        width="100%"
        height={160}
        borderRadius={0}
      />
      <View style={{ padding: 10, gap: 8 }}>
        <Skeleton width="85%" height={14} />
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={18} />
      </View>
    </View>
  )
}

export function FeedItemSkeleton() {
  return (
    <View style={{
      flexDirection:   'row',
      backgroundColor: C.bgCard,
      borderRadius:    R.lg,
      marginBottom:    10,
      overflow:        'hidden',
      borderWidth:     1,
      borderColor:     C.border,
    }}>
      <Skeleton width={110} height={110}
        borderRadius={0} />
      <View style={{
        flex:    1,
        padding: 12,
        gap:     8,
        justifyContent: 'center',
      }}>
        <Skeleton width="80%" height={14} />
        <Skeleton width="90%" height={14} />
        <Skeleton width="45%" height={18} />
        <Skeleton width="55%" height={11} />
      </View>
    </View>
  )
}
