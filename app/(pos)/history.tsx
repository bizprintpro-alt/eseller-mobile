import React from 'react';
import {
  View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { POSAPI } from '../../src/services/api';

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

interface POSSale {
  id: string;
  total: number;
  paymentMethod: string;
  itemCount: number;
  vatAmount?: number;
  createdAt: string;
}

const METHOD_LABEL: Record<string, string> = {
  cash: '💵 Бэлэн',
  qpay: '📱 QPay',
  card: '💳 Карт',
};

export default function POSHistory() {
  const today = new Date().toISOString().split('T')[0];

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['pos', 'history', today],
    queryFn: async () => {
      const res = await POSAPI.getSalesHistory(today);
      return unwrap<{
        sales: POSSale[];
        totalRevenue: number;
        totalOrders: number;
      }>(res);
    },
  });

  const sales = data?.sales ?? [];
  const totalRev = data?.totalRevenue ?? 0;
  const totalOrders = data?.totalOrders ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          backgroundColor: '#1E293B',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 }}>
          Өнөөдрийн борлуулалт
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Ionicons name="refresh" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#1E293B',
            borderRadius: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: '#64748B', fontSize: 11 }}>Нийт орлого</Text>
          <Text
            style={{
              color: '#10B981',
              fontSize: 20,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {totalRev.toLocaleString()}₮
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#1E293B',
            borderRadius: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: '#64748B', fontSize: 11 }}>Захиалга</Text>
          <Text
            style={{
              color: '#3B82F6',
              fontSize: 20,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {totalOrders}
          </Text>
        </View>
      </View>

      {/* Sales list */}
      <FlatList
        data={sales}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 40, gap: 10 }}>
              <ActivityIndicator color="#3B82F6" />
              <Text style={{ color: '#475569', fontSize: 12 }}>Ачаалж байна...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>🧾</Text>
              <Text style={{ color: '#475569', fontSize: 12 }}>
                Өнөөдөр борлуулалт байхгүй
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: '#1E293B',
              borderRadius: 10,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
                #{item.id.slice(-6).toUpperCase()}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>
                {item.itemCount} бараа ·{' '}
                {new Date(item.createdAt).toLocaleTimeString('mn-MN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 11 }}>
              {METHOD_LABEL[item.paymentMethod] ?? item.paymentMethod}
            </Text>
            <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '700' }}>
              {item.total.toLocaleString()}₮
            </Text>
          </View>
        )}
      />
    </View>
  );
}
