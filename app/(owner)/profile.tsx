import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/store/auth';
import { get } from '../../src/services/api';
import { LogoutButton } from '../components/LogoutButton';
import { RoleSwitcherBar } from '../../src/shared/ui/RoleSwitcherBar';
import {
  ProfileHeader,
  SectionTitle,
  Card,
  InfoRow,
  MenuRow,
  StatCard,
  PC,
} from '../components/profile-ui';
import { formatCurrency, formatCount } from '../../src/utils/profile';

export default function OwnerProfile() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['owner-stats'],
    queryFn: () => get('/seller/analytics'),
  });
  const stats = (data as any)?.stats || (data as any) || {};

  return (
    <View style={{ flex: 1, backgroundColor: PC.bg }}>
      <RoleSwitcherBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ProfileHeader
          gradient={['#059669', '#10B981']}
          icon="🏪"
          name={user?.name ?? 'Дэлгүүрийн эзэн'}
          sub={user?.email ?? user?.phone ?? ''}
          roleLabel="БАТАЛГААЖСАН ДЭЛГҮҮР"
        />

        <View style={{ padding: 12, gap: 2 }}>
          {/* Stats 2×2 */}
          <SectionTitle>Хурдан статистик</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <StatCard
              icon="📦"
              label="Нийт бараа"
              value={formatCount(stats.products)}
              color="#10B981"
            />
            <StatCard
              icon="🛒"
              label="Нийт захиалга"
              value={formatCount(stats.orders)}
              color="#3B82F6"
            />
            <StatCard
              icon="💰"
              label="Нийт орлого"
              value={formatCurrency(stats.revenue)}
              color="#F59E0B"
            />
            <StatCard
              icon="⭐"
              label="Дундаж үнэлгээ"
              value={stats.rating ? `${stats.rating}` : '—'}
              color="#7C3AED"
            />
          </View>

          <SectionTitle>Хувийн мэдээлэл</SectionTitle>
          <Card>
            <InfoRow icon="👤" label="Нэр" value={user?.name ?? '—'} />
            <InfoRow icon="📧" label="Имэйл" value={user?.email ?? '—'} />
            <InfoRow icon="📱" label="Утас" value={user?.phone ?? '—'} />
            <MenuRow
              icon="✏️"
              label="Профайл засах"
              onPress={() => router.push('/(customer)/edit-profile' as never)}
            />
          </Card>

          <SectionTitle>Хэтэвч</SectionTitle>
          <Card>
            <MenuRow
              icon="💳"
              label="Баланс харах"
              onPress={() => router.push('/(customer)/wallet' as never)}
            />
            <MenuRow
              icon="⭐"
              label="Урамшааллын оноо"
              onPress={() => router.push('/(customer)/tier-details' as never)}
            />
          </Card>

          <SectionTitle>Дэлгүүр</SectionTitle>
          <Card>
            <MenuRow
              icon="⚙️"
              label="Дэлгүүрийн тохиргоо"
              onPress={() => router.push('/(owner)/settings' as never)}
            />
            <MenuRow
              icon="🖥️"
              label="POS терминал"
              onPress={() => router.push('/(pos)/' as never)}
            />
            <MenuRow
              icon="📊"
              label="Тайлан"
              onPress={() => router.push('/(owner)/analytics' as never)}
            />
          </Card>

          <SectionTitle>Тохиргоо</SectionTitle>
          <Card>
            <MenuRow
              icon="🔔"
              label="Мэдэгдэл"
              onPress={() => router.push('/(customer)/notification-settings' as never)}
            />
            <MenuRow
              icon="🔒"
              label="Аюулгүй байдал"
              onPress={() => router.push('/(customer)/security' as never)}
            />
            <MenuRow
              icon="❓"
              label="Тусламж"
              onPress={() => router.push('/(customer)/help' as never)}
            />
          </Card>
        </View>

        <LogoutButton />
      </ScrollView>
    </View>
  );
}
