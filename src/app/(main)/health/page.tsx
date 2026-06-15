'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Pill, Soup, Sparkles, X, AlertCircle } from 'lucide-react';
import { useHealth } from '@/hooks/useHealth';
import { useHabits } from '@/hooks/useHabits';
import { useTodos } from '@/hooks/useTodos';
import { IllnessLogger, MenstrualTracker, DailyWellnessCard } from '@/components/health/HealthWidgets';
import { MedicationTracker } from '@/components/health/MedicationTracker';
import { BloodNourishRecipe } from '@/components/health/BloodNourishRecipe';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory, Priority, Severity, TodoSource } from '@/types/enums';
import type { MedicationLog } from '@/types/models';
import toast from 'react-hot-toast';

// Daily motivational quotes for health
const MOTIVATIONAL_QUOTES = [
  '运动是最好的医生，汗水是最好的药物。今天也要动起来！💪',
  '健康不是一切，但没有健康就没有一切。关爱自己，从今天开始。',
  '身体是你灵魂的庙宇，请好好维护它。每一天都是修复的机会。',
  '最好的投资是投资自己的健康，复利效应超乎想象。',
  '你的身体值得最好的对待——健康饮食、充足睡眠、规律运动。',
  '没有任何成功可以替代健康的失败。健康第一！',
  '照顾好自己的身体，这是你唯一必须居住一生的地方。',
  '每一天都是让身体更健康的新机会。今天，你爱自己了吗？',
  '养生不是老年人的专利，年轻人更要懂得未雨绸缪。',
  '累了就休息，不是放弃，是为了更好地出发。',
  '多喝热水不是敷衍，是对身体最温柔的关怀。',
  '健康的生活方式不是约束，而是通往自由的钥匙。',
  '你今天对身体的每一次善待，未来的你都会感激。',
  '运动后的疲惫是快乐的，因为你知道自己在变好。',
  '人生最大的财富不是金钱，而是健康的身心。',
];

// Blood-nourishing recipes data
const BLOOD_NOURISH_RECIPES = [
  {
    name: '红枣桂圆枸杞茶',
    ingredients: '红枣5颗、桂圆10颗、枸杞15粒、红糖适量',
    method: '所有材料洗净，放入养生壶加水煮15分钟，加红糖调味即可。每日一杯。',
    benefit: '补气血、安神助眠，适合气血不足、手脚冰凉者。',
    icon: '🍵',
  },
  {
    name: '当归生姜羊肉汤',
    ingredients: '羊肉500g、当归10g、生姜5片、枸杞适量、盐少许',
    method: '羊肉焯水去腥，加水与当归、生姜炖1.5小时，出锅前加枸杞和盐。',
    benefit: '温经散寒、补血养气，冬季滋补佳品。',
    icon: '🍲',
  },
  {
    name: '五红汤',
    ingredients: '红豆50g、红枣8颗、红皮花生30g、枸杞15g、红糖适量',
    method: '红豆花生提前浸泡2小时，加红枣煮至软烂，加枸杞红糖再煮10分钟。',
    benefit: '补气养血、美容养颜，适合女性日常调理。',
    icon: '🥣',
  },
  {
    name: '黑芝麻核桃糊',
    ingredients: '黑芝麻50g、核桃30g、糯米20g、冰糖适量',
    method: '黑芝麻炒香，所有材料加500ml水用豆浆机打成糊即可。',
    benefit: '补肾养血、乌发润肤，适合贫血、脱发人群。',
    icon: '🥜',
  },
  {
    name: '菠菜猪肝汤',
    ingredients: '猪肝200g、菠菜150g、生姜3片、枸杞适量',
    method: '猪肝切片泡水去血水，水开后放入姜片猪肝煮3分钟，加菠菜枸杞再煮1分钟。',
    benefit: '补铁补血、养肝明目，改善缺铁性贫血。',
    icon: '🥬',
  },
];

