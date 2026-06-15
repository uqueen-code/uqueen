'use client';

import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Goal } from '@/types/models';
import { GoalType } from '@/types/enums';
import { EmptyState } from '@/components/shared/EmptyState';

interface GoalWidgetProps {
  goals: Goal[];
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
  onCreateClick: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  [GoalType.YEARLY]: '年度',
  [GoalType.QUARTERLY]: '季度',
  [GoalType.MONTHLY]: '月度',
  [GoalType.CUSTOM]: '自定义',
};

/**
 * Goal Widget — displays yearly/phase goals with progress bars.
 * Auto-sorts: shorter deadline first.
 */
export function GoalWidget({ goals, onUpdateProgress, onDelete, onCreateClick }: GoalWidgetProps) {

  /**
   * Get progress color based on completion percentage.
   */
  const getProgressColor = (progress: number, daysRemaining?: number) => {
    if (progress >= 100) return '#22c55e';
    if (!daysRemaining && daysRemaining !== 0) return '#6366f1';
    if (daysRemaining <= 3 && progress < 80) return '#ef4444';
    if (daysRemaining <= 7) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="module-card h-full" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
          <Target className="h-5 w-5" style={{ color: '#22c55e' }} />
          目标
        </h2>
        <button
          onClick={onCreateClick}
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: 'var(--color-surface-hover)' }}
        >
          <Plus className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title=暂无目标
          description="设定2026年度目标，开始行动"
        />
      ) : (
        <ul className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
          {goals.map((goal) => {
            const progressColor = getProgressColor(goal.progress, goal.daysRemaining);
            return (
              <li key={goal.id} className="p-4 rounded-lg transition-all group" style={{ background: 'var(--color-surface-alt)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {goal.title}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: progressColor + '20', color: progressColor }}>
                        {TYPE_LABELS[goal.type] ?? goal.type}
                      </span>
                      {goal.daysRemaining !== undefined && goal.daysRemaining > 0 && (
                        <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                          goal.daysRemaining}天
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(goal.id)}
                    className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-all ml-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: progressColor }}>
                      {Math.round(goal.progress)}%
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(goal.progress)}
                      onChange={(e) => onUpdateProgress(goal.id, Number(e.target.value))}
                      className="w-24 h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        accentColor: progressColor,
                        background: 'var(--color-surface-hover)',
                      }}
                    />
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(100, goal.progress)}%`,
                        background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Quick summary */}
      {goals.length > 0 && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {goals.filter((g) => g.isCompleted).length}/{goals.length} 已完成
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
            <TrendingUp className="h-3 w-3" />
            {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, goals.length))}% 平均进度
          </span>
        </div>
      )}
    </div>
  );
}
