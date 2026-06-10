'use client';

import { useTranslation } from 'react-i18next';
import { Clock, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Countdown } from '@/types/models';
import { EmptyState } from '@/components/shared/EmptyState';

interface CountdownWidgetProps {
  countdowns: Countdown[];
  onDelete: (id: string) => void;
  onCreateClick: () => void;
}

/**
 * Countdown Widget — displays important date countdowns.
 * Sorts automatically: shortest remaining first.
 */
export function CountdownWidget({ countdowns, onDelete, onCreateClick }: CountdownWidgetProps) {
  const { t } = useTranslation();

  /**
   * Get urgency styling based on days remaining.
   */
  const getUrgencyStyle = (days: number) => {
    if (days <= 3) return { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', text: '#ef4444', pulse: true };
    if (days <= 7) return { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', text: '#f59e0b', pulse: false };
    if (days <= 30) return { bg: 'rgba(99,102,241,0.08)', border: '#6366f1', text: '#6366f1', pulse: false };
    return { bg: 'var(--color-surface-alt)', border: 'var(--color-border)', text: 'var(--color-success)', pulse: false };
  };

  return (
    <div className="module-card h-full" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
          <Clock className="h-5 w-5" style={{ color: '#f59e0b' }} />
          {t('dashboard.countdowns')}
        </h2>
        <button
          onClick={onCreateClick}
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: 'var(--color-surface-hover)' }}
        >
          <Plus className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {countdowns.length === 0 ? (
        <EmptyState
          title={t('dashboard.noCountdowns')}
          description="添加重要日程的倒计时提醒"
        />
      ) : (
        <ul className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
          {countdowns.map((cd) => {
            const days = cd.daysRemaining ?? 0;
            const style = getUrgencyStyle(days);
            return (
              <li
                key={cd.id}
                className="flex items-center gap-3 p-3 rounded-lg transition-all group relative overflow-hidden"
                style={{
                  background: style.bg,
                  borderLeft: `3px solid ${style.border}`,
                }}
              >
                {/* Pulse indicator for urgent */}
                {style.pulse && (
                  <div
                    className="absolute inset-0 rounded-lg animate-pulse"
                    style={{ background: 'rgba(239,68,68,0.05)' }}
                  />
                )}

                {/* Days number */}
                <div className="flex-shrink-0 text-center min-w-[3rem] relative z-10">
                  <span
                    className={cn('text-2xl font-bold tabular-nums', style.pulse && 'animate-pulse-soft')}
                    style={{ color: style.text }}
                  >
                    {days}
                  </span>
                  <p className="text-[10px] -mt-0.5" style={{ color: style.text, opacity: 0.8 }}>
                    {t('dashboard.daysRemaining')}
                  </p>
                </div>

                {/* Title + date */}
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {cd.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {cd.targetDate}
                    {cd.isRecurring && ' · 每年循环'}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => onDelete(cd.id)}
                  className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-all relative z-10"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
