'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, X, Calendar, Clock, Repeat, Cake, Star, AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Priority, RecurType, ModuleCategory } from '@/types/enums';
import { getModuleColor } from '@/lib/themes/module-colors';

interface TodoCreatorProps {
  onSave: (data: {
    title: string;
    description?: string;
    category?: string;
    priority: Priority;
    isRecurring: boolean;
    recurType: RecurType | null;
    recurConfig?: { lunarMonth?: number; lunarDay?: number; monthDay?: number; daysOfWeek?: number[] };
    dueDate?: string;
    dueTime?: string;
    isBirthdayReminder: boolean;
    birthdayPerson?: string;
    birthdayIsLunar: boolean;
  }) => Promise<void>;
  onClose?: () => void;
}

const PRIORITY_OPTIONS = [
  { value: Priority.NORMAL, label: 'common.normal', color: '#94a3b8', icon: null },
  { value: Priority.IMPORTANT, label: 'common.important', color: '#f59e0b', icon: Star },
  { value: Priority.URGENT, label: 'common.urgent', color: '#ef4444', icon: AlertTriangle },
] as const;

const RECUR_OPTIONS = [
  { value: null, label: '不循环' },
  { value: RecurType.DAILY, label: 'common.daily' },
  { value: RecurType.WEEKLY, label: 'common.weekly' },
  { value: RecurType.MONTHLY, label: 'common.monthly' },
  { value: RecurType.YEARLY, label: 'common.yearly' },
  { value: RecurType.LUNAR_YEARLY, label: 'common.lunarYearly' },
] as const;

const CATEGORY_OPTIONS = [
  { value: '', label: '无分类' },
  ...Object.values(ModuleCategory).map((cat) => ({ value: cat, label: `nav.${cat}` })),
];

/**
 * Todo Creator — full-featured todo/reminder creation form.
 * Supports: priority, recurring, lunar birthday reminders, categories.
 */
export function TodoCreator({ onSave, onClose }: TodoCreatorProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurType, setRecurType] = useState<RecurType | null>(null);
  const [isBirthday, setIsBirthday] = useState(false);
  const [birthdayPerson, setBirthdayPerson] = useState('');
  const [birthdayIsLunar, setBirthdayIsLunar] = useState(false);
  const [category, setCategory] = useState('');
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarDay, setLunarDay] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const recurConfig: Record<string, unknown> = {};
      if (recurType === RecurType.LUNAR_YEARLY) {
        recurConfig.lunarMonth = lunarMonth;
        recurConfig.lunarDay = lunarDay;
      }
      if (recurType === RecurType.MONTHLY) {
        recurConfig.monthDay = dueDate ? new Date(dueDate).getDate() : 1;
      }

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        priority,
        isRecurring: isRecurring && recurType !== null,
        recurType: isRecurring ? recurType : null,
        recurConfig: Object.keys(recurConfig).length > 0 ? (recurConfig as { lunarMonth?: number; lunarDay?: number; monthDay?: number }) : undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        isBirthdayReminder: isBirthday,
        birthdayPerson: isBirthday ? (birthdayPerson || undefined) : undefined,
        birthdayIsLunar: isBirthday ? birthdayIsLunar : false,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority(Priority.NORMAL);
      setDueDate('');
      setDueTime('');
      setIsRecurring(false);
      setRecurType(null);
      setIsBirthday(false);
      setBirthdayPerson('');
      setBirthdayIsLunar(false);
      setCategory('');
      setIsExpanded(false);
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, priority, dueDate, dueTime, isRecurring, recurType, isBirthday, birthdayPerson, birthdayIsLunar, category, lunarMonth, lunarDay, onSave, onClose]);

  const todayStr = new Date().toISOString().split('T')[0]!;

  return (
    <div
      className="module-card"
      style={{ '--module-accent': '#6366f1' } as React.CSSProperties}
    >
      {/* Compact header — always visible */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 flex items-center gap-2">
          <Plus className="h-4 w-4 flex-shrink-0" style={{ color: '#6366f1' }} />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('dashboard.createTodo') + '...'}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--color-text-primary)' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          {title.trim() && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
              disabled={isSubmitting}
              className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-all"
              style={{ background: '#6366f1' }}
            >
              {t('common.add')}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
            />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-3 animate-slide-down" style={{ borderColor: 'var(--color-border)' }}>
          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加描述..."
            className="input-field min-h-[60px] text-sm"
          />

          {/* Priority + Category row */}
          <div className="flex gap-2 flex-wrap">
            {/* Priority */}
            <div className="flex items-center gap-1">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs transition-all border',
                    priority === opt.value ? 'text-white' : ''
                  )}
                  style={{
                    background: priority === opt.value ? opt.color : 'var(--color-surface-hover)',
                    borderColor: priority === opt.value ? opt.color : 'transparent',
                    color: priority === opt.value ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {opt.icon && <opt.icon className="h-3 w-3" />}
                  {t(opt.label)}
                </button>
              ))}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field w-auto text-xs ml-auto"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value ? t(opt.label) : opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1 flex-1">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={todayStr}
                className="input-field text-xs flex-1"
              />
            </div>
            <div className="flex items-center gap-1 w-28">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="input-field text-xs flex-1"
              />
            </div>
          </div>

          {/* Recurring + Birthday toggles */}
          <div className="flex gap-3 flex-wrap">
            {/* Recurring */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (!e.target.checked) setRecurType(null);
                }}
                className="checkbox-custom h-4 w-4"
              />
              <Repeat className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>循环</span>
            </label>

            {isRecurring && (
              <select
                value={recurType ?? ''}
                onChange={(e) => setRecurType((e.target.value as RecurType) || null)}
                className="input-field w-auto text-xs"
              >
                {RECUR_OPTIONS.map((opt) => (
                  <option key={opt.value ?? 'none'} value={opt.value ?? ''}>{opt.label}</option>
                ))}
              </select>
            )}

            {/* Lunar calendar fields */}
            {isRecurring && recurType === RecurType.LUNAR_YEARLY && (
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span>农历</span>
                <select
                  value={lunarMonth}
                  onChange={(e) => setLunarMonth(Number(e.target.value))}
                  className="input-field w-auto text-xs"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}月</option>
                  ))}
                </select>
                <select
                  value={lunarDay}
                  onChange={(e) => setLunarDay(Number(e.target.value))}
                  className="input-field w-auto text-xs"
                >
                  {Array.from({ length: 30 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}日</option>
                  ))}
                </select>
              </div>
            )}

            {/* Birthday Reminder */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isBirthday}
                onChange={(e) => setIsBirthday(e.target.checked)}
                className="checkbox-custom h-4 w-4"
              />
              <Cake className="h-3.5 w-3.5" style={{ color: '#ec4899' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>生日提醒</span>
            </label>

            {isBirthday && (
              <>
                <input
                  type="text"
                  value={birthdayPerson}
                  onChange={(e) => setBirthdayPerson(e.target.value)}
                  placeholder="寿星姓名"
                  className="input-field w-24 text-xs"
                />
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={birthdayIsLunar}
                    onChange={(e) => setBirthdayIsLunar(e.target.checked)}
                    className="checkbox-custom h-4 w-4"
                  />
                  <span className="text-xs" style={{ color: '#ec4899' }}>农历</span>
                </label>
              </>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="btn-primary w-full text-sm"
            style={{ '--color-accent': '#6366f1', '--color-accent-hover': '#4f46e5' } as React.CSSProperties}
          >
            {isSubmitting ? t('common.loading') : t('dashboard.createTodo')}
          </button>
        </div>
      )}
    </div>
  );
}
