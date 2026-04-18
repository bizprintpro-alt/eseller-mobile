import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/store/auth';
import { LogoutButton } from '../components/LogoutButton';
import { RoleSwitcherBar } from '../../src/shared/ui/RoleSwitcherBar';
import {
  ProfileHeader,
  SectionTitle,
  Card,
  InfoRow,
  MenuRow,
  PC,
} from '../components/profile-ui';
import { getReferralLink, getReferralCode, getTierLabel } from '../../src/utils/profile';

export default function SellerProfile() {
  const { user } = useAuth();
  const refLink = getReferralLink(user?.id ?? user?._id);
  const refCode = getReferralCode(user?.id ?? user?._id);

  async function copyReferral() {
    try {
      await Clipboard.setStringAsync(refLink);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Хуулсан', refLink);
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: PC.bg }}>
      <RoleSwitcherBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ProfileHeader
          gradient={['#7C3AED', '#A855F7']}
          icon="📢"
          name={user?.name ?? 'Борлуулагч'}
          sub={user?.email ?? user?.phone ?? ''}
          roleLabel="БОРЛУУЛАГЧ"
        />

        <View style={{ padding: 12, gap: 2 }}>
          <SectionTitle>Борлуулагчийн мэдээлэл</SectionTitle>
          <Card>
            <InfoRow
              icon="🔗"
              label="Referral код"
              value={refCode}
              accent="#7C3AED"
              onCopy={copyReferral}
            />
            <InfoRow icon="💰" label="Комиссын хувь"   value="—" />
            <InfoRow icon="🏆" label="Tier"             value={getTierLabel(null)} />
            <InfoRow icon="📊" label="Нийт борлуулалт" value="—" />
          </Card>

          <SectionTitle>Самбар</SectionTitle>
          <Card>
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
          </Card>

          <SectionTitle>Нийгмийн сүлжээ</SectionTitle>
          <Card>
            <MenuRow icon="📸" label="Instagram холбох" onPress={() => {}} />
            <MenuRow icon="🎵" label="TikTok холбох"    onPress={() => {}} />
            <MenuRow icon="📘" label="Facebook холбох"  onPress={() => {}} />
          </Card>

          <SectionTitle>Тохиргоо</SectionTitle>
          <Card>
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
          </Card>
        </View>

        <LogoutButton />
      </ScrollView>
    </View>
  );
}
