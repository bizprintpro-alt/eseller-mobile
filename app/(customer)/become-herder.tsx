import { useEffect } from 'react';
import { router } from 'expo-router';
import { OnboardingLanding, OnboardingConfig } from '../components/OnboardingLanding';
import { MALCHNAAS_ENABLED } from '../../src/config/flags';

const CONFIG: OnboardingConfig = {
  title:     'Малчин болох',
  subtitle:  'Малчнаас шууд — зуучлагчгүй зарна, 40-60% илүү орлого',
  color:     '#059669',
  darkColor: '#064E3B',
  icon:      '🌿',
  steps: [
    { icon: '📱', title: 'Бүртгүүлэх',    desc: 'Утас + иргэний үнэмлэх — 2 минут' },
    { icon: '📋', title: 'А данс',         desc: 'МЭАЖГ-н бүртгэл baталгаажуулна' },
    { icon: '📷', title: 'Бараа нэмэх',    desc: 'Зураг, тайлбар, үнэ оруулна' },
    { icon: '💳', title: 'Орлого авах',    desc: 'Хүргэсний дараа 48 цагт банк руу' },
  ],
  stats: [
    { label: 'Комисс',   value: '10%' },
    { label: 'Орлого',   value: '+40%' },
    { label: 'Аймаг',    value: '21' },
  ],
  cta:      'Малчин болох',
  ctaRoute: '/(customer)/register-herder',
};

export default function BecomeHerder() {
  useEffect(() => {
    if (!MALCHNAAS_ENABLED) router.replace('/(customer)/become-seller' as never);
  }, []);
  if (!MALCHNAAS_ENABLED) return null;
  return <OnboardingLanding config={CONFIG} />;
}
