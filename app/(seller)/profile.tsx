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
  SocialRow,
} from '../components/profile-ui';

export default function SellerProfile() {
  const { user } = useAuth();
  const refCode = (user?.id ?? user?._id ?? '').toString().slice(-6).toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <RoleSwitcherBar />

      <ProfileHeader
        icon="📢"
        name={user?.name ?? 'Борлуулагч'}
        sub={user?.email ?? user?.phone ?? ''}
        roleLabel="Борлуулагч"
        color={C.seller}
      />

      <View style={{ padding: 12, gap: 12 }}>
        <View>
          <SectionTitle>Борлуулагчийн мэдээлэл</SectionTitle>
          <InfoCard>
            <InfoRow
              icon="🔗"
              label="Referral код"
              value={refCode || '—'}
              copyable
            />
            <InfoRow icon="💰" label="Комиссын хувь"   value="—" />
            <InfoRow icon="🏆" label="Influencer tier" value="—" />
            <InfoRow icon="📊" label="Нийт борлуулалт" value="—" />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Миний самбар</SectionTitle>
          <InfoCard>
            <MenuRow
              icon="🏠"
              label="Самбар"
              onPress={() => router.push('/(seller)/dashboard' as never)}
            />
            <MenuRow
              icon="📦"
              label="Каталог"
              onPress={() => router.push('/(seller)/catalog' as never)}
            />
            <MenuRow
              icon="💵"
              label="Орлого"
              onPress={() => router.push('/(seller)/earnings' as never)}
            />
            <MenuRow
              icon="🏆"
              label="Топ жагсаалт"
              onPress={() => router.push('/(seller)/leaderboard' as never)}
            />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Нийгмийн сүлжээ</SectionTitle>
          <InfoCard>
            <SocialRow icon="📸" label="Instagram" />
            <SocialRow icon="🎵" label="TikTok" />
            <SocialRow icon="📘" label="Facebook" />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Тохиргоо</SectionTitle>
          <InfoCard>
            <MenuRow
              icon="✏️"
              label="Профайл засах"
              onPress={() => router.push('/(customer)/edit-profile' as never)}
            />
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
          </InfoCard>
        </View>
      </View>

      <LogoutButton />
    </ScrollView>
  );
}
