'use client';

import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Sparkles } from 'lucide-react';
import { useFitness } from '@/hooks/useFitness';
import { useTodos } from '@/hooks/useTodos';
import { WeightTracker } from '@/components/fitness/WeightTracker';
import { WorkoutPlan } from '@/components/fitness/WorkoutPlan';
import { ExerciseCheckin } from '@/components/fitness/ExerciseCheckin';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Priority, ModuleCategory } from '@/types/enums';
import toast from 'react-hot-toast';

export default function FitnessPage() {
  const { t } = useTranslation();
  const {
    fitnessData, plans, exerciseLogs, isLoading,
    saveFitnessData, generatePlan, acceptPlan, logExercise,
    shouldGeneratePlan,
  } = useFitness();
  const { createTodo } = useTodos();

  useEffect(() => {
    if (shouldGeneratePlan && fitnessData) {
      generatePlan(fitnessData);
      toast.success('已自动生成定制健身方案！', { icon: '🎯' });
    }
  }, [shouldGeneratePlan, fitnessData, generatePlan]);

  const handleSaveFitnessData = useCallback(async (data: Parameters<typeof saveFitnessData>[0]) => {
    await saveFitnessData(data);
    toast.success('数据已保存', { icon: '✅' });
  }, [saveFitnessData]);

  const handleAcceptPlan = useCallback(async (planId: string) => {
    const plan = await acceptPlan(planId);
    if (!plan) return null;
    const today = new Date();
    const todoPromises = plan.planData.daily.slice(0, 7).map((dayTask, i) => {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + i);
      return createTodo({
        title: `🏋️ ${dayTask.exercise}`,
        description: dayTask.notes ?? `${dayTask.duration}分钟${dayTask.sets ? ` · ${dayTask.sets}组×${dayTask.reps}次` : ''}`,
        category: ModuleCategory.FITNESS,
        priority: Priority.IMPORTANT,
        dueDate: dueDate.toISOString().split('T')[0],
        isRecurring: false,
      });
    });
    await Promise.all(todoPromises);
    toast.success('方案已接受！未来7天的训练已加入每日待办 🎯');
    return plan;
  }, [acceptPlan, createTodo]);

  const handleLogExercise = useCallback(async (data: Parameters<typeof logExercise>[0]) => {
    await logExercise(data);
  }, [logExercise]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载健身数据..." /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#22c55e' }}>
          <Dumbbell className="h-7 w-7" />
          {t('fitness.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {fitnessData ? '继续坚持，每一天都在变好' : '填写身体数据，自动生成定制方案'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WeightTracker fitnessData={fitnessData} onSave={handleSaveFitnessData} hasPlan={plans.length > 0} />
        </div>
        <div className="lg:col-span-1">
          {plans.length > 0 ? (
            <WorkoutPlan plan={plans[plans.length - 1]!} onAccept={handleAcceptPlan} />
          ) : fitnessData ? (
            <div className="module-card text-center py-8" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
              <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: '#3b82f6' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>正在生成定制方案...</p>
            </div>
          ) : (
            <div className="module-card text-center py-8" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
              <Dumbbell className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>填写左侧身体数据后自动生成定制方案</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <ExerciseCheckin onLog={handleLogExercise} />
          {exerciseLogs.length > 0 && (
            <div className="mt-4 module-card" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
              <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>最近记录</h3>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
                {exerciseLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center gap-2 p-2 rounded text-xs" style={{ background: 'var(--color-surface-alt)' }}>
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{log.exerciseType}</span>
                    {log.durationMinutes && <span style={{ color: 'var(--color-text-muted)' }}>{log.durationMinutes}分钟</span>}
                    <span className="ml-auto" style={{ color: 'var(--color-text-muted)' }}>{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
