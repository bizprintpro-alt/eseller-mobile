import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { LogoutButton } from '../components/LogoutButton';
import {
  ProfileHeader,
  SectionTitle,
  Card,
  InfoRow,
  MenuRow,
  StatusBadge,
  PC,
} from '../components/profile-ui';

// Online/offline status broadcasting (`POST /driver/status`) is not yet
// shipped by the backend. The toggle is rendered disabled with a clear
// "Backend бэлэн болоогүй" state so drivers don't see a fake success when
// flipping it. When the endpoint lands, restore the local `useState` +
// `toggleOnline` and re-enable the Switch.

export default function DriverProfile() {
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: PC.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ProfileHeader
          gradient={['#EA580C', '#F97316']}
          icon="🚚"
          name={user?.name ?? 'Жолооч'}
          sub={user?.phone ?? user?.email ?? ''}
          roleLabel="🚚 Жолооч"
        />

        {/* Online / Offline toggle — disabled until /driver/status ships */}
        <View
          style={{
            marginHorizontal: 12,
            marginTop: 14,
            padding: 16,
            backgroundColor: PC.card,
            borderRadius: 14,
            borderWidth: 0.5,
            borderColor: PC.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            opacity: 0.7,
          }}
        >
          <Text style={{ fontSize: 26 }}>🟡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: PC.text }}>
              Онлайн төлөв
            </Text>
            <Text style={{ fontSize: 11, color: PC.textMuted, marginTop: 2 }}>
              Backend бэлэн болоогүй — удахгүй идэвхжинэ
            </Text>
          </View>
          <Switch
            value={false}
            disabled
            trackColor={{ true: '#10B981', false: '#D1D5DB' }}
            thumbColor="#fff"
          />
        </View>

        <View style={{ padding: 12, gap: 2 }}>
          <SectionTitle>Гүйцэтгэл</SectionTitle>
          <Card>
            <InfoRow icon="⭐" label="Рейтинг"          value="—" />
            <InfoRow icon="📦" label="Нийт хүргэлт"    value="—" />
            <InfoRow icon="📅" label="Ирц (энэ сар)"  value="—" />
          </Card>

          <SectionTitle>Самбар</SectionTitle>
          <Card>
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
          </Card>

          <SectionTitle>Тээврийн хэрэгсэл</SectionTitle>
          <Card>
            <InfoRow icon="🚗" label="Марк/Загвар"    value="—" />
            <InfoRow icon="🔢" label="Улсын дугаар"   value="—" />
            <InfoRow icon="🎨" label="Өнгө"           value="—" />
            <MenuRow icon="✏️" label="Засах" onPress={() => {}} />
          </Card>

          <SectionTitle>Баримт бичиг</SectionTitle>
          <Card>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                gap: 12,
                borderBottomWidth: 0.5,
                borderBottomColor: PC.border,
              }}
            >
              <Text style={{ fontSize: 18 }}>🪪</Text>
              <Text style={{ flex: 1, fontSize: 13, color: PC.textSub }}>
                Жолооны үнэмлэх
              </Text>
              <StatusBadge status="missing" label="Дутуу" />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                gap: 12,
                borderBottomWidth: 0.5,
                borderBottomColor: PC.border,
              }}
            >
              <Text style={{ fontSize: 18 }}>🪪</Text>
              <Text style={{ flex: 1, fontSize: 13, color: PC.textSub }}>
                Иргэний үнэмлэх
              </Text>
              <StatusBadge status="missing" label="Дутуу" />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 18 }}>📋</Text>
              <Text style={{ flex: 1, fontSize: 13, color: PC.textSub }}>
                Даатгал
              </Text>
              <StatusBadge status="missing" label="Дутуу" />
            </View>
          </Card>

          <SectionTitle>Банкны данс</SectionTitle>
          <Card>
            <InfoRow icon="🏦" label="Банк" value="—" />
            <InfoRow icon="💳" label="Данс" value="—" />
            <MenuRow icon="✏️" label="Засах" onPress={() => {}} />
          </Card>

          <SectionTitle>Тохиргоо</SectionTitle>
          <Card>
            <MenuRow icon="🗺️" label="Хүргэлтийн бүс" onPress={() => {}} />
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
