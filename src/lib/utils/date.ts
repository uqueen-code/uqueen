import {
  format,
  formatDistanceToNow,
  differenceInDays,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { zhCN, zhTW, fr, de, it, es, ja, ko } from 'date-fns/locale';

/**
 * Locale mapping for date-fns.
 */
const LOCALE_MAP: Record<string, Locale> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  fr,
  de,
  it,
  es,
  ja,
  ko,
};

/**
 * Get date-fns locale by language code.
 */
export function getDateLocale(language: string): Locale | undefined {
  return LOCALE_MAP[language];
}

/**
 * Format a date string for display.
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'yyyy-MM-dd',
  language?: string
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const locale = language ? getDateLocale(language) : undefined;
  return format(d, formatStr, { locale });
}

/**
 * Get a human-friendly relative date label.
 */
export function getRelativeDateLabel(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return '今天';
  if (isTomorrow(d)) return '明天';
  if (isYesterday(d)) return '昨天';
  return format(d, 'MM/dd');
}

/**
 * Calculate days remaining until a target date.
 */
export function getDaysRemaining(targetDate: string | Date): number {
  const d = typeof targetDate === 'string' ? parseISO(targetDate) : date;
  return Math.max(0, differenceInDays(d, new Date()));
}

/**
 * Check if a date is overdue.
 */
export function isOverdue(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(new Date(), d) > 0;
}

/**
 * Get the start and end of today as ISO strings.
 */
export function getTodayRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: startOfDay(now).toISOString(),
    end: endOfDay(now).toISOString(),
  };
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Generate an array of dates for a month calendar view.
 */
export function getMonthDateGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0 = Sunday
  const days: (Date | null)[] = [];

  // Pad beginning with null
  for (let i = 0; i < startPad; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

/**
 * Simple debounce utility (also available as hook).
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
