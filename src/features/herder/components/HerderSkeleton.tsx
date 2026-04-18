import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

function useShimmer() {
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1,   duration: 700, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return v;
}

function Block({ style }: { style?: any }) {
  const opacity = useShimmer();
  return <Animated.View style={[s.block, { opacity }, style]} />;
}

export function ProductTileSkeleton() {
  return (
    <View style={s.tile}>
      <Block style={{ height: 120, borderRadius: 0 }} />
      <View style={{ padding: 10, gap: 6 }}>
        <Block style={{ height: 12, width: '90%' }} />
        <Block style={{ height: 12, width: '60%' }} />
        <Block style={{ height: 14, width: '40%', marginTop: 4 }} />
      </View>
    </View>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={s.grid}>
      {Array.from({ length: count }).map((_, i) => <ProductTileSkeleton key={i} />)}
    </View>
  );
}

export function HomeRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={s.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={s.rowCard}>
          <Block style={{ height: 88, borderRadius: 0 }} />
          <View style={{ padding: 10, gap: 5 }}>
            <Block style={{ height: 10, width: '90%' }} />
            <Block style={{ height: 12, width: '50%' }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ProductListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={s.listCard}>
          <Block style={{ height: 180, borderRadius: 0 }} />
          <View style={{ padding: 14, gap: 8 }}>
            <Block style={{ height: 14, width: '80%' }} />
            <Block style={{ height: 12, width: '50%' }} />
            <Block style={{ height: 16, width: '30%', marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  block: { backgroundColor: '#e7e5e4', borderRadius: 6 },
  grid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile:  { width: '48%' as any, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e7e5e4', overflow: 'hidden' },
  listCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e7e5e4' },
  row:      { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  rowCard:  { width: 134, backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#e7e5e4', overflow: 'hidden' },
});
