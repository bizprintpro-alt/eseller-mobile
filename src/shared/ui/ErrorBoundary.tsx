import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { C, R }     from '../design'

export function ErrorBoundary({
  children
}: {
  children: React.ReactNode
}) {
  const [error, setError] =
    useState<Error | null>(null)

  if (error) return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
      alignItems:      'center',
      justifyContent:  'center',
      padding:         32,
    }}>
      <Text style={{ fontSize: 52 }}>⚠️</Text>
      <Text style={{
        color:        C.text,
        fontSize:     20,
        fontWeight:   '700',
        marginTop:    16,
        textAlign:    'center',
        marginBottom: 8,
      }}>
        Алдаа гарлаа
      </Text>
      <Text style={{
        color:        C.textMuted,
        textAlign:    'center',
        fontSize:     13,
        marginBottom: 32,
      }}>
        {error.message}
      </Text>
      <TouchableOpacity
        onPress={() => setError(null)}
        style={{
          backgroundColor:   C.brand,
          borderRadius:      R.lg,
          padding:           14,
          paddingHorizontal: 32,
        }}
      >
        <Text style={{
          color:      C.white,
          fontWeight: '700',
        }}>
          Дахин оролдох
        </Text>
      </TouchableOpacity>
    </View>
  )

  return <>{children}</>
}

export function LoadingScreen() {
  return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
      alignItems:      'center',
      justifyContent:  'center',
      gap:             12,
    }}>
      <ActivityIndicator
        size="large"
        color={C.brand}
      />
      <Text style={{
        color:    C.textMuted,
        fontSize: 13,
      }}>
        Уншиж байна...
      </Text>
    </View>
  )
}

export function NetworkError({
  onRetry
}: {
  onRetry: () => void
}) {
  return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
      alignItems:      'center',
      justifyContent:  'center',
      padding:         32,
    }}>
      <Ionicons
        name="wifi-outline"
        size={72}
        color={C.border}
      />
      <Text style={{
        color:        C.text,
        fontSize:     20,
        fontWeight:   '700',
        marginTop:    20,
        marginBottom: 8,
      }}>
        Интернэт холболт байхгүй
      </Text>
      <Text style={{
        color:        C.textMuted,
        textAlign:    'center',
        fontSize:     14,
        marginBottom: 32,
      }}>
        Холболтоо шалгаад дахин оролдоно уу
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        style={{
          backgroundColor:   C.brand,
          borderRadius:      R.lg,
          padding:           14,
          paddingHorizontal: 32,
        }}
      >
        <Text style={{
          color:      C.white,
          fontWeight: '700',
        }}>
          Дахин оролдох
        </Text>
      </TouchableOpacity>
    </View>
  )
}
