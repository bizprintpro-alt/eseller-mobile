import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity,
  Modal, ScrollView, TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { C, R, F }  from '../design'

interface FilterSheetProps {
  visible:   boolean
  onClose:   () => void
  onApply:   (filters: any) => void
  type:      'store' | 'feed'
}

export function FilterSheet({
  visible, onClose, onApply, type
}: FilterSheetProps) {
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [district, setDistrict] = useState('')
  const [sortBy,   setSortBy]   = useState('newest')

  const DISTRICTS = [
    'СБД', 'ХУД', 'БЗД', 'ЧД',
    'БГД', 'СХД', 'НД', 'БНД',
  ]

  const SORT_OPTIONS = [
    { key: 'newest',     label: 'Шинэ эхэнд' },
    { key: 'price_asc',  label: 'Үнэ: бага → их' },
    { key: 'price_desc', label: 'Үнэ: их → бага' },
    { key: 'popular',    label: 'Эрэлттэй' },
  ]

  const handleApply = () => {
    onApply({
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      district: district || undefined,
      sortBy,
    })
    onClose()
  }

  const handleReset = () => {
    setMinPrice('')
    setMaxPrice('')
    setDistrict('')
    setSortBy('newest')
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onClose}
      />

      <View style={{
        backgroundColor: C.bgCard,
        borderTopLeftRadius: R.xxl, borderTopRightRadius: R.xxl,
        maxHeight: '80%',
        borderTopWidth: 1, borderTopColor: C.border,
      }}>
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <View style={{
            width: 40, height: 4, borderRadius: 2, backgroundColor: C.border,
          }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', paddingHorizontal: 20,
          paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border,
        }}>
          <Text style={{ ...F.h3, color: C.text }}>Шүүлтүүр</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={{ color: C.brand, fontSize: 14 }}>Цэвэрлэх</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 20 }}>

          {/* Price range */}
          <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>
            Үнийн муж (₮)
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TextInput
              value={minPrice} onChangeText={setMinPrice}
              placeholder="Доод үнэ" placeholderTextColor={C.textMuted}
              keyboardType="number-pad"
              style={{
                flex: 1, backgroundColor: C.bgSection, borderRadius: R.lg,
                padding: 12, color: C.text, borderWidth: 1, borderColor: C.border,
              }}
            />
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.textMuted }}>—</Text>
            </View>
            <TextInput
              value={maxPrice} onChangeText={setMaxPrice}
              placeholder="Дээд үнэ" placeholderTextColor={C.textMuted}
              keyboardType="number-pad"
              style={{
                flex: 1, backgroundColor: C.bgSection, borderRadius: R.lg,
                padding: 12, color: C.text, borderWidth: 1, borderColor: C.border,
              }}
            />
          </View>

          {/* District - feed only */}
          {type === 'feed' && (
            <>
              <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>
                Байршил
              </Text>
              <View style={{
                flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24,
              }}>
                {DISTRICTS.map(d => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDistrict(district === d ? '' : d)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8,
                      borderRadius: R.full,
                      backgroundColor: district === d ? C.brand : C.bgSection,
                      borderWidth: 1,
                      borderColor: district === d ? C.brand : C.border,
                    }}
                  >
                    <Text style={{
                      color: district === d ? C.white : C.textSub,
                      fontSize: 13, fontWeight: '600',
                    }}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Sort */}
          <Text style={{ ...F.h4, color: C.text, marginBottom: 12 }}>
            Эрэмбэлэх
          </Text>
          <View style={{ gap: 8, marginBottom: 24 }}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: sortBy === opt.key ? C.brand + '12' : C.bgSection,
                  borderRadius: R.lg, padding: 14,
                  borderWidth: 1,
                  borderColor: sortBy === opt.key ? C.brand : C.border,
                }}
              >
                <Text style={{
                  color: sortBy === opt.key ? C.text : C.textSub,
                  fontWeight: sortBy === opt.key ? '600' : '400', fontSize: 14,
                }}>
                  {opt.label}
                </Text>
                {sortBy === opt.key && (
                  <Ionicons name="checkmark-circle" size={18} color={C.brand} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Apply */}
        <View style={{
          padding: 16, paddingBottom: 36,
          borderTopWidth: 1, borderTopColor: C.border,
        }}>
          <TouchableOpacity
            onPress={handleApply}
            style={{
              backgroundColor: C.brand, borderRadius: R.xl,
              padding: 17, alignItems: 'center',
            }}
          >
            <Text style={{ color: C.white, fontWeight: '800', fontSize: 16 }}>
              Хэрэглэх
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
