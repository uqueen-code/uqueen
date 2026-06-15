'use client';

import { useState, useCallback } from 'react';
import { Scale, Target, Ruler, Sparkles } from 'lucide-react';
import { FitnessFocus } from '@/types/enums';
import type { FitnessData } from '@/types/models';

interface WeightTrackerProps {
  fitnessData: FitnessData | null;
  onSave: (data: {
    currentWeight?: number; targetWeight?: number; height?: number;
    focusArea?: FitnessFocus; bodyParts?: string[];
  }) => Promise<void>;
  hasPlan: boolean;
}

const FOCUS_OPTIONS = [
  { value: FitnessFocus.SHAPING, label: '塑形', desc: '塑造优美线条' },
  { value: FitnessFocus.FAT_BURNING, label: '燃脂', desc: '高效燃烧脂肪' },
  { value: FitnessFocus.MUSCLE_BUILDING, label: '增肌', desc: '增加肌肉量' },
  { value: FitnessFocus.COMPREHENSIVE, label: '综合', desc: '全面提升' },
];

const BODY_PARTS = ['腹部', '腿部', '手臂', '背部', '臀部', '全身'];

export function WeightTracker({ fitnessData, onSave, hasPlan }: WeightTrackerProps) {
  const [currentWeight, setCurrentWeight] = useState(fitnessData?.currentWeight?.toString() ?? '');
  const [targetWeight, setTargetWeight] = useState(fitnessData?.targetWeight?.toString() ?? '');
  const [height, setHeight] = useState(fitnessData?.height?.toString() ?? '');
  const [focusArea, setFocusArea] = useState<FitnessFocus>(fitnessData?.focusArea ?? FitnessFocus.COMPREHENSIVE);
  const [bodyParts, setBodyParts] = useState<string[]>(fitnessData?.bodyParts ?? []);
  const [isSaving, setIsSaving] = useState(false);

  const toggleBodyPart = (part: string) => {
    setBodyParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave({
        currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        height: height ? parseFloat(height) : undefined,
        focusArea,
        bodyParts,
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentWeight, targetWeight, height, focusArea, bodyParts, onSave]);

  return (
    <div className="module-card" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
        <Scale className="h-5 w-5" style={{ color: '#22c55e' }} />
        体重追踪
        {fitnessData && !hasPlan && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full animate-pulse-soft" style={{ background: '#22c55e20', color: '#22c55e' }}>
            <Sparkles className="h-3 w-3 inline mr-1" />
            可生成方案
          </span>
        )}
      </h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <Ruler className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm flex-1" style={{ color: 'var(--color-text-secondary)' }}>体重追踪</span>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)}
            placeholder="cm" className="input-field w-24 text-right text-sm" />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <Scale className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm flex-1" style={{ color: 'var(--color-text-secondary)' }}>体重追踪</span>
          <input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)}
            placeholder="kg" className="input-field w-24 text-right text-sm" step="0.1" />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <Target className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm flex-1" style={{ color: 'var(--color-text-secondary)' }}>体重追踪</span>
          <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value)}
            placeholder="kg" className="input-field w-24 text-right text-sm" step="0.1" />
        </div>

        {/* Focus Area */}
        <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>体重追踪</p>
          <div className="grid grid-cols-2 gap-2">
            {FOCUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setFocusArea(opt.value)}
                className="p-2 rounded-lg text-xs transition-all border-2 text-left"
                style={{
                  background: focusArea === opt.value ? '#22c55e18' : 'var(--color-surface)',
                  borderColor: focusArea === opt.value ? '#22c55e' : 'var(--color-border)',
                  color: focusArea === opt.value ? '#16a34a' : 'var(--color-text-secondary)',
                }}>
                <div className="font-medium">{opt.label}</div>
                <div className="text-[10px] opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Body Parts */}
        <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>重点部位</p>
          <div className="flex flex-wrap gap-1.5">
            {BODY_PARTS.map(part => (
              <button key={part} onClick={() => toggleBodyPart(part)}
                className="px-2.5 py-1 rounded-full text-xs transition-all border"
                style={{
                  background: bodyParts.includes(part) ? '#22c55e18' : 'var(--color-surface)',
                  borderColor: bodyParts.includes(part) ? '#22c55e' : 'var(--color-border)',
                  color: bodyParts.includes(part) ? '#16a34a' : 'var(--color-text-secondary)',
                }}>
                {part}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving}
          className="btn-primary w-full text-sm"
          style={{ '--color-accent': '#22c55e', '--color-accent-hover': '#16a34a' } as React.CSSProperties}>
          {isSaving ? t('common.loading') : (fitnessData ? t('common.save') : '保存并生成方案')}
        </button>
      </div>
    </div>
  );
}
