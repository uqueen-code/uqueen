// ============================================
// Shared Enums & Constants
// ============================================

/** Module/category identifiers */
export enum ModuleCategory {
  FITNESS = 'fitness',
  READING = 'reading',
  LEARNING = 'learning',
  HEALTH = 'health',
  SPEAKING = 'speaking',
  PSYCHOLOGY = 'psychology',
  TRAVEL = 'travel',
  FINANCE = 'finance',
  BUSINESS = 'business',
}

/** All 9 habit-tracking categories */
export const HABIT_CATEGORIES = [
  ModuleCategory.FITNESS,
  ModuleCategory.READING,
  ModuleCategory.LEARNING,
  ModuleCategory.HEALTH,
  ModuleCategory.SPEAKING,
  ModuleCategory.PSYCHOLOGY,
  ModuleCategory.TRAVEL,
  ModuleCategory.FINANCE,
  ModuleCategory.BUSINESS,
] as const;

export type HabitCategory = (typeof HABIT_CATEGORIES)[number];

/** Priority levels for todos */
export enum Priority {
  NORMAL = 'normal',
  IMPORTANT = 'important',
  URGENT = 'urgent',
}

/** Recurrence types */
export enum RecurType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LUNAR_YEARLY = 'lunar_yearly',
}

/** Source of a todo item */
export enum TodoSource {
  MANUAL = 'manual',
  FITNESS_PLAN = 'fitness_plan',
  LEARNING_PLAN = 'learning_plan',
  READING_LOG = 'reading_log',
  MEDICATION_LOG = 'medication_log',
  MOOD_LOG = 'mood_log',
}

/** Goal types */
export enum GoalType {
  YEARLY = 'yearly',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

/** Theme modes */
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  GREEN = 'green',
}

/** Supported languages */
export enum Language {
  ZH_CN = 'zh-CN',
  ZH_TW = 'zh-TW',
  EN = 'en',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  ES = 'es',
  JA = 'ja',
  KO = 'ko',
}

/** All supported languages array */
export const SUPPORTED_LANGUAGES = [
  Language.ZH_CN,
  Language.ZH_TW,
  Language.EN,
  Language.FR,
  Language.DE,
  Language.IT,
  Language.ES,
  Language.JA,
  Language.KO,
] as const;

/** Language display names (in their own language) */
export const LANGUAGE_NAMES: Record<Language, string> = {
  [Language.ZH_CN]: '简体中文',
  [Language.ZH_TW]: '繁體中文',
  [Language.EN]: 'English',
  [Language.FR]: 'Français',
  [Language.DE]: 'Deutsch',
  [Language.IT]: 'Italiano',
  [Language.ES]: 'Español',
  [Language.JA]: '日本語',
  [Language.KO]: '한국어',
};

/** Fitness focus areas */
export enum FitnessFocus {
  SHAPING = '塑形',
  FAT_BURNING = '燃脂',
  MUSCLE_BUILDING = '增肌',
  COMPREHENSIVE = '综合',
}

/** Exercise types */
export const EXERCISE_TYPES = [
  '跑步',
  '羽毛球',
  '健身房',
  '游泳',
  '瑜伽',
  '骑行',
  '跳绳',
  '篮球',
  '足球',
  '其他',
] as const;

/** Learning categories */
export const LEARNING_CATEGORIES = [
  '中考',
  '高考',
  '商科',
  '雅思',
  '书法',
  '计算机',
  '其他',
] as const;

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];

/** Speaking languages */
export const SPEAKING_LANGUAGES = [
  '粤语',
  '英语',
  '法语',
  '德语',
  '意大利语',
  '西班牙语',
  '日语',
  '韩语',
] as const;

export type SpeakingLanguage = (typeof SPEAKING_LANGUAGES)[number];

/** Speaking module types */
export enum SpeakingModule {
  SHADOWING = 'shadowing',
  PICTURE_DESCRIPTION = 'picture_description',
  CONNECTED_SPEECH = 'connected_speech',
  TOPIC_READING = 'topic_reading',
}

/** Exercise intensity */
export enum Intensity {
  LOW = '低',
  MEDIUM = '中',
  HIGH = '高',
}

/** Illness severity */
export enum Severity {
  MILD = '轻微',
  MODERATE = '中等',
  SEVERE = '严重',
}

/** Menstrual flow intensity */
export enum FlowIntensity {
  LIGHT = '少量',
  NORMAL = '正常',
  HEAVY = '大量',
}

/** Asset type for finance */
export enum AssetType {
  STOCK = 'stock',
  FUND = 'fund',
  ETF = 'etf',
}

/** Audio playback speed options */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;
