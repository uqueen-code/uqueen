/**
 * Chinese Lunar Calendar Utilities
 *
 * Uses lunar-javascript (6tail) for accurate lunar calendar calculations.
 * Supports: solar ↔ lunar conversion, lunar birthday → solar date mapping.
 *
 * @see https://github.com/6tail/lunar-javascript
 */

import { Lunar, Solar } from 'lunar-javascript';

/**
 * Convert a solar (Gregorian) date to a lunar date.
 *
 * @param date - JavaScript Date object
 * @returns Lunar date info
 */
export function solarToLunar(date: Date): LunarDateInfo {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    isLeapMonth: lunar.getLeapMonth() > 0,
    yearInChinese: lunar.getYearInChinese(),
    monthInChinese: lunar.getMonthInChinese(),
    dayInChinese: lunar.getDayInChinese(),
    festivals: lunar.getFestivals(),
    solarTerm: lunar.getJieQi(),
    zodiac: lunar.getYearShengXiao(),
  };
}

/**
 * Convert a lunar date to a solar (Gregorian) date.
 *
 * @param lunarYear - Lunar year
 * @param lunarMonth - Lunar month (1-12)
 * @param lunarDay - Lunar day (1-30)
 * @returns JavaScript Date object
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number
): Date {
  const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
  const solar = lunar.getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

/**
 * Given a lunar birthday (month + day), calculate the solar date
 * of that birthday in the current Gregorian year.
 *
 * This handles the case where the lunar date may occur twice (leap month)
 * or not at all in a given solar year.
 *
 * @param lunarMonth - Lunar month of birth (1-12)
 * @param lunarDay - Lunar day of birth (1-30)
 * @param currentYear - Current Gregorian year (defaults to this year)
 * @returns Solar date of the birthday, or null if it doesn't exist this year
 */
export function getLunarBirthdayInYear(
  lunarMonth: number,
  lunarDay: number,
  currentYear?: number
): Date | null {
  const year = currentYear ?? new Date().getFullYear();

  try {
    // Try the lunar year that roughly corresponds to the current solar year
    const lunar = Lunar.fromYmd(year, lunarMonth, lunarDay);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } catch {
    // The lunar date might not exist in this year (rare edge case with leap months)
    // Try adjacent years
    for (const offset of [-1, 1]) {
      try {
        const lunar = Lunar.fromYmd(year + offset, lunarMonth, lunarDay);
        const solar = lunar.getSolar();
        return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
      } catch {
        continue;
      }
    }
    return null;
  }
}

/**
 * Calculate the days remaining until a lunar birthday.
 *
 * @param lunarMonth - Lunar month of birth
 * @param lunarDay - Lunar day of birth
 * @returns Days remaining, or -1 if the birthday has passed this year
 */
export function getDaysUntilLunarBirthday(
  lunarMonth: number,
  lunarDay: number
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisYearBirthday = getLunarBirthdayInYear(lunarMonth, lunarDay, today.getFullYear());

  if (!thisYearBirthday) return -1;

  const birthdayThisYear = new Date(thisYearBirthday);
  birthdayThisYear.setHours(0, 0, 0, 0);

  let diffDays = Math.ceil(
    (birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If birthday has passed this year, calculate for next year
  if (diffDays < 0) {
    const nextYearBirthday = getLunarBirthdayInYear(
      lunarMonth,
      lunarDay,
      today.getFullYear() + 1
    );
    if (!nextYearBirthday) return -1;

    const birthdayNextYear = new Date(nextYearBirthday);
    birthdayNextYear.setHours(0, 0, 0, 0);
    diffDays = Math.ceil(
      (birthdayNextYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return diffDays;
}

/**
 * Get the Chinese zodiac animal for a given year.
 */
export function getChineseZodiac(year: number): string {
  const zodiac = [
    '鼠', '牛', '虎', '兔', '龙', '蛇',
    '马', '羊', '猴', '鸡', '狗', '猪',
  ];
  return zodiac[(year - 4) % 12];
}

/**
 * Lunar date information interface.
 */
export interface LunarDateInfo {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  yearInChinese: string;
  monthInChinese: string;
  dayInChinese: string;
  festivals: string[];
  solarTerm: string | null;
  zodiac: string;
}

/**
 * Get lunar date display string.
 */
export function formatLunarDate(info: LunarDateInfo): string {
  const parts: string[] = [];
  if (info.solarTerm) {
    parts.push(info.solarTerm);
  }
  if (info.festivals.length > 0) {
    parts.push(...info.festivals);
  }

  const dateStr = `${info.yearInChinese}年${info.isLeapMonth ? '闰' : ''}${info.monthInChinese}月${info.dayInChinese}`;

  if (parts.length > 0) {
    return `${dateStr} · ${parts.join(' · ')}`;
  }
  return dateStr;
}
