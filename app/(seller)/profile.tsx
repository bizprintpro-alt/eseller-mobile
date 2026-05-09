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
  StatusBadge,
  PC,
} from '../components/profile-ui';
import { getReferralLink, getReferralCode, getTierLabel } from '../../src/utils/profile';
import { useSellerMe } from '../../src/hooks/useSellerDashboard';

function statusToBadgeState(status?: string): 'ok' | 'pending' | 'missing' {
  if (status === 'ACTIVE') return 'ok';
  if (status === 'PENDING') return 'pending';
  return 'missing';
}

function mnSellerStatus(s?: string): string {
  switch (s) {
    case 'PENDING': return 'Хүлээгдэж байна';
    case 'ACTIVE': return 'Идэвхтэй';
    case 'SUSPENDED': return 'Түр түдгэлзүүлсэн';
    case 'REJECTED': return 'Татгалзсан';
    default: return s ?? '—';
  }
}

function mnKycStatus(s?: string): string {
  switch (s) {
    case 'NOT_STARTED': return 'Эхлээгүй';
    case 'PENDING': return 'Хүлээгдэж байна';
    case 'APPROVED': return 'Зөвшөөрсөн';
    case 'REJECTED': return 'Татгалзсан';
    case 'NEEDS_REVIEW': return 'Шалгалтанд';
    default: return s ?? '—';
  }
}

export default function SellerProfile() {
  const { user } = useAuth();
  const refLink = getReferralLink(user?.id ?? user?._id);
  const refCode = getReferralCode(user?.id ?? user?._id);
  const me = useSellerMe();

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

          {/* Seller-network status (PR103). Read-only. Sourced from
              Sarana BFF /api/seller/me, which proxies Negd's S2S
              adapter. NOT mutable from mobile. */}
          <SectionTitle>Худалдагчийн сүлжээний статус</SectionTitle>
          <Card>
            {me.isLoading ? (
              <InfoRow icon="⏳" label="Ачааллаж байна…" value="" />
            ) : me.isError ? (
              <InfoRow icon="⚠️" label="Алдаа" value="Дахин оролдоно уу" />
            ) : me.data ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Text style={{ fontSize: 14, color: PC.text }}>Профайлын төлөв</Text>
                  <StatusBadge status={statusToBadgeState(me.data.resellerProfile.status)} label={mnSellerStatus(me.data.resellerProfile.status)} />
                </View>
                <InfoRow icon="🪪" label="KYC" value={mnKycStatus(me.data.resellerProfile.kycStatus)} />
                <InfoRow
                  icon="🔗"
                  label="Identity холбоо"
                  value={
                    me.data.identityLink
                      ? me.data.identityLink.status === 'VERIFIED'
                        ? 'Баталгаажсан'
                        : me.data.identityLink.status
                      : 'Байхгүй'
                  }
                />
                <InfoRow icon="💳" label="Олголтын эрх" value={me.data.financeEligibility === 'NOT_AVAILABLE' ? 'Одоогоор байхгүй' : me.data.financeEligibility} />
              </>
            ) : null}
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
