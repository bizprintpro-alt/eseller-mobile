import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface BarcodeScannerProps {
  visible: boolean;
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ visible, onScan, onClose }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      if (!permission?.granted) requestPermission().catch(() => {});
    }
  }, [visible, permission?.granted, requestPermission]);

  function handleScan({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            paddingTop: 48,
            backgroundColor: '#0F172A',
          }}
        >
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 12,
            }}
          >
            Barcode уншуулах
          </Text>
        </View>

        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleScan}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'ean13',
                'ean8',
                'code128',
                'code39',
                'upc_a',
                'upc_e',
              ],
            }}
          >
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 240,
                  height: 160,
                  borderWidth: 2,
                  borderColor: '#27AE60',
                  borderRadius: 12,
                  backgroundColor: 'transparent',
                }}
              />
              <Text
                style={{
                  color: '#fff',
                  fontSize: 13,
                  marginTop: 20,
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                Барааны barcode-г хүрээнд байрлуул
              </Text>
            </View>
          </CameraView>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 24,
            }}
          >
            <Ionicons name="camera-outline" size={48} color="#475569" />
            <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
              Камерын эрх байхгүй
            </Text>
            <TouchableOpacity
              onPress={() => requestPermission().catch(() => {})}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 10,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Эрх өгөх</Text>
            </TouchableOpacity>
          </View>
        )}

        {scanned && (
          <View style={{ padding: 16, backgroundColor: '#0F172A' }}>
            <TouchableOpacity
              onPress={() => setScanned(false)}
              style={{
                backgroundColor: '#334155',
                borderRadius: 10,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>Дахин уншуулах</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
