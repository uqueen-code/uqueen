'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getModuleColor, getHeatmapColor } from '@/lib/themes/module-colors';
import { ModuleCategory } from '@/types/enums';
import type { ActivityEntry } from '@/types/models';

interface HeatmapCalendarProps {
  activities?: ActivityEntry[];
  selectedModule?: string;
  onModuleChange?: (module: string | undefined) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * Activity Heatmap Calendar — monthly view with module-colored cells.
 * Each day displays activity intensity via its module's accent color.
 * Supports module filtering and hover details.
 */
export function HeatmapCalendar({
  activities = [],
  selectedModule,
  onModuleChange,
}: HeatmapCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0 = Sunday

  // Build activity lookup: date -> set of modules (using detail = module category)
  const activityMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    activities.forEach((a) => {
      if (!map[a.date]) map[a.date] = new Set();
      // Use detail (module category) instead of activityType for meaningful labels
      map[a.date]!.add(a.detail || a.activityType);
    });
    return map;
  }, [activities]);

  // Get intensity (0-4) for a day based on activity count
  const getIntensity = useCallback((date: Date): number => {
    const key = format(date, 'yyyy-MM-dd');
    const modules = activityMap[key];
    if (!modules) return 0;
    if (selectedModule) return modules.has(selectedModule) ? 3 : 0;
    return Math.min(4, modules.size);
  }, [activityMap, selectedModule]);

  // Get the dominant module color for a day
  const getDominantColor = useCallback((date: Date): string | null => {
    const key = format(date, 'yyyy-MM-dd');
    const modules = activityMap[key];
    if (!modules || modules.size === 0) return null;
    const first = [...modules][0]!;
    return getModuleColor(first === 'todo' ? 'dashboard' : first);
  }, [activityMap]);

  // Module filter buttons — Chinese labels
  const MODULE_LABELS: Record<string, string> = {
    fitness: '健身',
    reading: '阅读',
    learning: '学习',
    health: '健康',
    speaking: '口语',
    psychology: '心理',
    travel: '旅行',
    finance: '财务',
    business: '商业',
  };

  const moduleFilters = [
    { key: undefined, label: '全部', color: '#6366f1' },
    ...Object.values(ModuleCategory).map((cat) => ({
      key: cat as string,
      label: MODULE_LABELS[cat] ?? cat,
      color: getModuleColor(cat),
    })),
  ];

  const navigateMonth = (direction: -1 | 1) => {
    setCurrentMonth((prev) => direction === -1 ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <div className="module-card" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
          <TrendingUp className="h-5 w-5" style={{ color: '#8b5cf6' }} />
          活动热力图
        </h2>

        {/* Month navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center" style={{ color: 'var(--color-text-primary)' }}>
            {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Module filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {moduleFilters.map((f) => (
          <button
            key={f.key ?? 'all'}
            onClick={() => onModuleChange?.(f.key)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs transition-all',
              selectedModule === f.key ? 'text-white' : ''
            )}
            style={{
              background: selectedModule === f.key ? f.color : 'var(--color-surface-hover)',
              color: selectedModule === f.key ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mb-3 text-[10px]">
        <span style={{ color: 'var(--color-text-muted)' }}>少</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="h-3 w-3 rounded-sm"
            style={{
              background: level === 0
                ? 'var(--color-surface-hover)'
                : getHeatmapColor(selectedModule ?? 'dashboard', level),
            }}
          />
        ))}
        <span style={{ color: 'var(--color-text-muted)' }}>多</span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] py-1 font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {day}
          </div>
        ))}

        {/* Empty cells at start */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const intensity = getIntensity(day);
          const dominantColor = getDominantColor(day);
          const isCurrentDay = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayModules = activityMap[dateKey];

          return (
            <div
              key={dateKey}
              className={cn(
                'aspect-square rounded-md flex items-center justify-center text-xs transition-all relative group cursor-default',
                isCurrentDay && 'ring-2'
              )}
              style={{
                background: intensity > 0
                  ? getHeatmapColor(dominantColor ?? 'dashboard', intensity)
                  : 'var(--color-surface-hover)',
                ...(isCurrentDay ? { boxShadow: '0 0 0 2px var(--color-accent)' } : {}),
              }}
            >
              <span
                className="relative z-10"
                style={{
                  color: intensity > 2 ? '#fff' : 'var(--color-text-secondary)',
                  fontWeight: isCurrentDay ? 700 : 400,
                }}
              >
                {format(day, 'd')}
              </span>

              {/* Hover tooltip */}
              {dayModules && dayModules.size > 0 && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
                  style={{
                    background: 'var(--color-text-primary)',
                    color: 'var(--color-surface)',
                  }}
                >
                  {[...dayModules].map(m => MODULE_LABELS[m] ?? m).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
