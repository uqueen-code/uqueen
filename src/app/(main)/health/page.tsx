'use client';

import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { useHealth } from '@/hooks/useHealth';
import { useHabits } from '@/hooks/useHabits';
import { IllnessLogger, MenstrualTracker, DailyWellnessCard } from '@/components/health/HealthWidgets';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory } from '@/types/enums';
import toast from 'react-hot-toast';

export default function HealthPage() {
  const { t } = useTranslation();
  const {
    illnessLogs, menstrualLogs, dailyWellness,
    lastMenstrual, avgCycleLength, predictedNextDate,
    isLoading, logIllness, logMenstrual,
  } = useHealth();
  const { habits, toggleHabit } = useHabits();

  const handleLogIllness = async (data: Parameters<typeof logIllness>[0]) => {
    await logIllness(data);
    if (!habits[ModuleCategory.HEALTH]) await toggleHabit(ModuleCategory.HEALTH);
    toast.success('生病记录已保存，祝你早日康复 ❤️');
  };

  const handleLogMenstrual = async (data: Parameters<typeof logMenstrual>[0]) => {
    await logMenstrual(data);
    if (!habits[ModuleCategory.HEALTH]) await toggleHabit(ModuleCategory.HEALTH);
    toast.success('月经记录已保存');
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载健康数据..." /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#ec4899' }}>
          <Heart className="h-7 w-7" />
          {t('health.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          女性友好 · 全面呵护你的健康 · 科学调理每一天
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Illness Logger */}
        <IllnessLogger logs={illnessLogs} onLog={handleLogIllness} />

        {/* Column 2: Menstrual Tracker */}
        <MenstrualTracker
          logs={menstrualLogs}
          lastMenstrual={lastMenstrual}
          avgCycleLength={avgCycleLength}
          predictedNextDate={predictedNextDate}
          onLog={handleLogMenstrual}
        />

        {/* Column 3: Daily Wellness */}
        <DailyWellnessCard wellness={dailyWellness} />
      </div>
    </div>
  );
}
