import { OnboardingLanding, OnboardingConfig } from '../components/OnboardingLanding';

const CONFIG: OnboardingConfig = {
  title: 'Жолооч болох',
  subtitle: 'Өөрийн цагаараа хүргэлт хийж орлого ол',
  color: '#EA580C',
  darkColor: '#431407',
  icon: '🚚',
  steps: [
    { icon: '📝', title: 'Бүртгүүлэх', desc: 'Жолооны үнэмлэх + иргэний' },
    { icon: '✅', title: 'Баталгаажуулах', desc: '24 цагт шалгана' },
    { icon: '📱', title: 'App нээх', desc: 'Онлайн болох' },
    { icon: '💵', title: 'Мөнгө авах', desc: 'Өдөр бүр payout' },
  ],
  stats: [
    { label: 'Нэг хүргэлт', value: '3000₮' },
    { label: 'Payout', value: 'Өдөр' },
    { label: 'Уян хатан', value: '24/7' },
  ],
  cta: 'Жолооч болох',
  ctaRoute: '/(driver)/deliveries',
};

export default function BecomeDriver() {
  return <OnboardingLanding config={CONFIG} />;
}
