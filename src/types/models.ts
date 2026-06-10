// ============================================
// Domain Models — Frontend data structures
// ============================================

import {
  Priority,
  RecurType,
  TodoSource,
  GoalType,
  ModuleCategory,
  HabitCategory,
  Intensity,
  Severity,
  FlowIntensity,
  AssetType,
  FitnessFocus,
  SpeakingModule,
} from './enums';

// ---- User & Auth ----
export interface UserProfile {
  id: string;
  email?: string;
  username: string | null;
  avatarUrl: string | null;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'green';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  moduleFontSizes: Record<string, 'small' | 'medium' | 'large'>;
  offlineMode: boolean;
}

// ---- Dashboard / Todos ----
export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: ModuleCategory | null;
  priority: Priority;
  isRecurring: boolean;
  recurType: RecurType | null;
  recurConfig: RecurConfig | null;
  dueDate: string | null; // ISO date
  dueTime: string | null; // HH:mm
  isCompleted: boolean;
  completedAt: string | null;
  isBirthdayReminder: boolean;
  birthdayPerson: string | null;
  birthdayIsLunar: boolean;
  source: TodoSource;
  sourceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecurConfig {
  daysOfWeek?: number[]; // 0-6, for weekly
  monthDay?: number; // 1-31, for monthly
  lunarMonth?: number; // 1-12, for lunar yearly
  lunarDay?: number; // 1-30, for lunar yearly
}

// ---- Habit Tracking ----
export interface HabitLog {
  id: string;
  userId: string;
  date: string; // ISO date
  category: HabitCategory;
  completed: boolean;
  notes: string | null;
  createdAt: string;
}

// ---- Countdowns ----
export interface Countdown {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  isRecurring: boolean;
  recurType: RecurType | null;
  color: string;
  daysRemaining?: number;
  createdAt: string;
}

// ---- Goals ----
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: GoalType;
  year: number;
  deadline: string | null;
  progress: number; // 0-100
  isCompleted: boolean;
  daysRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Fitness ----
export interface FitnessData {
  id: string;
  userId: string;
  currentWeight: number | null;
  targetWeight: number | null;
  height: number | null;
  focusArea: FitnessFocus | null;
  bodyParts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FitnessPlan {
  id: string;
  userId: string;
  fitnessDataId: string | null;
  name: string;
  planData: {
    daily: FitnessDailyTask[];
    monthly: FitnessMonthlyGoal[];
  };
  isAccepted: boolean;
  acceptedAt: string | null;
  createdAt: string;
}

export interface FitnessDailyTask {
  day: number;
  exercise: string;
  duration: number; // minutes
  sets?: number;
  reps?: number;
  notes?: string;
}

export interface FitnessMonthlyGoal {
  month: number;
  goal: string;
  targetWeight?: number;
}

export interface ExerciseLog {
  id: string;
  userId: string;
  date: string;
  exerciseType: string;
  durationMinutes: number | null;
  intensity: Intensity | null;
  caloriesBurned: number | null;
  notes: string | null;
  createdAt: string;
}

// ---- Reading ----
export interface ReadingLog {
  id: string;
  userId: string;
  date: string;
  bookTitle: string;
  author: string | null;
  chapter: string | null;
  pagesRead: number | null;
  notes: string | null;
  isDailyRecommendation: boolean;
  createdAt: string;
}

export interface DailyBookRecommendation {
  id: string;
  date: string;
  title: string;
  author: string;
  summary: string | null;
  coverUrl: string | null;
  category: string;
}

// ---- Learning ----
export interface LearningCategoryState {
  id: string;
  userId: string;
  category: string;
  isActive: boolean;
}

export interface LearningPlan {
  id: string;
  userId: string;
  category: string;
  title: string;
  methodDescription: string | null;
  filePath: string | null;
  planData: Record<string, unknown> | null;
  isAccepted: boolean;
  localResourcePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningLog {
  id: string;
  userId: string;
  date: string;
  category: string;
  planId: string | null;
  completed: boolean;
  notes: string | null;
  createdAt: string;
}

// ---- Speaking ----
export interface SpeakingLanguageState {
  id: string;
  userId: string;
  language: string;
  isActive: boolean;
}

export interface SpeakingMaterial {
  id: string;
  date: string;
  language: string;
  module: SpeakingModule;
  title: string | null;
  audioUrl: string | null;
  subtitleText: string | null;
  imageUrl: string | null;
  content: string | null;
}

export interface SpeakingLog {
  id: string;
  userId: string;
  date: string;
  language: string;
  module: SpeakingModule;
  completed: boolean;
  notes: string | null;
  createdAt: string;
}

// ---- Health ----
export interface IllnessLog {
  id: string;
  userId: string;
  date: string;
  illnessType: string;
  severity: Severity | null;
  symptoms: string | null;
  medication: string | null;
  recoveryDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface MenstrualLog {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
  symptoms: string | null;
  flowIntensity: FlowIntensity | null;
  notes: string | null;
  createdAt: string;
}

export interface DailyWellness {
  id: string;
  date: string;
  dietRecommendation: string | null;
  exerciseRecommendation: string | null;
  wellnessTips: string | null;
  suitableFor: string;
}

// ---- Finance ----
export interface PortfolioItem {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: AssetType;
  shares: number | null;
  buyPrice: number | null;
  buyDate: string | null;
  currentPrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyFinanceInfo {
  id: string;
  date: string;
  stockPick: {
    symbol: string;
    name: string;
    reason: string;
  } | null;
  fundPick: {
    symbol: string;
    name: string;
    reason: string;
  } | null;
  knowledgeTip: string | null;
}

// ---- Activity Heatmap ----
export interface ActivityEntry {
  date: string;
  activityType: 'habit' | 'fitness' | 'reading' | 'learning' | 'speaking' | 'todo';
  detail: string;
}

// ---- Motivation & Music ----
export interface DailyMotivation {
  quote: string;
  author: string;
  language: string;
}

// ---- Module Color Config ----
export interface ModuleColorConfig {
  light: string;
  DEFAULT: string;
  dark: string;
  accent?: string;
  cream?: string;
}

// ---- Sync Status ----
export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  recordId: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';
