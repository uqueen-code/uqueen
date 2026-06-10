'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { useReading } from '@/hooks/useReading';
import { useHabits } from '@/hooks/useHabits';
import { DailyRecommendation } from '@/components/reading/DailyRecommendation';
import { ReadingLog } from '@/components/reading/ReadingLog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory } from '@/types/enums';
import toast from 'react-hot-toast';

export default function ReadingPage() {
  const { t } = useTranslation();
  const { dailyBook, todayLogs, didReadToday, logReading, isLoading } = useReading();
  const { habits, toggleHabit } = useHabits();

  const handleLogReading = useCallback(async (data: Parameters<typeof logReading>[0]) => {
    await logReading(data);
    // Auto-check the reading habit if not already checked
    if (!habits[ModuleCategory.READING]) {
      await toggleHabit(ModuleCategory.READING);
    }
    toast.success(`已记录阅读：《${data.bookTitle}》`, { icon: '📚' });
  }, [logReading, habits, toggleHabit]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <LoadingSpinner size="lg" text="加载阅读数据..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#a0724a' }}>
          <BookOpen className="h-7 w-7" />
          {t('reading.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          每日一书，涵养心灵 · 严格筛选文学经典，拒绝快餐阅读
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Recommendation */}
        <div>
          <DailyRecommendation book={dailyBook} />
        </div>

        {/* Reading Log */}
        <div>
          <ReadingLog
            dailyBook={dailyBook}
            todayLogs={todayLogs}
            didReadToday={didReadToday}
            onLog={handleLogReading}
          />
        </div>
      </div>

      {/* Reading stats summary */}
      {todayLogs.length > 0 && (
        <div className="mt-6 module-card" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
            📊 今日阅读摘要
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ background: '#f5e6d3' }}>
              <p className="text-2xl font-bold" style={{ color: '#a0724a' }}>{todayLogs.length}</p>
              <p className="text-xs mt-1" style={{ color: '#7d5535' }}>本书</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: '#f5e6d3' }}>
              <p className="text-2xl font-bold" style={{ color: '#a0724a' }}>
                {todayLogs.reduce((sum, l) => sum + (l.pagesRead ?? 0), 0)}
              </p>
              <p className="text-xs mt-1" style={{ color: '#7d5535' }}>页</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: '#f5e6d3' }}>
              <p className="text-2xl font-bold" style={{ color: didReadToday ? '#22c55e' : '#a0724a' }}>
                {didReadToday ? '✓' : '—'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#7d5535' }}>已打卡</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
