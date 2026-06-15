'use client';

import { CalendarCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { HABIT_CATEGORIES, type HabitCategory } from '@/types/enums';
import { MODULE_COLORS } from '@/lib/themes/module-colors';
import type { HabitState } from '@/hooks/useHabits';

interface HabitTrackerProps {
  habits: HabitState;
  onToggle: (category: HabitCategory) => void;
  completedCount: number;
  totalCount: number;
}

/**
 * Daily Habit Tracker — 7 quick-check habit categories.
 * Each habit uses its module's accent color when checked.
 */
export function HabitTracker({ habits, onToggle, completedCount, totalCount }: HabitTrackerProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="module-card" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
          <CalendarCheck className="h-5 w-5" style={{ color: '#6366f1' }} />
          习惯打卡
        </h2>
        {/* Progress badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--color-surface-alt)' }}>
          <TrendingUp className="h-3.5 w-3.5" style={{ color: completedCount === totalCount ? '#22c55e' : 'var(--color-accent)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {completedCount}/{totalCount}
          </span>
          {percentage > 0 && (
            <span style={{ color: percentage === 100 ? '#22c55e' : 'var(--color-accent)' }}>
              ({percentage}%)
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: percentage === 100
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : 'linear-gradient(90deg, #6366f1, #818cf8)',
          }}
        />
      </div>

      {/* Habit grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {HABIT_CATEGORIES.map((category) => {
          const isChecked = habits[category] ?? false;
          const colors = MODULE_COLORS[category] ?? MODULE_COLORS.dashboard;
          const color = colors?.DEFAULT ?? '#6366f1';

          return (
            <button
              key={category}
              onClick={() => onToggle(category)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200',
                isChecked ? 'shadow-md' : 'hover:shadow-sm'
              )}
              style={{
                background: isChecked
                  ? `${color}18`
                  : 'var(--color-surface-alt)',
                border: `2px solid ${isChecked ? color : 'var(--color-border)'}`,
                transform: isChecked ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  'h-6 w-6 rounded-md flex items-center justify-center transition-all',
                  isChecked ? 'text-white' : ''
                )}
                style={{
                  background: isChecked ? color : 'var(--color-surface-hover)',
                  border: isChecked ? 'none' : '2px solid var(--color-border)',
                }}
              >
                {isChecked && (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className={cn('text-xs font-medium transition-colors')}
                style={{
                  color: isChecked ? color : 'var(--color-text-secondary)',
                }}
              >
                category === 'fitness' ? '健身' : category === 'reading' ? '阅读' : category === 'learning' ? '学习' : category === 'speaking' ? '口语' : category === 'health' ? '健康' : category === 'psychology' ? '心理' : category
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
