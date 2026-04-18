import { OnboardingLanding, OnboardingConfig } from '../components/OnboardingLanding';

const CONFIG: OnboardingConfig = {
  title: 'Борлуулагч болох',
  subtitle: 'Referral линкээр бараа зарж комисс ав',
  color: '#7C3AED',
  darkColor: '#2D1B69',
  icon: '📢',
  steps: [
    { icon: '📝', title: 'Бүртгүүлэх', desc: 'Хялбар бүртгэл — 2 минут' },
    { icon: '🔗', title: 'Линк авах', desc: 'Өөрийн referral линк үүсгэ' },
    { icon: '📱', title: 'Share хийх', desc: 'Instagram, TikTok, Facebook' },
    { icon: '💰', title: 'Комисс авах', desc: 'Борлуулалт тутамд 5% авна' },
  ],
  stats: [
    { label: 'Комисс', value: '5%' },
    { label: 'Payout', value: 'Өдөр' },
    { label: 'Хязгаар', value: '∞' },
  ],
  cta: 'Борлуулагч болох',
  ctaRoute: '/(seller)/dashboard',
};

export default function BecomeSeller() {
  return <OnboardingLanding config={CONFIG} />;
}
