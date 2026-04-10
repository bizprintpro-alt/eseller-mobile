import React, { useEffect } from 'react'
import {
  View, Text,
} from 'react-native'
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated'
import { C } from '../design'

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: 600 }),
        -1,
        true
      )
    }, delay)
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[{
      width:           8,
      height:          8,
      borderRadius:    4,
      backgroundColor: C.brand,
    }, style]} />
  )
}

export default function SplashScreen({
  onDone
}: {
  onDone: () => void
}) {
  const opacity = useSharedValue(0)
  const scale   = useSharedValue(0.8)

  useEffect(() => {
    opacity.value = withTiming(1,
      { duration: 600 }
    )
    scale.value = withTiming(1,
      { duration: 600 }
    )

    setTimeout(() => {
      opacity.value = withTiming(
        0,
        { duration: 400 },
        (finished) => {
          if (finished) runOnJS(onDone)()
        }
      )
    }, 2000)
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
      alignItems:      'center',
      justifyContent:  'center',
    }}>
      <Animated.View style={[
        { alignItems: 'center' },
        logoStyle,
      ]}>
        <Text style={{
          color:         C.text,
          fontSize:      52,
          fontWeight:    '900',
          letterSpacing: -2,
        }}>
          eseller
          <Text style={{ color: C.brand }}>
            .mn
          </Text>
        </Text>
        <Text style={{
          color:     C.textMuted,
          textAlign: 'center',
          marginTop: 10,
          fontSize:  15,
        }}>
          Монголын нэгдсэн платформ
        </Text>
      </Animated.View>

      <View style={{
        position:      'absolute',
        bottom:        80,
        flexDirection: 'row',
        gap:           8,
      }}>
        {[0, 1, 2].map(i => (
          <LoadingDot key={i} delay={i * 200} />
        ))}
      </View>
    </View>
  )
}
