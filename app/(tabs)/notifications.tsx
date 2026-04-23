import React from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const MOCK_NOTIFS = [
  { id: '1', icon: 'checkmark-circle', color: '#2ecc71', title: 'Захиалга баталгаажлаа', body: '#ORD-1234 захиалга хүлээн авагдлаа', time: '5 мин өмнө' },
  { id: '2', icon: 'car', color: '#3498db', title: 'Хүргэлт эхэллээ', body: 'Таны захиалга замдаа байна', time: '1 цаг өмнө' },
  { id: '3', icon: 'pricetag', color: '#e74c3c', title: 'Flash sale эхэллээ!', body: '50% хүртэл хямдрал авах боломжтой', time: '2 цаг өмнө' },
]

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Мэдэгдэл</Text>
      <FlatList
        data={MOCK_NOTIFS}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <View style={[styles.icon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.content}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.body}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  heading: { fontSize: 22, fontWeight: '800', color: '#333', padding: 16, paddingBottom: 8 },
  item: { flexDirection: 'row', backgroundColor: '#fff', padding: 14, borderRadius: 14, alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  itemBody: { fontSize: 13, color: '#666', marginTop: 2 },
  itemTime: { fontSize: 11, color: '#aaa', marginTop: 4 },
})
