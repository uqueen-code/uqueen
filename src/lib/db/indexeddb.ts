/**
 * IndexedDB Database Setup (Dexie.js)
 *
 * Mirrors the Supabase schema for offline-first storage.
 * All tables are created on first access.
 *
 * Phase 3: Added fitness_data, fitness_plans, exercise_logs, reading_logs, book_recommendations.
 */

import Dexie, { type Table } from 'dexie';

// ---- Offline table interfaces ----

export interface OfflineTodo {
  id: string; userId: string; title: string; description: string | null;
  category: string | null; priority: string; isRecurring: boolean;
  recurType: string | null; recurConfig: Record<string, unknown> | null;
  dueDate: string | null; dueTime: string | null; isCompleted: boolean;
  completedAt: string | null; isBirthdayReminder: boolean;
  birthdayPerson: string | null; birthdayIsLunar: boolean;
  source: string; sourceId: string | null; createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineHabitLog {
  id: string; userId: string; date: string; category: string;
  completed: boolean; notes: string | null; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineGoal {
  id: string; userId: string; title: string; description: string | null;
  type: string; year: number; deadline: string | null;
  progress: number; isCompleted: boolean; createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineCountdown {
  id: string; userId: string; title: string; targetDate: string;
  isRecurring: boolean; recurType: string | null; color: string; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

// Phase 3: Fitness
export interface OfflineFitnessData {
  id: string; userId: string; currentWeight: number | null; targetWeight: number | null;
  height: number | null; focusArea: string | null; bodyParts: string[];
  createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineFitnessPlan {
  id: string; userId: string; fitnessDataId: string | null;
  name: string;
  planData: { daily: Array<{ day: number; exercise: string; duration: number; sets?: number; reps?: number; notes?: string }>; monthly: Array<{ month: number; goal: string; targetWeight?: number }> };
  isAccepted: boolean; acceptedAt: string | null; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineExerciseLog {
  id: string; userId: string; date: string; exerciseType: string;
  durationMinutes: number | null; intensity: string | null;
  caloriesBurned: number | null; notes: string | null; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

// Phase 3: Reading
export interface OfflineReadingLog {
  id: string; userId: string; date: string; bookTitle: string;
  author: string | null; chapter: string | null; pagesRead: number | null;
  notes: string | null; isDailyRecommendation: boolean; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineBookRecommendation {
  id: string; date: string; title: string; author: string;
  summary: string | null; coverUrl: string | null; category: string;
}

// Phase 4: Learning
export interface OfflineLearningCategory {
  id: string; userId: string; category: string; isActive: boolean;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineLearningPlan {
  id: string; userId: string; category: string; title: string;
  methodDescription: string | null; filePath: string | null;
  planData: Record<string, unknown> | null; isAccepted: boolean;
  localResourcePath: string | null; createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineLearningLog {
  id: string; userId: string; date: string; category: string;
  planId: string | null; completed: boolean; notes: string | null; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

// Phase 4: Speaking
export interface OfflineSpeakingLanguage {
  id: string; userId: string; language: string; isActive: boolean;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineSpeakingMaterial {
  id: string; date: string; language: string; module: string;
  title: string | null; audioUrl: string | null; subtitleText: string | null;
  imageUrl: string | null; content: string | null;
}

export interface OfflineSpeakingLog {
  id: string; userId: string; date: string; language: string; module: string;
  completed: boolean; notes: string | null; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

// Phase 5: Health
export interface OfflineIllnessLog {
  id: string; userId: string; date: string; illnessType: string;
  severity: string | null; symptoms: string | null; medication: string | null;
  recoveryDate: string | null; notes: string | null; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineMenstrualLog {
  id: string; userId: string; startDate: string; endDate: string | null;
  cycleLength: number | null; symptoms: string | null;
  flowIntensity: string | null; notes: string | null; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineWellness {
  id: string; date: string; dietRecommendation: string | null;
  exerciseRecommendation: string | null; wellnessTips: string | null; suitableFor: string;
}

// Phase 5: Finance
export interface OfflinePortfolioItem {
  id: string; userId: string; symbol: string; name: string;
  type: string; shares: number | null; buyPrice: number | null;
  buyDate: string | null; currentPrice: number | null; notes: string | null;
  createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineFinanceInfo {
  id: string; date: string;
  stockPick: { symbol: string; name: string; reason: string } | null;
  fundPick: { symbol: string; name: string; reason: string } | null;
  knowledgeTip: string | null;
}

export interface SyncQueueItem {
  id?: number; table: string; operation: 'insert' | 'update' | 'delete';
  recordId: string; data: Record<string, unknown>; timestamp: number; retryCount: number;
}

// New tables
export interface OfflineMedicationLog {
  id: string; userId: string; medicationName: string; reason: string;
  startDate: string; duration: string; dosage: string | null; notes: string | null;
  isCompleted: boolean; createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineMoodLog {
  id: string; userId: string; date: string; rating: number; note: string | null;
  createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineEmotionEntry {
  id: string; userId: string; date: string; emotion: string; eaten: boolean;
  createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineTravelCity {
  id: string; userId: string; city: string; country: string;
  lat: number; lng: number; visitDate: string | null; feeling: string | null;
  isVisited: boolean; createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineTravelRecommendation {
  id: string; date: string; destination: string; country: string;
  days: number; attractions: string[]; route: string; food: string[];
  scenery: string; imageUrl: string | null;
}

export interface OfflineCountryKnowledge {
  id: string; date: string; country: string; capital: string; flag: string;
  population: string; funFacts: string[]; history: string; culture: string;
  geography: string;
}

export interface OfflineBusinessIdea {
  id: string; userId: string; name: string; value: string;
  status: 'watching' | 'researching' | 'testing' | 'paused';
  nextAction: string; createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineBusinessProject {
  id: string; userId: string; title: string; description: string | null;
  category: 'important_not_urgent' | 'weekly_focus' | 'blocked';
  stage: 'todo' | 'in_progress' | 'done'; blockerReason: string | null;
  order: number; createdAt: string; updatedAt: string;
  _synced: boolean; _modifiedAt: number;
}

export interface OfflineBusinessTransaction {
  id: string; userId: string; date: string; type: 'income' | 'expense';
  channel: string; amount: number; description: string; roiNote: string | null;
  createdAt: string;
  _synced: boolean; _modifiedAt: number;
}

/**
 * AppDatabase — manages all IndexedDB tables.
 */
export class AppDatabase extends Dexie {
  todos!: Table<OfflineTodo, string>;
  habitLogs!: Table<OfflineHabitLog, string>;
  goals!: Table<OfflineGoal, string>;
  countdowns!: Table<OfflineCountdown, string>;
  fitnessData!: Table<OfflineFitnessData, string>;
  fitnessPlans!: Table<OfflineFitnessPlan, string>;
  exerciseLogs!: Table<OfflineExerciseLog, string>;
  readingLogs!: Table<OfflineReadingLog, string>;
  bookRecommendations!: Table<OfflineBookRecommendation, string>;
  learningCategories!: Table<OfflineLearningCategory, string>;
  learningPlans!: Table<OfflineLearningPlan, string>;
  learningLogs!: Table<OfflineLearningLog, string>;
  speakingLanguages!: Table<OfflineSpeakingLanguage, string>;
  speakingMaterials!: Table<OfflineSpeakingMaterial, string>;
  speakingLogs!: Table<OfflineSpeakingLog, string>;
  illnessLogs!: Table<OfflineIllnessLog, string>;
  menstrualLogs!: Table<OfflineMenstrualLog, string>;
  wellness!: Table<OfflineWellness, string>;
  portfolioItems!: Table<OfflinePortfolioItem, string>;
  financeInfo!: Table<OfflineFinanceInfo, string>;
  medicationLogs!: Table<OfflineMedicationLog, string>;
  moodLogs!: Table<OfflineMoodLog, string>;
  emotionEntries!: Table<OfflineEmotionEntry, string>;
  travelCities!: Table<OfflineTravelCity, string>;
  travelRecommendations!: Table<OfflineTravelRecommendation, string>;
  countryKnowledge!: Table<OfflineCountryKnowledge, string>;
  businessIdeas!: Table<OfflineBusinessIdea, string>;
  businessProjects!: Table<OfflineBusinessProject, string>;
  businessTransactions!: Table<OfflineBusinessTransaction, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('PersonalGrowthDB');

    this.version(5).stores({
      todos: 'id, userId, category, dueDate, isCompleted, _synced',
      habitLogs: 'id, userId, date, category, _synced',
      goals: 'id, userId, type, deadline, _synced',
      countdowns: 'id, userId, targetDate, _synced',
      fitnessData: 'id, userId, _synced',
      fitnessPlans: 'id, userId, fitnessDataId, isAccepted, _synced',
      exerciseLogs: 'id, userId, date, exerciseType, _synced',
      readingLogs: 'id, userId, date, bookTitle, _synced',
      bookRecommendations: 'id, date',
      learningCategories: 'id, userId, category, _synced',
      learningPlans: 'id, userId, category, _synced',
      learningLogs: 'id, userId, date, category, _synced',
      speakingLanguages: 'id, userId, language, _synced',
      speakingMaterials: 'id, date, language, module',
      speakingLogs: 'id, userId, date, language, module, _synced',
      illnessLogs: 'id, userId, date, _synced',
      menstrualLogs: 'id, userId, startDate, _synced',
      wellness: 'id, date',
      medicationLogs: 'id, userId, startDate, _synced',
      moodLogs: 'id, userId, date, _synced',
      emotionEntries: 'id, userId, date, _synced',
      travelCities: 'id, userId, country, _synced',
      travelRecommendations: 'id, date',
      countryKnowledge: 'id, date',
      portfolioItems: 'id, userId, type, _synced',
      financeInfo: 'id, date',
      businessIdeas: 'id, userId, status, _synced',
      businessProjects: 'id, userId, category, stage, _synced',
      businessTransactions: 'id, userId, date, type, _synced',
      syncQueue: '++id, table, operation, timestamp',
    });
  }
}

let dbInstance: AppDatabase | null = null;

export function getDatabase(): AppDatabase {
  if (!dbInstance) {
    dbInstance = new AppDatabase();
  }
  return dbInstance;
}

export function isIndexedDBAvailable(): boolean {
  try { return typeof indexedDB !== 'undefined' && indexedDB !== null; } catch { return false; }
}
