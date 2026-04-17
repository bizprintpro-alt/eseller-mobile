import { OnboardingLanding, OnboardingConfig } from '../components/OnboardingLanding';

const CONFIG: OnboardingConfig = {
  title: 'Dropship',
  subtitle: 'Stock хэрэггүйгээр дэлхий даяараас захиал, зар',
  color: '#16A34A',
  darkColor: '#14532D',
  icon: '🌏',
  steps: [
    { icon: '🔗', title: 'Бүртгүүлэх',   desc: 'Хялбар бүртгэл — 2 минут' },
    { icon: '🛍️', title: 'Бараа сонгох', desc: '1688, Aliexpress, Taobao' },
    { icon: '📦', title: 'Захиалга авах', desc: 'Хэрэглэгч захиална' },
    { icon: '🚚', title: 'Шууд хүргэлт', desc: 'Нийлүүлэгчээс шууд явна' },
  ],
  stats: [
    { label: 'Stock',      value: '0' },
    { label: 'Ашиг',       value: '15%+' },
    { label: 'Эх сурвалж', value: '3' },
  ],
  cta: 'Dropship эхлэх',
  ctaRoute: '/(seller)/catalog',
};

export default function Dropship() {
  return <OnboardingLanding config={CONFIG} />;
}