import {
  View, Text, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native'
import { router }   from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { get }      from '../../src/services/api'
import { useAuth }  from '../../src/store/auth'
import { C, R }     from '../../src/shared/design'

export default function ChatScreen() {
  const { user }               = useAuth()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn:  () => get('/chat/conversations'),
    enabled:  !!user,
    refetchInterval: 5000,
  })

  const convs = Array.isArray(data) ? data : []

  if (!user) return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
      alignItems:      'center',
      justifyContent:  'center',
      padding:         32,
    }}>
      <Ionicons
        name="chatbubbles-outline"
        size={72}
        color={C.border}
      />
      <Text style={{
        color:      C.text,
        fontSize:   20,
        fontWeight: '700',
        marginTop:  20,
        marginBottom: 8,
      }}>
        Чат
      </Text>
      <Text style={{
        color:     C.textMuted,
        textAlign: 'center',
        fontSize:  14,
        marginBottom: 32,
      }}>
        Нэвтэрч чат эхлүүлнэ үү
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(auth)/login' as any)}
        style={{
          backgroundColor: C.brand,
          borderRadius:    R.lg,
          padding:         16,
          paddingHorizontal: 40,
        }}
      >
        <Text style={{
          color:      C.white,
          fontWeight: '700',
          fontSize:   15,
        }}>
          Нэвтрэх
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{
      flex:            1,
      backgroundColor: C.bg,
    }}>
      {/* Header */}
      <View style={{
        paddingTop:    52,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
      }}>
        <Text style={{
          color:      C.text,
          fontSize:   20,
          fontWeight: '800',
        }}>
          Чат
        </Text>
      </View>

      <FlatList
        data={convs}
        keyExtractor={(c: any) => c.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={C.brand}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/chat/${item.id}` as any)
            }
            style={{
              flexDirection:     'row',
              padding:           16,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
              alignItems:        'center',
              gap:               12,
            }}
          >
            {/* Avatar */}
            <View style={{
              width:           50,
              height:          50,
              borderRadius:    25,
              backgroundColor: C.brand,
              alignItems:      'center',
              justifyContent:  'center',
            }}>
              <Text style={{
                color:      C.white,
                fontSize:   20,
                fontWeight: '700',
              }}>
                {item.entity?.name?.[0] || '?'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{
                color:      C.text,
                fontWeight: '700',
                fontSize:   15,
              }}>
                {item.entity?.name || 'Дэлгүүр'}
              </Text>
              <Text
                style={{
                  color:    C.textMuted,
                  fontSize: 13,
                  marginTop: 3,
                }}
                numberOfLines={1}
              >
                {item.lastMessage ||
                  'Чат эхлүүлэх'}
              </Text>
            </View>

            {/* Unread */}
            {item.buyerUnread > 0 && (
              <View style={{
                backgroundColor:   C.brand,
                borderRadius:      R.full,
                minWidth:          22,
                height:            22,
                alignItems:        'center',
                justifyContent:    'center',
                paddingHorizontal: 6,
              }}>
                <Text style={{
                  color:      C.white,
                  fontSize:   11,
                  fontWeight: '700',
                }}>
                  {item.buyerUnread}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            marginTop:  80,
          }}>
            <Ionicons
              name="chatbubbles-outline"
              size={72}
              color={C.border}
            />
            <Text style={{
              color:     C.textMuted,
              marginTop: 16,
              fontSize:  16,
            }}>
              Чат байхгүй байна
            </Text>
            <Text style={{
              color:    C.textMuted,
              fontSize: 13,
              marginTop: 6,
            }}>
              Барааны хуудсаас чат эхлүүлнэ үү
            </Text>
          </View>
        }
      />
    </View>
  )
}
