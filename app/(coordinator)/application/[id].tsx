import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { HerderAPI } from '../../../src/features/herder/api';
import type {
  ApplicationsResponse,
  ApplicationStatus,
  CoordinatorApplication,
} from '../../../src/features/herder/types';
import { C, R, F } from '../../../src/shared/design';

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending:      'Хүлээгдэж',
  under_review: 'Хянагдаж',
  approved:     'Баталгаажсан',
  rejected:     'Татгалзсан',
};

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  pending:      C.gold,
  under_review: C.primary,
  approved:     C.success,
  rejected:     C.error,
};

/**
 * Full review view for a herder application. Like the herder order detail,
 * we read from the applications query cache — the backend doesn't expose a
 * by-id endpoint yet, and the detail screen is always reached from the list.
 */
export default function CoordinatorApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const list = useQuery({
    queryKey:  ['coordinator', 'applications', 'all'],
    queryFn:   () => HerderAPI.coordinator.applications.list({ status: 'all' }),
    staleTime: 30_000,
  });

  const app: CoordinatorApplication | undefined = useMemo(() => {
    if (!id) return undefined;
    const caches = qc.getQueriesData<ApplicationsResponse>({ queryKey: ['coordinator', 'applications'] });
    for (const [, data] of caches) {
      const hit = data?.applications.find((a) => a.id === id);
      if (hit) return hit;
    }
    return list.data?.applications.find((a) => a.id === id);
  }, [id, qc, list.data]);

  const review = useMutation({
    mutationFn: ({ action, rejectReason }: { action: 'approve' | 'reject' | 'request_review'; rejectReason?: string }) =>
      HerderAPI.coordinator.applications.review(id as string, action, rejectReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coordinator'] });
      setRejectOpen(false);
      setReason('');
      router.back();
    },
    onError: (e: Error) => Alert.alert('Алдаа', e.message),
  });

  const onApprove = () => {
    Alert.alert(
      'Баталгаажуулах',
      `${app?.herderName}-ийг идэвхтэй малчин болгох уу?`,
      [
        { text: 'Болих', style: 'cancel' },
        { text: 'Баталгаажуулах', onPress: () => review.mutate({ action: 'approve' }) },
      ],
    );
  };

  const onReject = () => {
    const text = reason.trim();
    if (!text) {
      Alert.alert('Анхаар', 'Татгалзах шалтгаан оруулна уу');
      return;
    }
    review.mutate({ action: 'reject', rejectReason: text });
  };

  if (list.isLoading && !app) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.herder} />
      </View>
    );
  }

  if (!app) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={48} color={C.textMuted} />
        <Text style={{ color: C.textSub, marginTop: 12, textAlign: 'center' }}>
          Өргөдөл олдсонгүй. Жагсаалт руу буцна уу.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, backgroundColor: C.herder, borderRadius: R.full, paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canReview = app.status === 'pending' || app.status === 'under_review';
  const livestockLines = Object.entries(app.livestock ?? {})
    .filter(([, n]) => typeof n === 'number' && n > 0)
    .map(([k, n]) => `${LIVESTOCK_LABEL[k] ?? k}: ${n}`);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: canReview ? 140 : 32 }}>
        <View style={{ padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', flex: 1 }} numberOfLines={1}>
            {app.herderName}
          </Text>
          <View
            style={{
              backgroundColor: STATUS_COLOR[app.status] + '22',
              borderRadius: R.full,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: STATUS_COLOR[app.status], fontSize: 11, fontWeight: '700' }}>
              {STATUS_LABEL[app.status]}
            </Text>
          </View>
        </View>

        <Section title="Хувийн мэдээлэл">
          <Row label="Регистр" value={app.registerNumber} />
          <Row
            label="Утас"
            value={app.phone}
            onPress={() => Linking.openURL(`tel:${app.phone}`)}
            cta="Залгах"
          />
          {app.user?.email ? <Row label="И-мэйл" value={app.user.email} /> : null}
        </Section>

        <Section title="Байршил">
          <Row label="Аймаг" value={`${app.provinceName} (${app.province})`} />
          <Row label="Сум" value={app.district} />
        </Section>

        <Section title="Мал">
          {livestockLines.length > 0 ? (
            livestockLines.map((l) => (
              <Text key={l} style={{ color: C.text, fontSize: 13, paddingVertical: 2 }}>
                · {l}
              </Text>
            ))
          ) : (
            <Text style={{ color: C.textMuted, fontSize: 13 }}>Мэдээлэл оруулаагүй</Text>
          )}
          {app.aDansNumber ? <Row label="А данс" value={app.aDansNumber} /> : null}
        </Section>

        <Section title="Баримт бичиг">
          {app.vetCertUri ? (
            <View>
              <Text style={{ color: C.textSub, fontSize: 12, marginBottom: 8 }}>Мал эмнэлгийн гэрчилгээ</Text>
              <Image
                source={{ uri: app.vetCertUri }}
                style={{ width: '100%', height: 180, borderRadius: R.md, backgroundColor: C.bgSection }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <Text style={{ color: C.textMuted, fontSize: 13 }}>Гэрчилгээ upload хийгээгүй</Text>
          )}
        </Section>

        <Section title="Банк">
          {app.bankInfo ? (
            <>
              <Row label="Банк" value={app.bankInfo.bankName} />
              <Row label="Данс" value={app.bankInfo.accountNumber} />
              {app.bankInfo.accountName ? <Row label="Нэр" value={app.bankInfo.accountName} /> : null}
            </>
          ) : (
            <Text style={{ color: C.textMuted, fontSize: 13 }}>Банкны мэдээлэл алга</Text>
          )}
        </Section>

        {app.notes ? (
          <Section title="Тэмдэглэл">
            <Text style={{ color: C.text, fontSize: 13 }}>{app.notes}</Text>
          </Section>
        ) : null}
      </ScrollView>

      {canReview && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 12,
            backgroundColor: C.bgCard,
            borderTopWidth: 0.5,
            borderTopColor: C.border,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setRejectOpen(true)}
            disabled={review.isPending}
            style={{
              flex: 1,
              backgroundColor: C.bgSection,
              borderRadius: R.lg,
              padding: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: C.error,
            }}
          >
            <Text style={{ color: C.error, fontWeight: '800', fontSize: 14 }}>Татгалзах</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onApprove}
            disabled={review.isPending}
            style={{
              flex: 2,
              backgroundColor: review.isPending ? C.textMuted : C.herder,
              borderRadius: R.lg,
              padding: 14,
              alignItems: 'center',
            }}
          >
            {review.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Баталгаажуулах</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal transparent visible={rejectOpen} animationType="fade" onRequestClose={() => setRejectOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: C.bgCard, borderRadius: R.lg, padding: 20 }}>
            <Text style={{ ...F.h3, color: C.text }}>Татгалзах шалтгаан</Text>
            <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
              Өргөдөл гаргагчид харагдана. Тодорхой бичнэ үү.
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="жш: Мал эмнэлгийн гэрчилгээ хүчингүй"
              placeholderTextColor={C.textMuted}
              multiline
              style={{
                marginTop: 12,
                backgroundColor: C.bgSection,
                borderRadius: R.md,
                borderWidth: 1,
                borderColor: C.border,
                padding: 12,
                minHeight: 80,
                color: C.text,
                textAlignVertical: 'top',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => { setRejectOpen(false); setReason(''); }}
                style={{
                  flex: 1,
                  backgroundColor: C.bgSection,
                  borderRadius: R.md,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: C.text, fontWeight: '700' }}>Болих</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={review.isPending}
                onPress={onReject}
                style={{
                  flex: 1,
                  backgroundColor: C.error,
                  borderRadius: R.md,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                {review.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Татгалзах</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const LIVESTOCK_LABEL: Record<string, string> = {
  horse: 'Морь',
  cow:   'Үхэр',
  sheep: 'Хонь',
  goat:  'Ямаа',
  camel: 'Тэмээ',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        marginHorizontal: 12,
        marginTop: 12,
        backgroundColor: C.bgCard,
        borderRadius: R.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <Text style={{ ...F.h4, color: C.text, marginBottom: 10 }}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
  cta,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  cta?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
      <Text style={{ color: C.textSub, fontSize: 13 }}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: C.herder, fontSize: 13, fontWeight: '700' }}>{value}</Text>
          {cta ? <Text style={{ color: C.herder, fontSize: 11 }}>({cta})</Text> : null}
        </TouchableOpacity>
      ) : (
        <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{value}</Text>
      )}
    </View>
  );
}
