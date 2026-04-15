import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { C } from '../../src/shared/design';
import { LogoutButton } from '../components/LogoutButton';
import { RoleSwitcherBar } from '../../src/shared/ui/RoleSwitcherBar';
import {
  ProfileHeader,
  SectionTitle,
  InfoCard,
  InfoRow,
  MenuRow,
} from '../components/profile-ui';

export default function OwnerProfile() {
  const { user } = useAuth();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <RoleSwitcherBar />

      <ProfileHeader
        icon="🏪"
        name={user?.name ?? 'Дэлгүүрийн эзэн'}
        sub={user?.email ?? user?.phone ?? ''}
        roleLabel="Дэлгүүр эзэн"
        color={C.store}
      />

      <View style={{ padding: 12, gap: 12 }}>
        <View>
          <SectionTitle>Хувийн мэдээлэл</SectionTitle>
          <InfoCard>
            <InfoRow icon="👤" label="Нэр"   value={user?.name ?? '—'} />
            <InfoRow icon="📧" label="Имэйл" value={user?.email ?? '—'} />
            <InfoRow icon="📱" label="Утас"  value={user?.phone ?? '—'} />
            <MenuRow
              icon="✏️"
              label="Профайл засах"
              onPress={() => router.push('/(customer)/edit-profile' as never)}
            />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Дэлгүүр</SectionTitle>
          <InfoCard>
            <MenuRow
              icon="⚙️"
              label="Дэлгүүрийн тохиргоо"
              onPress={() => router.push('/(owner)/settings' as never)}
            />
            <MenuRow
              icon="📦"
              label="Бараа"
              onPress={() => router.push('/(owner)/products' as never)}
            />
            <MenuRow
              icon="🧾"
              label="Захиалгууд"
              onPress={() => router.push('/(owner)/orders' as never)}
            />
            <MenuRow
              icon="📊"
              label="Тайлан"
              onPress={() => router.push('/(owner)/analytics' as never)}
            />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Хэтэвч ба оноо</SectionTitle>
          <InfoCard>
            <MenuRow
              icon="💳"
              label="Хэтэвч харах"
              onPress={() => router.push('/(customer)/wallet' as never)}
            />
            <MenuRow
              icon="⭐"
              label="Урамшааллын оноо"
              onPress={() => router.push('/(customer)/tier-details' as never)}
            />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Тохиргоо</SectionTitle>
          <InfoCard>
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
          </InfoCard>
        </View>
      </View>

      <LogoutButton />
    </ScrollView>
  );
}
