import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';
import { roleColor } from '../../src/shared/design';

type ActionItem = { icon: string; label: string; route: string; desc: string };

const ACTIONS: Record<string, ActionItem[]> = {
  BUYER: [
    { icon: 'create-outline', label: 'Зар нэмэх', route: '/feed/create', desc: 'Зарын булан' },
    { icon: 'storefront-outline', label: 'Дэлгүүр нээх', route: '/(customer)/register-shop', desc: 'Хялбар бүртгэл' },
    { icon: 'megaphone-outline', label: 'Борлуулагч болох', route: '/(customer)/become-seller', desc: 'Комисс олох' },
    { icon: 'car-outline', label: 'Жолооч болох', route: '/(customer)/become-driver', desc: 'Хүргэлтээр орлого' },
  ],
  STORE: [
    { icon: 'add-circle-outline', label: 'Бараа нэмэх', route: '/(owner)/products', desc: 'Шинэ бараа' },
    { icon: 'receipt-outline', label: 'Захиалгууд', route: '/(owner)/orders', desc: 'Шинэ захиалга' },
    { icon: 'tv-outline', label: 'Live эхлүүлэх', route: '/(owner)/live/create', desc: 'Шууд дамжуулалт' },
    { icon: 'desktop-outline', label: 'POS терминал', route: '/(pos)/', desc: 'Кассын систем' },
  ],
  SELLER: [
    { icon: 'link-outline', label: 'Линк үүсгэх', route: '/(seller)/catalog', desc: 'Referral' },
    { icon: 'stats-chart-outline', label: 'Орлого харах', route: '/(seller)/earnings', desc: 'Комисс' },
    { icon: 'trophy-outline', label: 'Leaderboard', route: '/(seller)/leaderboard', desc: 'Топ борлуулагчид' },
  ],
  DRIVER: [
    { icon: 'checkmark-circle-outline', label: 'Хүргэлт авах', route: '/(driver)/deliveries', desc: 'Шинэ захиалга' },
    { icon: 'cash-outline', label: 'Орлого', route: '/(driver)/earnings', desc: 'Өнөөдрийн дүн' },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  BUYER: 'Авагч',
  STORE: 'Дэлгүүрийн эзэн',
  SELLER: 'Борлуулагч',
  DRIVER: 'Жолооч',
};

export default function ActionTab() {
  const { role } = useAuth();
  const actions = ACTIONS[role] ?? ACTIONS.BUYER;
  const color = roleColor(role);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#121212' }}
      contentContainerStyle={{ padding: 16, paddingTop: 52, paddingBottom: 100 }}
    >
      <View
        style={{
          backgroundColor: color + '18',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          borderWidth: 0.5,
          borderColor: color + '40',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 3 }}>
          Үйлдэл
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>
          {ROLE_LABEL[role] ?? 'Авагч'} горим
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.route}
            onPress={() => router.push(action.route as any)}
            style={{
              backgroundColor: '#1E1E1E',
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              borderWidth: 0.5,
              borderColor: '#2A2A2A',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: color + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={action.icon as any} size={22} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                {action.label}
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                {action.desc}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,.2)" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
