'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, BookOpen, Upload, FolderOpen, CheckCircle2, Circle, Plus, X, ExternalLink } from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { useTodos } from '@/hooks/useTodos';
import { useHabits } from '@/hooks/useHabits';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils/cn';
import { LEARNING_CATEGORIES, ModuleCategory, Priority } from '@/types/enums';
import { getModuleColor } from '@/lib/themes/module-colors';
import toast from 'react-hot-toast';

export default function LearningPage() {
  const { t } = useTranslation();
  const {
    categories, plans, todayLogs, activeCategories,
    isLoading, toggleCategory, savePlan, acceptPlan, logLearning,
  } = useLearning();
  const { createTodo } = useTodos();
  const { habits, toggleHabit } = useHabits();

  // Plan creation form
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planCat, setPlanCat] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planMethod, setPlanMethod] = useState('');
  const [planSchedule, setPlanSchedule] = useState('');
  const [localPath, setLocalPath] = useState('');

  const handleCreatePlan = useCallback(async () => {
    if (!planTitle.trim() || !planCat) return;
    await savePlan({
      category: planCat, title: planTitle.trim(),
      methodDescription: planMethod.trim() || undefined,
      planData: planSchedule.trim() ? { schedule: planSchedule.trim() } : undefined,
      localResourcePath: localPath.trim() || undefined,
    });
    toast.success('学习计划已保存');
    setPlanTitle(''); setPlanMethod(''); setPlanSchedule(''); setLocalPath(''); setShowPlanForm(false);
  }, [planCat, planTitle, planMethod, planSchedule, localPath, savePlan]);

  const handleAcceptPlan = useCallback(async (planId: string) => {
    const plan = await acceptPlan(planId);
    if (!plan) return;
    // Create daily todo for this plan
    await createTodo({
      title: `📖 ${plan.title}`,
      description: plan.methodDescription ?? undefined,
      category: ModuleCategory.LEARNING,
      priority: Priority.IMPORTANT,
      isRecurring: true,
      recurType: 'daily' as any,
      dueDate: new Date().toISOString().split('T')[0],
    });
    // Auto-check learning habit
    if (!habits[ModuleCategory.LEARNING]) await toggleHabit(ModuleCategory.LEARNING);
    toast.success('计划已接受！每日学习任务已加入待办 📖');
  }, [acceptPlan, createTodo, habits, toggleHabit]);

  const handleQuickCheck = useCallback(async (category: string) => {
    await logLearning({ category, completed: true });
    if (!habits[ModuleCategory.LEARNING]) await toggleHabit(ModuleCategory.LEARNING);
    toast.success(`${category} 今日已打卡 ✅`);
  }, [logLearning, habits, toggleHabit]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载学习数据..." /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#8b5cf6' }}>
          <GraduationCap className="h-7 w-7" />
          {t('learning.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          勾选子板块以显示相关内容 · 支持上传学习方法与每日规划
        </p>
      </div>

      {/* Category Selector */}
      <div className="module-card mb-6" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
        <h2 className="section-title" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
          <BookOpen className="h-5 w-5" style={{ color: '#8b5cf6' }} />
          {t('learning.categories')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {LEARNING_CATEGORIES.map(cat => {
            const catData = categories.find(c => c.category === cat);
            const isActive = catData?.isActive ?? false;
            const color = getModuleColor('learning');
            const todayChecked = todayLogs.some(l => l.category === cat);
            return (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all border-2 text-sm font-medium', isActive ? 'shadow-sm' : '')}
                style={{
                  background: isActive ? '#8b5cf612' : 'var(--color-surface-alt)',
                  borderColor: isActive ? '#8b5cf6' : 'var(--color-border)',
                  color: isActive ? '#7c3aed' : 'var(--color-text-secondary)',
                }}>
                <span>{cat}</span>
                {todayChecked && <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active categories content */}
      {activeCategories.length === 0 ? (
        <div className="module-card text-center py-12" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
          <BookOpen className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>请先勾选上方的学习分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCategories.map(cat => {
            const catPlans = plans.filter(p => p.category === cat);
            const catLogs = todayLogs.filter(l => l.category === cat);
            const isComplete = catLogs.some(l => l.completed);
            const color = '#8b5cf6';

            return (
              <div key={cat} className="module-card" style={{ '--module-accent': color } as React.CSSProperties}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold" style={{ color: '#7c3aed' }}>{cat}</h3>
                  <button onClick={() => handleQuickCheck(cat)}
                    className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all', isComplete ? '' : '')}
                    style={{
                      background: isComplete ? '#22c55e18' : 'var(--color-surface-hover)',
                      color: isComplete ? '#22c55e' : 'var(--color-text-muted)',
                    }}>
                    {isComplete ? `✓ ${t('common.completed')}` : '标记完成'}
                  </button>
                </div>

                {/* Plans for this category */}
                {catPlans.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {catPlans.map(plan => (
                      <div key={plan.id} className="p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{plan.title}</span>
                          {plan.isAccepted ? (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#22c55e18', color: '#22c55e' }}>已接受</span>
                          ) : (
                            <button onClick={() => handleAcceptPlan(plan.id)}
                              className="text-xs px-2 py-0.5 rounded btn-primary"
                              style={{ '--color-accent': '#8b5cf6', '--color-accent-hover': '#7c3aed' } as React.CSSProperties}>
                              接受计划
                            </button>
                          )}
                        </div>
                        {plan.methodDescription && (
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{plan.methodDescription}</p>
                        )}
                        {plan.localResourcePath && (
                          <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: '#7c3aed' }}>
                            <FolderOpen className="h-3 w-3" />
                            <span className="truncate">{plan.localResourcePath}</span>
                            <ExternalLink className="h-3 w-3 cursor-pointer" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 mb-3">
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>暂无学习计划</p>
                  </div>
                )}

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button onClick={() => { setPlanCat(cat); setShowPlanForm(true); }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors"
                    style={{ background: '#8b5cf612', color: '#7c3aed' }}>
                    <Plus className="h-3.5 w-3.5" /> 添加计划
                  </button>
                  {catPlans.some(p => p.localResourcePath) && (
                    <button
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors"
                      style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}>
                      <ExternalLink className="h-3.5 w-3.5" /> 打开本地资料
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan creation modal */}
      {showPlanForm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowPlanForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-slide-up" onClick={() => setShowPlanForm(false)}>
            <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl" style={{ background: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#7c3aed' }}>创建 {planCat} 学习计划</h3>
                <button onClick={() => setShowPlanForm(false)}><X className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} /></button>
              </div>
              <div className="space-y-3">
                <input type="text" value={planTitle} onChange={e => setPlanTitle(e.target.value)}
                  placeholder="计划标题" className="input-field text-sm" autoFocus />
                <textarea value={planMethod} onChange={e => setPlanMethod(e.target.value)}
                  placeholder="学习方法描述..." className="input-field min-h-[80px] text-sm" />
                <textarea value={planSchedule} onChange={e => setPlanSchedule(e.target.value)}
                  placeholder="每日学习规划（可选）&#10;例如：上午9:00-11:00 专项练习" className="input-field min-h-[60px] text-sm" />
                <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
                  <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <input type="text" value={localPath} onChange={e => setLocalPath(e.target.value)}
                    placeholder="本地资料路径（如 D:\学习\雅思）" className="bg-transparent text-sm w-full outline-none" style={{ color: 'var(--color-text-primary)' }} />
                </div>
                <button onClick={handleCreatePlan} disabled={!planTitle.trim()}
                  className="btn-primary w-full" style={{ '--color-accent': '#8b5cf6', '--color-accent-hover': '#7c3aed' } as React.CSSProperties}>
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
