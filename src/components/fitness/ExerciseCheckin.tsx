'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Clock, Zap, Plus, PartyPopper } from 'lucide-react';
import { EXERCISE_TYPES, type Intensity } from '@/types/enums';
import { EXERCISE_MOTIVATIONS } from '@/hooks/useFitness';

interface ExerciseCheckinProps {
  onLog: (data: {
    exerciseType: string; durationMinutes?: number;
    intensity?: Intensity; caloriesBurned?: number; notes?: string;
  }) => Promise<void>;
}

const INTENSITY_OPTIONS: { value: Intensity; label: string; color: string }[] = [
  { value: '低' as Intensity, label: '低强度', color: '#22c55e' },
  { value: '中' as Intensity, label: '中强度', color: '#f59e0b' },
  { value: '高' as Intensity, label: '高强度', color: '#ef4444' },
];

export function ExerciseCheckin({ onLog }: ExerciseCheckinProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('');
  const [customType, setCustomType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<Intensity | ''>('');
  const [calories, setCalories] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationText, setMotivationText] = useState('');

  const handleSubmit = useCallback(async () => {
    const type = selectedType === '其他' ? customType : selectedType;
    if (!type) return;
    setIsSubmitting(true);
    try {
      await onLog({
        exerciseType: type,
        durationMinutes: duration ? parseInt(duration) : undefined,
        intensity: intensity || undefined,
        caloriesBurned: calories ? parseInt(calories) : undefined,
      });
      // Show motivational message
      const msg = EXERCISE_MOTIVATIONS[Math.floor(Math.random() * EXERCISE_MOTIVATIONS.length)]!;
      setMotivationText(msg);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 4000);
      // Reset
      setSelectedType(''); setCustomType(''); setDuration(''); setIntensity(''); setCalories('');
    } finally { setIsSubmitting(false); }
  }, [selectedType, customType, duration, intensity, calories, onLog]);

  return (
    <div className="module-card relative" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
        <Flame className="h-5 w-5" style={{ color: '#f59e0b' }} />
        {t('fitness.exerciseCheckin')}
      </h2>

      <div className="space-y-3">
        {/* Exercise type grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {[...EXERCISE_TYPES].map(ex => (
            <button key={ex} onClick={() => setSelectedType(ex)}
              className="p-2 rounded-lg text-xs font-medium transition-all border-2"
              style={{
                background: selectedType === ex ? '#f59e0b18' : 'var(--color-surface-alt)',
                borderColor: selectedType === ex ? '#f59e0b' : 'var(--color-border)',
                color: selectedType === ex ? '#d97706' : 'var(--color-text-secondary)',
              }}>
              {ex}
            </button>
          ))}
        </div>

        {selectedType === '其他' && (
          <input type="text" value={customType} onChange={e => setCustomType(e.target.value)}
            placeholder="输入运动类型..." className="input-field text-sm" />
        )}

        {/* Duration + Intensity */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
            <Clock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              placeholder={t('fitness.duration')} className="bg-transparent text-sm w-full outline-none" style={{ color: 'var(--color-text-primary)' }} />
          </div>
          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
            <Zap className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
              placeholder="卡路里" className="bg-transparent text-sm w-full outline-none" style={{ color: 'var(--color-text-primary)' }} />
          </div>
        </div>

        {/* Intensity selector */}
        <div className="flex gap-1.5">
          {INTENSITY_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setIntensity(opt.value)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border"
              style={{
                background: intensity === opt.value ? opt.color + '18' : 'var(--color-surface-alt)',
                borderColor: intensity === opt.value ? opt.color : 'var(--color-border)',
                color: intensity === opt.value ? opt.color : 'var(--color-text-muted)',
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={isSubmitting || (!selectedType && !customType)}
          className="btn-primary w-full text-sm"
          style={{ '--color-accent': '#f59e0b', '--color-accent-hover': '#d97706' } as React.CSSProperties}>
          <Plus className="h-4 w-4 inline mr-1" /> 打卡
        </button>
      </div>

      {/* Motivation popup */}
      {showMotivation && (
        <div className="absolute inset-0 flex items-center justify-center z-20 animate-bounce-in">
          <div className="absolute inset-0 rounded-xl" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(8px)' }} />
          <div className="relative text-center p-6">
            <PartyPopper className="h-10 w-10 mx-auto mb-3" style={{ color: '#f59e0b' }} />
            <p className="text-base font-bold leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
              {motivationText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
