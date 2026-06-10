'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  Target,
  X,
} from 'lucide-react';
import { useTodos } from '@/hooks/useTodos';
import { useHabits } from '@/hooks/useHabits';
import { useGoals } from '@/hooks/useGoals';
import { useCountdowns } from '@/hooks/useCountdowns';
import { TodoWidget } from '@/components/dashboard/TodoWidget';
import { TodoCreator } from '@/components/dashboard/TodoCreator';
import { CountdownWidget } from '@/components/dashboard/CountdownWidget';
import { GoalWidget } from '@/components/dashboard/GoalWidget';
import { HabitTracker } from '@/components/dashboard/HabitTracker';
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar';
import { GoalType, Priority, RecurType, type HabitCategory } from '@/types/enums';
import type { ActivityEntry } from '@/types/models';

/**
 * Dashboard Page — Phase 2 Full Implementation.
 *
 * Layout:
 * - Row 1: TodoCreator (collapsible)
 * - Row 2: 3-column grid (Todos | Countdowns | Goals)
 * - Row 3: HabitTracker
 * - Row 4: HeatmapCalendar
 */
export default function DashboardPage() {
  const { t } = useTranslation();

  // Data hooks
  const {
    todos,
    todayTodos,
    tomorrowTodos,
    createTodo,
    toggleTodo,
    deleteTodo,
    isLoading: todosLoading,
  } = useTodos();

  const {
    habits,
    toggleHabit,
    completedCount,
    totalCount,
  } = useHabits();

  const {
    goals,
    createGoal,
    updateProgress,
    deleteGoal,
    isLoading: goalsLoading,
  } = useGoals();

  const {
    countdowns,
    createCountdown,
    deleteCountdown,
    isLoading: cdLoading,
  } = useCountdowns();

  // Build activity data for heatmap
  const activityData = useMemo<ActivityEntry[]>(() => {
    const entries: ActivityEntry[] = [];
    // Completed todos by date
    todos.filter(t => t.isCompleted && t.completedAt).forEach(t => {
      const date = t.completedAt!.split('T')[0]!;
      entries.push({ date, activityType: 'todo', detail: t.category ?? 'general' });
    });
    // Habit logs from loaded data — we'll use the habits state for today
    Object.entries(habits).forEach(([cat, completed]) => {
      if (completed) {
        entries.push({ date: new Date().toISOString().split('T')[0]!, activityType: 'habit', detail: cat });
      }
    });
    return entries;
  }, [todos, habits]);

  // Modal state for inline creation
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showCountdownForm, setShowCountdownForm] = useState(false);
  const [selectedHeatmapModule, setSelectedHeatmapModule] = useState<string | undefined>(undefined);

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalType, setGoalType] = useState<GoalType>(GoalType.YEARLY);
  const [goalDeadline, setGoalDeadline] = useState('');

  // Countdown form state
  const [cdTitle, setCdTitle] = useState('');
  const [cdDate, setCdDate] = useState('');
  const [cdIsRecurring, setCdIsRecurring] = useState(false);

  // ---- Handlers ----

  const handleCreateTodo = useCallback(async (data: { title: string; description?: string; category?: string; priority: Priority; isRecurring: boolean; recurType: RecurType | null; recurConfig?: { lunarMonth?: number; lunarDay?: number; monthDay?: number }; dueDate?: string; dueTime?: string; isBirthdayReminder: boolean; birthdayPerson?: string; birthdayIsLunar: boolean }) => {
    await createTodo({
      title: data.title, description: data.description, category: data.category,
      priority: data.priority, isRecurring: data.isRecurring,
      recurType: data.recurType ?? undefined, recurConfig: data.recurConfig,
      dueDate: data.dueDate, dueTime: data.dueTime,
      isBirthdayReminder: data.isBirthdayReminder, birthdayPerson: data.birthdayPerson,
      birthdayIsLunar: data.birthdayIsLunar,
    });
  }, [createTodo]);

  const handleCreateGoal = useCallback(async () => {
    if (!goalTitle.trim()) return;
    await createGoal({
      title: goalTitle.trim(),
      description: goalDescription.trim() || undefined,
      type: goalType,
      deadline: goalDeadline || undefined,
      year: 2026,
    });
    setGoalTitle('');
    setGoalDescription('');
    setGoalDeadline('');
    setShowGoalForm(false);
  }, [goalTitle, goalDescription, goalType, goalDeadline, createGoal]);

  const handleCreateCountdown = useCallback(async () => {
    if (!cdTitle.trim() || !cdDate) return;
    await createCountdown({
      title: cdTitle.trim(),
      targetDate: cdDate,
      isRecurring: cdIsRecurring,
      recurType: cdIsRecurring ? RecurType.YEARLY : undefined,
    });
    setCdTitle('');
    setCdDate('');
    setCdIsRecurring(false);
    setShowCountdownForm(false);
  }, [cdTitle, cdDate, cdIsRecurring, createCountdown]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {t('dashboard.title')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        {/* Sync status indicator */}
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <div className="h-2 w-2 rounded-full" style={{ background: 'var(--color-success)' }} />
          {t('common.synced')}
        </div>
      </div>

      {/* Todo Creator (always visible, collapsed by default) */}
      <div className="mb-6">
        <TodoCreator onSave={handleCreateTodo} />
      </div>

      {/* Three-column grid: Todos | Countdowns | Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Column 1: Todos */}
        <div className="lg:col-span-1 space-y-4">
          <TodoWidget
            title={t('dashboard.todayTodos')}
            icon={<CheckCircle2 className="h-5 w-5" style={{ color: '#6366f1' }} />}
            todos={todayTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            accentColor="#6366f1"
            showDate
          />

          <TodoWidget
            title={t('dashboard.tomorrowTodos')}
            icon={<Clock className="h-5 w-5" style={{ color: '#818cf8' }} />}
            todos={tomorrowTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            accentColor="#818cf8"
            showDate
          />
        </div>

        {/* Column 2: Countdowns */}
        <div className="lg:col-span-1">
          {showCountdownForm ? (
            <div className="module-card animate-slide-down" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {t('dashboard.createCountdown')}
                </h3>
                <button onClick={() => setShowCountdownForm(false)} className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={cdTitle}
                  onChange={(e) => setCdTitle(e.target.value)}
                  placeholder="倒计时标题..."
                  className="input-field text-sm"
                  autoFocus
                />
                <input
                  type="date"
                  value={cdDate}
                  onChange={(e) => setCdDate(e.target.value)}
                  className="input-field text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={cdIsRecurring}
                    onChange={(e) => setCdIsRecurring(e.target.checked)}
                    className="checkbox-custom"
                  />
                  每年循环
                </label>
                <button
                  onClick={handleCreateCountdown}
                  disabled={!cdTitle.trim() || !cdDate}
                  className="btn-primary w-full text-sm"
                  style={{ '--color-accent': '#f59e0b', '--color-accent-hover': '#d97706' } as React.CSSProperties}
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          ) : (
            <CountdownWidget
              countdowns={countdowns}
              onDelete={deleteCountdown}
              onCreateClick={() => setShowCountdownForm(true)}
            />
          )}
        </div>

        {/* Column 3: Goals */}
        <div className="lg:col-span-1">
          {showGoalForm ? (
            <div className="module-card animate-slide-down" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {t('dashboard.createGoal')}
                </h3>
                <button onClick={() => setShowGoalForm(false)} className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="目标标题..."
                  className="input-field text-sm"
                  autoFocus
                />
                <textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="目标描述（可选）"
                  className="input-field min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as GoalType)}
                    className="input-field text-sm flex-1"
                  >
                    {Object.values(GoalType).map((gt) => (
                      <option key={gt} value={gt}>
                        {gt === GoalType.YEARLY ? '年度目标' :
                         gt === GoalType.QUARTERLY ? '季度目标' :
                         gt === GoalType.MONTHLY ? '月度目标' : '自定义'}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="input-field text-sm"
                    placeholder="截止日期"
                  />
                </div>
                <button
                  onClick={handleCreateGoal}
                  disabled={!goalTitle.trim()}
                  className="btn-primary w-full text-sm"
                  style={{ '--color-accent': '#22c55e', '--color-accent-hover': '#16a34a' } as React.CSSProperties}
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          ) : (
            <GoalWidget
              goals={goals}
              onUpdateProgress={updateProgress}
              onDelete={deleteGoal}
              onCreateClick={() => setShowGoalForm(true)}
            />
          )}
        </div>
      </div>

      {/* Habit Tracker */}
      <div className="mb-6">
        <HabitTracker
          habits={habits}
          onToggle={toggleHabit}
          completedCount={completedCount}
          totalCount={totalCount}
        />
      </div>

      {/* Activity Heatmap */}
      <HeatmapCalendar
        activities={activityData}
        selectedModule={selectedHeatmapModule}
        onModuleChange={setSelectedHeatmapModule}
      />
    </div>
  );
}