export default function HealthPage() {
  const {
    illnessLogs, menstrualLogs, dailyWellness,
    lastMenstrual, avgCycleLength, predictedNextDate,
    medicationLogs, isLoading,
    logIllness, logMenstrual, logMedication, deleteMedication,
  } = useHealth();
  const { habits, toggleHabit } = useHabits();
  const { createTodo } = useTodos();

  // Motivational popup
  const [showMotivation, setShowMotivation] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]!);
    const dismissed = localStorage.getItem('health_motivation_dismissed');
    const today = new Date().toDateString();
    if (dismissed !== today) {
      setShowMotivation(true);
    }
  }, []);

  const dismissMotivation = () => {
    setShowMotivation(false);
    localStorage.setItem('health_motivation_dismissed', new Date().toDateString());
  };

  const handleLogIllness = async (data: {
    date: string; illnessType: string; severity?: Severity;
    symptoms?: string; medication?: string; recoveryDate?: string; notes?: string;
  }) => {
    await logIllness(data);
    if (!habits[ModuleCategory.HEALTH]) await toggleHabit(ModuleCategory.HEALTH);
    toast.success('生病记录已保存，祝你早日康复 ❤️');
  };

  const handleLogMenstrual = async (data: Parameters<typeof logMenstrual>[0]) => {
    await logMenstrual(data);
    if (!habits[ModuleCategory.HEALTH]) await toggleHabit(ModuleCategory.HEALTH);
    toast.success('月经记录已保存');
  };

  const handleLogMedication = useCallback(async (data: {
    medicationName: string; reason: string; startDate: string;
    duration: string; dosage?: string; notes?: string;
  }) => {
    await logMedication(data);
    if (!habits[ModuleCategory.HEALTH]) await toggleHabit(ModuleCategory.HEALTH);

    // Auto-create todo for medication
    const endDate = new Date(data.startDate);
    const durMatch = data.duration.match(/(\d+)/);
    if (durMatch) {
      endDate.setDate(endDate.getDate() + parseInt(durMatch[1]));
    } else {
      endDate.setDate(endDate.getDate() + 7);
    }
    await createTodo({
      title: `💊 服药：${data.medicationName}`,
      description: `原因：${data.reason}\n用法：${data.dosage || '遵医嘱'}\n疗程至：${endDate.toISOString().split('T')[0]}`,
      category: ModuleCategory.HEALTH,
      priority: Priority.IMPORTANT,
      dueDate: endDate.toISOString().split('T')[0],
      isRecurring: false,
    });

    toast.success('用药记录已保存，已同步添加到待办 💊');
  }, [logMedication, habits, toggleHabit, createTodo]);

  const handleDeleteMedication = useCallback(async (id: string) => {
    await deleteMedication(id);
    toast.success('用药记录已删除');
  }, [deleteMedication]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载健康数据..." /></div>;
  }

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayRecipe = BLOOD_NOURISH_RECIPES[dayOfYear % BLOOD_NOURISH_RECIPES.length]!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Motivational Popup */}
      {showMotivation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card p-6 max-w-md w-full animate-slide-down relative" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
            <button onClick={dismissMotivation} className="absolute top-3 right-3 p-1 rounded-lg" style={{ background: 'var(--color-surface-hover)' }}>
              <X className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#ec4899' }}>💪 今日提醒</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-primary)' }}>{dailyQuote}</p>
              <button onClick={dismissMotivation}
                className="btn-primary text-sm px-6"
                style={{ '--color-accent': '#ec4899', '--color-accent-hover': '#db2777' } as React.CSSProperties}>
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#ec4899' }}>
          <Heart className="h-7 w-7" />
          健康管理
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          女性友好 · 全面呵护你的健康 · 科学调理每一天
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Illness Logger + Medication Tracker */}
        <div className="space-y-6">
          <IllnessLogger logs={illnessLogs} onLog={handleLogIllness} />
          <MedicationTracker
            logs={medicationLogs || []}
            onLog={handleLogMedication}
            onDelete={handleDeleteMedication}
          />
        </div>

        {/* Column 2: Menstrual Tracker + Blood Nourish Recipe */}
        <div className="space-y-6">
          <MenstrualTracker
            logs={menstrualLogs}
            lastMenstrual={lastMenstrual}
            avgCycleLength={avgCycleLength}
            predictedNextDate={predictedNextDate}
            onLog={handleLogMenstrual}
          />
          <BloodNourishRecipe recipe={todayRecipe} />
        </div>

        {/* Column 3: Daily Wellness */}
        <DailyWellnessCard wellness={dailyWellness} />
      </div>
    </div>
  );
}
