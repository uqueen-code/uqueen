'use client';

import { useState, useCallback } from 'react';
import { Stethoscope, CalendarDays, Salad, Dumbbell, Heart, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Severity, FlowIntensity } from '@/types/enums';
import type { IllnessLog, MenstrualLog, DailyWellness } from '@/types/models';

// ==================== Illness Logger ====================
interface IllnessLoggerProps {
  logs: IllnessLog[];
  onLog: (data: {
    date: string; illnessType: string; severity?: Severity;
    symptoms?: string; medication?: string; recoveryDate?: string; notes?: string;
  }) => Promise<void>;
}
export function IllnessLogger({ logs, onLog }: IllnessLoggerProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]!);
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState<Severity>(Severity.MILD);
  const [symptoms, setSymptoms] = useState('');
  const [medication, setMedication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!type.trim()) return;
    setIsSubmitting(true);
    await onLog({ date, illnessType: type.trim(), severity, symptoms: symptoms.trim() || undefined, medication: medication.trim() || undefined });
    setType(''); setSymptoms(''); setMedication('');
    setIsSubmitting(false);
  }, [date, type, severity, symptoms, medication, onLog]);

  return (
    <div className="module-card" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
        <Stethoscope className="h-5 w-5" style={{ color: '#ec4899' }} />
        疾病记录
      </h2>
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field text-sm flex-1" />
          <select value={severity} onChange={e => setSeverity(e.target.value as Severity)} className="input-field text-sm w-24">
            <option value={Severity.MILD}>{Severity.MILD}</option>
            <option value={Severity.MODERATE}>{Severity.MODERATE}</option>
            <option value={Severity.SEVERE}>{Severity.SEVERE}</option>
          </select>
        </div>
        <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="病症类型（如：感冒、头痛）" className="input-field text-sm" />
        <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="症状描述" className="input-field text-sm" />
        <input type="text" value={medication} onChange={e => setMedication(e.target.value)} placeholder="用药情况" className="input-field text-sm" />
        <button onClick={handleSubmit} disabled={isSubmitting || !type.trim()}
          className="btn-primary w-full text-sm" style={{ '--color-accent': '#ec4899', '--color-accent-hover': '#db2777' } as React.CSSProperties}>
          提交
        </button>
      </div>
      {logs.length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-1 max-h-[200px] overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
          {logs.slice(0, 5).map(l => (
            <div key={l.id} className="flex items-center gap-2 p-2 rounded text-xs" style={{ background: 'var(--color-surface-alt)' }}>
              <span style={{ color: '#ec4899' }}>{l.date}</span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{l.illnessType}</span>
              <span className="ml-auto" style={{ color: 'var(--color-text-muted)' }}>{l.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Menstrual Tracker ====================
interface MenstrualTrackerProps {
  logs: MenstrualLog[];
  lastMenstrual: MenstrualLog | null;
  avgCycleLength: number;
  predictedNextDate: string | null;
  onLog: (data: {
    startDate: string; endDate?: string; cycleLength?: number;
    symptoms?: string; flowIntensity?: FlowIntensity; notes?: string;
  }) => Promise<void>;
}
export function MenstrualTracker({ logs, lastMenstrual, avgCycleLength, predictedNextDate, onLog }: MenstrualTrackerProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]!);
  const [endDate, setEndDate] = useState('');
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>(FlowIntensity.NORMAL);
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const startD = new Date(startDate);
    const endD = endDate ? new Date(endDate) : null;
    const cycleLen = lastMenstrual?.startDate
      ? Math.round((startD.getTime() - new Date(lastMenstrual.startDate).getTime()) / 86400000)
      : undefined;
    await onLog({ startDate, endDate: endDate || undefined, cycleLength: cycleLen, symptoms: symptoms.trim() || undefined, flowIntensity });
    setSymptoms(''); setEndDate('');
    setIsSubmitting(false);
  }, [startDate, endDate, flowIntensity, symptoms, lastMenstrual, onLog]);

  // Generate cycle calendar preview
  const cycleDays: { date: string; isPeriod: boolean; isPredicted: boolean }[] = [];
  if (lastMenstrual) {
    for (let i = -3; i <= avgCycleLength + 5; i++) {
      const d = new Date(new Date(lastMenstrual.startDate).getTime() + i * 86400000);
      const ds = d.toISOString().split('T')[0]!;
      const inPeriod = logs.some(l => {
        const s = l.startDate; const e = l.endDate ?? s;
        return ds >= s && ds <= e;
      });
      cycleDays.push({ date: ds, isPeriod: inPeriod, isPredicted: i >= avgCycleLength - 2 && i <= avgCycleLength + 5 });
    }
  }

  return (
    <div className="module-card" style={{ '--module-accent': '#f472b6' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#f472b6' } as React.CSSProperties}>
        <CalendarDays className="h-5 w-5" style={{ color: '#f472b6' }} />
        经期记录
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: '平均周期', value: `${avgCycleLength}天`, color: '#f472b6' },
          { label: '最近记录', value: lastMenstrual?.startDate ?? '—', color: '#ec4899' },
          { label: '预计下次', value: predictedNextDate ?? '—', color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: s.color + '15' }}>
            <p className="text-[10px]" style={{ color: s.color }}>{s.label}</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Input form */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>开始日期</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field text-sm w-full mt-0.5" />
          </div>
          <div className="flex-1">
            <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>结束日期</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field text-sm w-full mt-0.5" />
          </div>
        </div>
        <select value={flowIntensity} onChange={e => setFlowIntensity(e.target.value as FlowIntensity)} className="input-field text-sm">
          <option value={FlowIntensity.LIGHT}>{FlowIntensity.LIGHT}</option>
          <option value={FlowIntensity.NORMAL}>{FlowIntensity.NORMAL}</option>
          <option value={FlowIntensity.HEAVY}>{FlowIntensity.HEAVY}</option>
        </select>
        <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="症状描述" className="input-field text-sm" />
        <button onClick={handleSubmit} disabled={isSubmitting}
          className="btn-primary w-full text-sm" style={{ '--color-accent': '#f472b6', '--color-accent-hover': '#db2777' } as React.CSSProperties}>
          提交
        </button>
      </div>

      {/* Mini calendar */}
      {cycleDays.length > 0 && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>周期日历</p>
          <div className="grid grid-cols-7 gap-1">
            {['一','二','三','四','五','六','日'].map(d => (
              <div key={d} className="text-center text-[9px] py-0.5" style={{ color: 'var(--color-text-muted)' }}>{d}</div>
            ))}
            {cycleDays.map(d => (
              <div key={d.date}
                className={cn('text-center text-[9px] py-1.5 rounded', d.isPeriod && 'font-bold', d.isPredicted && !d.isPeriod && '')}
                style={{
                  background: d.isPeriod ? '#f472b630' : d.isPredicted ? '#a78bfa15' : 'transparent',
                  color: d.isPeriod ? '#db2777' : d.isPredicted ? '#7c3aed' : 'var(--color-text-muted)',
                }}>
                {new Date(d.date).getDate()}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#f472b630' }} /></span> 经期
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#a78bfa15' }} /></span> 预测
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Daily Wellness ====================
interface DailyWellnessProps {
  wellness: DailyWellness | null;
}
export function DailyWellnessCard({ wellness }: DailyWellnessProps) {

  if (!wellness) return null;

  return (
    <div className="module-card" style={{ '--module-accent': '#a78bfa' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#a78bfa' } as React.CSSProperties}>
        <Heart className="h-5 w-5" style={{ color: '#a78bfa' }} />
        每日健康
      </h2>
      <div className="space-y-3">
        <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Salad className="h-4 w-4" style={{ color: '#22c55e' }} />
            <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>饮食建议</h4>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{wellness.dietRecommendation}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-4 w-4" style={{ color: '#ec4899' }} />
            <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>运动建议</h4>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{wellness.exerciseRecommendation}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>💡 {wellness.wellnessTips}</p>
        </div>
      </div>
    </div>
  );
}
