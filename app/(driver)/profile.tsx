import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { C, R } from '../../src/shared/design';
import { LogoutButton } from '../components/LogoutButton';
import { RoleSwitcherBar } from '../../src/shared/ui/RoleSwitcherBar';
import {
  ProfileHeader,
  SectionTitle,
  InfoCard,
  InfoRow,
  MenuRow,
} from '../components/profile-ui';

export default function DriverProfile() {
  const { user } = useAuth();

  // TODO: persist online state to backend when /driver/status endpoint lands
  const [isOnline, setIsOnline] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <RoleSwitcherBar />

      <ProfileHeader
        icon="🚚"
        name={user?.name ?? 'Жолооч'}
        sub={user?.phone ?? user?.email ?? ''}
        roleLabel="Жолооч"
        color={C.driver}
      />

      {/* Online toggle — big, accent color */}
      <View
        style={{
          marginHorizontal: 12,
          marginTop: 12,
          padding: 14,
          borderRadius: R.lg,
          backgroundColor: C.bgCard,
          borderWidth: 0.5,
          borderColor: C.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 20 }}>{isOnline ? '🟢' : '⚪'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontSize: 14, fontWeight: '700' }}>
            {isOnline ? 'Онлайн' : 'Оффлайн'}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
            {isOnline ? 'Шинэ хүргэлт хүлээн авах' : 'Шинэ хүргэлт хүлээн авахгүй'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          trackColor={{ true: '#27AE60', false: '#555' }}
          thumbColor="#fff"
        />
      </View>

      <View style={{ padding: 12, gap: 12 }}>
        <View>
          <SectionTitle>Гүйцэтгэл</SectionTitle>
          <InfoCard>
            <InfoRow icon="⭐" label="Рейтинг"         value="—" />
            <InfoRow icon="📦" label="Нийт хүргэлт"   value="—" />
            <InfoRow icon="📅" label="Ирц (энэ сар)" value="—" />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Миний самбар</SectionTitle>
          <InfoCard>
            <MenuRow
              icon="🚚"
              label="Хүргэлт"
              onPress={() => router.push('/(driver)/deliveries' as never)}
            />
            <MenuRow
              icon="💵"
              label="Орлого"
              onPress={() => router.push('/(driver)/earnings' as never)}
            />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Тээврийн хэрэгсэл</SectionTitle>
          <InfoCard>
            <InfoRow icon="🚗" label="Марк/Загвар" value="—" />
            <InfoRow icon="🔢" label="Улсын дугаар" value="—" />
            <InfoRow icon="🎨" label="Өнгө" value="—" />
          </InfoCard>
        </View>

        <View>
          <SectionTitle>Баримт бичиг</SectionTitle>
          <InfoCard>
            <InfoRow icon="🪪" label="Жолооны үнэмлэх" value="—" />
            <InfoRow icon="🪪" label="Иргэний үнэмлэх" value="—" />
            <InfoRow icon="📋" label="Даатгал"         value="—" />
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
