'use client';

import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Trash2, AlertTriangle, Star, Clock, Cake } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Priority } from '@/types/enums';
import { getRelativeDateLabel } from '@/lib/utils/date';
import type { Todo } from '@/types/models';
import { EmptyState } from '@/components/shared/EmptyState';

interface TodoWidgetProps {
  title: string;
  icon: React.ReactNode;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  accentColor?: string;
  showDate?: boolean;
}

const PRIORITY_STYLES: Record<string, { border: string; bg: string }> = {
  [Priority.URGENT]: { border: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  [Priority.IMPORTANT]: { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  [Priority.NORMAL]: { border: 'transparent', bg: 'transparent' },
};

/**
 * Todo Widget — displays a list of todos with check/delete actions.
 * Supports priority-based sorting and visual indicators.
 */
export function TodoWidget({ title, icon, todos, onToggle, onDelete, accentColor, showDate }: TodoWidgetProps) {
  const { t } = useTranslation();

  return (
    <div className="module-card" style={{ '--module-accent': accentColor ?? '#6366f1' } as React.CSSProperties}>
      <h2
        className="section-title mb-3"
        style={{ '--module-accent': accentColor ?? '#6366f1' } as React.CSSProperties}
      >
        {icon}
        {title}
        {todos.length > 0 && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>
            {todos.length}
          </span>
        )}
      </h2>

      {todos.length === 0 ? (
        <EmptyState title={t('dashboard.noTodos')} />
      ) : (
        <ul className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-hide">
          {todos.map((todo) => {
            const priorityStyle = PRIORITY_STYLES[todo.priority] ?? PRIORITY_STYLES.normal;
            return (
              <li
                key={todo.id}
                className={cn(
                  'flex items-start gap-2.5 p-2.5 rounded-lg transition-all group',
                  todo.isCompleted && 'opacity-60'
                )}
                style={{ background: priorityStyle.bg, borderLeft: `3px solid ${priorityStyle.border}` }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => onToggle(todo.id)}
                  className="flex-shrink-0 mt-0.5 transition-colors"
                  style={{ color: todo.isCompleted ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                >
                  {todo.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Priority indicator */}
                    {todo.priority === Priority.URGENT && (
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#ef4444' }} />
                    )}
                    {todo.priority === Priority.IMPORTANT && (
                      <Star className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                    )}
                    {/* Birthday */}
                    {todo.isBirthdayReminder && (
                      <Cake className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#ec4899' }} />
                    )}

                    <span
                      className={cn('text-sm', todo.isCompleted && 'line-through')}
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {todo.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    {showDate && todo.dueDate && (
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock className="h-3 w-3" />
                        {getRelativeDateLabel(todo.dueDate)}
                      </span>
                    )}
                    {todo.isRecurring && (
                      <span className="text-xs px-1 rounded" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>
                        循环
                      </span>
                    )}
                    {todo.isBirthdayReminder && todo.birthdayPerson && (
                      <span className="text-xs" style={{ color: '#ec4899' }}>
                        🎂 {todo.birthdayPerson}{todo.birthdayIsLunar ? ' (农历)' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => onDelete(todo.id)}
                  className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
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
