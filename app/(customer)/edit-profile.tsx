import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { put } from '../../src/services/api';
import { useAuth } from '../../src/store/auth';
import { C, R, F } from '../../src/shared/design';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const saveMut = useMutation({
    mutationFn: (data: any) => put('/user/profile', data),
    onSuccess: () => Alert.alert('Амжилттай', 'Профайл хадгалагдлаа'),
    onError: (e: any) => Alert.alert('Алдаа', e.message),
  });

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled) setAvatar(r.assets[0].uri);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: R.lg, paddingBottom: 60 }}>
      <TouchableOpacity style={st.avatarWrap} onPress={pickAvatar}>
        {avatar ? <Image source={{ uri: avatar }} style={st.avatarImg} /> : <Ionicons name="person" size={40} color={C.textMuted} />}
        <View style={st.cameraIcon}><Ionicons name="camera" size={14} color={C.white} /></View>
      </TouchableOpacity>

      <Text style={st.label}>Нэр</Text>
      <TextInput style={st.input} value={name} onChangeText={setName} placeholderTextColor={C.textMuted} />

      <Text style={st.label}>Утас</Text>
      <TextInput style={st.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={C.textMuted} />

      <Text style={st.label}>Имэйл</Text>
      <View style={[st.input, { backgroundColor: C.bgSection }]}><Text style={{ color: C.textMuted }}>{user?.email || '-'}</Text></View>

      <TouchableOpacity style={[st.saveBtn, saveMut.isPending && { opacity: 0.5 }]}
        onPress={() => saveMut.mutate({ name, phone })} disabled={saveMut.isPending}>
        {saveMut.isPending ? <ActivityIndicator color={C.white} /> : <Text style={{ ...F.body, color: C.white, fontWeight: '800' }}>Хадгалах</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  avatarWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.bgCard, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: R.xxl, borderWidth: 2, borderColor: C.border },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: C.primary, borderRadius: 12, padding: 4 },
  label: { ...F.small, color: C.textSub, fontWeight: '600', marginBottom: 6, marginTop: R.md },
  input: { backgroundColor: C.bgCard, borderRadius: R.md, padding: 14, color: C.white, fontSize: 14, borderWidth: 0.5, borderColor: C.border },
  saveBtn: { backgroundColor: C.brand, borderRadius: 14, padding: R.lg, alignItems: 'center', marginTop: R.xxl },
});
