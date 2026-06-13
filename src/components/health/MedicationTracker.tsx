'use client';

import { useState, useCallback } from 'react';
import { Pill, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import type { MedicationLog } from '@/types/models';

interface MedicationTrackerProps {
  logs: MedicationLog[];
  onLog: (data: {
    medicationName: string; reason: string; startDate: string;
    duration: string; dosage?: string; notes?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MedicationTracker({ logs, onLog, onDelete }: MedicationTrackerProps) {
  const [medicationName, setMedicationName] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]!);
  const [duration, setDuration] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!medicationName.trim() || !reason.trim() || !duration.trim()) return;
    setIsSubmitting(true);
    await onLog({
      medicationName: medicationName.trim(),
      reason: reason.trim(),
      startDate,
      duration: duration.trim(),
      dosage: dosage.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setMedicationName(''); setReason(''); setDuration(''); setDosage(''); setNotes('');
    setIsSubmitting(false);
  }, [medicationName, reason, startDate, duration, dosage, notes, onLog]);

  const activeMeds = logs.filter(l => !l.isCompleted);

  return (
    <div className="module-card" style={{ '--module-accent': '#06b6d4' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#06b6d4' } as React.CSSProperties}>
        <Pill className="h-5 w-5" style={{ color: '#06b6d4' }} />
        用药记录
      </h2>

      <div className="space-y-2.5">
        <div className="flex gap-2">
          <input type="text" value={medicationName}
            onChange={e => setMedicationName(e.target.value)}
            placeholder="药品名称（如：阿莫西林）" className="input-field text-sm flex-1" />
          <input type="date" value={startDate}
            onChange={e => setStartDate(e.target.value)} className="input-field text-sm w-36" />
        </div>
        <input type="text" value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="服用原因（如：细菌感染）" className="input-field text-sm" />
        <div className="flex gap-2">
          <input type="text" value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="用法用量（如：每日3次，每次1片）" className="input-field text-sm flex-1" />
          <input type="text" value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="服用多久（如：7天）" className="input-field text-sm w-28" />
        </div>
        <button onClick={handleSubmit}
          disabled={isSubmitting || !medicationName.trim() || !reason.trim() || !duration.trim()}
          className="btn-primary w-full text-sm"
          style={{ '--color-accent': '#06b6d4', '--color-accent-hover': '#0891b2' } as React.CSSProperties}>
          <Plus className="h-3.5 w-3.5 inline mr-1" />添加用药记录
        </button>
      </div>

      {/* Active medication list */}
      {activeMeds.length > 0 && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
            <Clock className="h-3 w-3" /> 当前用药
          </p>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {activeMeds.map(med => (
              <div key={med.id}
                className="flex items-start gap-2 p-2.5 rounded-lg group"
                style={{ background: 'var(--color-surface-alt)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      💊 {med.medicationName}
                    </span>
                    {med.dosage && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#06b6d418', color: '#0891b2' }}>
                        {med.dosage}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    原因：{med.reason}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      📅 {med.startDate} 起 · {med.duration}
                    </span>
                  </div>
                </div>
                <button onClick={() => onDelete(med.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  style={{ color: '#ef4444' }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="mt-4 text-center py-4">
          <Pill className="h-8 w-8 mx-auto mb-1" style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>暂无用药记录</p>
        </div>
      )}
    </div>
  );
}
