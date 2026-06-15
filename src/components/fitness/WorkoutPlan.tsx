'use client';

import { useState } from 'react';
import { Target, Check, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';
import type { FitnessPlan } from '@/types/models';

interface WorkoutPlanProps {
  plan: FitnessPlan;
  onAccept: (planId: string) => Promise<FitnessPlan | null | undefined>;
}

export function WorkoutPlan({ plan, onAccept }: WorkoutPlanProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(plan.isAccepted);

  const handleAccept = async () => {
    setIsAccepting(true);
    const result = await onAccept(plan.id);
    if (result) setIsAccepted(true);
    setIsAccepting(false);
  };

  const todayDay = new Date().getDate();
  const todayPlan = plan.planData.daily[todayDay - 1];

  return (
    <div className="module-card" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
          <Target className="h-5 w-5" style={{ color: '#3b82f6' }} />
          {plan.name}
        </h2>
        {isAccepted ? (
          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: '#22c55e20', color: '#22c55e' }}>
            <Check className="h-3 w-3" /> 已接受
          </span>
        ) : (
          <button onClick={handleAccept} disabled={isAccepting}
            className="btn-primary text-xs px-3 py-1.5"
            style={{ '--color-accent': '#3b82f6', '--color-accent-hover': '#2563eb' } as React.CSSProperties}>
            {isAccepting ? '加载中...' : '接受方案'}
          </button>
        )}
      </div>

      {/* Today's workout */}
      {todayPlan && (
        <div className="p-4 rounded-lg mb-4" style={{ background: '#3b82f610', border: '1px solid #3b82f630' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#3b82f6' }}>
            <Calendar className="h-3 w-3 inline mr-1" /> 今日训练 · Day {todayDay}
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{todayPlan.exercise}</p>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span><Clock className="h-3 w-3 inline mr-1" />{todayPlan.duration}分钟</span>
            {todayPlan.sets && todayPlan.reps && <span>{todayPlan.sets}组 × {todayPlan.reps}次</span>}
          </div>
          {todayPlan.notes && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{todayPlan.notes}</p>}
        </div>
      )}

      {/* Monthly goals */}
      <div className="mb-4">
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>月度目标</p>
        <div className="space-y-1.5">
          {plan.planData.monthly.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs p-2 rounded" style={{ background: 'var(--color-surface-alt)' }}>
              <span className="font-medium px-1.5 py-0.5 rounded" style={{ background: '#3b82f620', color: '#3b82f6' }}>M{m.month}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{m.goal}</span>
              {m.targetWeight && <span className="ml-auto" style={{ color: 'var(--color-text-muted)' }}>目标 {m.targetWeight}kg</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 30-day detail (expandable) */}
      <div>
        <button onClick={() => setExpandedDay(expandedDay === null ? 0 : null)}
          className="flex items-center gap-1 text-xs w-full py-2" style={{ color: 'var(--color-text-muted)' }}>
          {expandedDay === null ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          30天详细计划
        </button>
        {expandedDay !== null && (
          <div className="space-y-1 max-h-[250px] overflow-y-auto scrollbar-hide animate-slide-down">
            {plan.planData.daily.map((d, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded text-xs"
                style={{ background: (i + 1) === todayDay ? '#3b82f610' : 'var(--color-surface-alt)' }}>
                <span className="w-8 text-center font-medium" style={{ color: (i + 1) === todayDay ? '#3b82f6' : 'var(--color-text-muted)' }}>
                  D{d.day}
                </span>
                <span className="flex-1" style={{ color: 'var(--color-text-primary)' }}>{d.exercise}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{d.duration}min</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
