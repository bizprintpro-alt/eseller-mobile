import { View, Text, TouchableOpacity, Share, ScrollView, FlatList } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../services/api'
import { useTheme } from '../../shared/useTheme'
import { useHaptic } from '../../shared/hooks/useHaptic'
import { useAuth } from '../../store/auth'

export default function AffiliateLinkScreen() {
  const { colors, accent } = useTheme()
  const haptic = useHaptic()
  const { user } = useAuth()

  const refCode = (user?._id ?? user?.id ?? user?.phone ?? '').toString().slice(-6).toUpperCase()
  const referralLink = `https://eseller.mn/ref/${refCode}`

  const { data } = useQuery<any>({
    queryKey: ['affiliate-links'],
    queryFn: () => get('/affiliate/links'),
  })

  async function handleShare(url: string = referralLink) {
    haptic.medium()
    await Share.share({
      message: `eSeller.mn-д шилдэг барааг хямд үнээр!\n${url}`,
      title: 'eSeller.mn',
    })
  }

  const links: any[] = Array.isArray(data) ? data : (data?.links ?? [])

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, paddingTop: 52 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
          🔗 Миний линк
        </Text>

        <View style={{
          backgroundColor: colors.bgCard, borderRadius: 12, padding: 16, marginBottom: 12,
          borderWidth: 0.5, borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 12, color: colors.textSub, marginBottom: 6 }}>
            Таны referral линк
          </Text>
          <Text style={{ fontSize: 13, color: accent, fontWeight: '600', marginBottom: 12 }}>
            {referralLink}
          </Text>
          <TouchableOpacity
            onPress={() => handleShare()}
            style={{ backgroundColor: accent, borderRadius: 8, padding: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>↗️ Share хийх</Text>
          </TouchableOpacity>
        </View>

        <View style={{
          backgroundColor: colors.bgCard, borderRadius: 12, padding: 16,
          borderWidth: 0.5, borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
            Миний бүтээгдэхүүний линкүүд ({links.length})
          </Text>
          {links.length === 0 ? (
            <Text style={{ color: colors.textSub, fontSize: 12, textAlign: 'center', paddingVertical: 16 }}>
              Одоогоор линк үүсгээгүй. Бараа таб руу ороод линк үүсгээрэй.
            </Text>
          ) : (
            links.map((l: any) => (
              <TouchableOpacity
                key={l.id}
                onPress={() => handleShare(`https://eseller.mn/r/${l.code}`)}
                style={{
                  paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.border,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}
              >
                <Text style={{ fontSize: 20 }}>🔗</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{l.code}</Text>
                  <Text style={{ color: colors.textSub, fontSize: 11 }}>
                    {l.clicks ?? 0} товшилт · {l.conversions ?? 0} борлуулалт
                  </Text>
                </View>
                <Text style={{ color: accent, fontWeight: '700' }}>
                  {(l.earnings ?? 0).toLocaleString()}₮
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  )
}
