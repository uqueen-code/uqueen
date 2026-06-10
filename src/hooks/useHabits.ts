'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getTodayString } from '@/lib/utils/date';
import { HABIT_CATEGORIES, type HabitCategory } from '@/types/enums';
import type { HabitLog } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

export interface HabitState {
  [category: string]: boolean;
}

/**
 * Hook for daily habit tracking (7 categories).
 */
export function useHabits() {
  const [habits, setHabits] = useState<HabitState>({});
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;
  const today = getTodayString();

  // Initialize habits state (all unchecked)
  const initState = useCallback(() => {
    const state: HabitState = {};
    HABIT_CATEGORIES.forEach((cat) => { state[cat] = false; });
    return state;
  }, []);

  // Load today's habits
  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const logs = await db.habitLogs
        .where('userId')
        .equals(userId)
        .filter((log) => log.date === today)
        .toArray();

      const state = initState();
      logs.forEach((log) => {
        if (log.category in state) {
          state[log.category] = log.completed;
        }
      });
      setHabits(state);
    } catch {
      setHabits(initState());
    } finally {
      setIsLoading(false);
    }
  }, [userId, today, initState]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Toggle a habit
  const toggleHabit = useCallback(async (category: HabitCategory) => {
    const newCompleted = !habits[category];
    const db = getDatabase();
    const id = crypto.randomUUID?.() ?? `habit_${Date.now()}`;

    // Check if record already exists
    const existing = await db.habitLogs
      .where('userId')
      .equals(userId)
      .filter((log) => log.date === today && log.category === category)
      .first();

    if (existing) {
      await db.habitLogs.update(existing.id, {
        completed: newCompleted,
        _synced: false,
        _modifiedAt: Date.now(),
      });
      addToSyncQueue({
        table: 'habit_logs',
        operation: 'update',
        recordId: existing.id,
        data: { completed: newCompleted },
      });
    } else {
      await db.habitLogs.put({
        id,
        userId,
        date: today,
        category,
        completed: newCompleted,
        notes: null,
        createdAt: new Date().toISOString(),
        _synced: false,
        _modifiedAt: Date.now(),
      });
      addToSyncQueue({
        table: 'habit_logs',
        operation: 'insert',
        recordId: id,
        data: { id, user_id: userId, date: today, category, completed: newCompleted },
      });
    }

    // Try Supabase
    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await (supabase.from('habit_logs') as any).upsert({
          user_id: userId,
          date: today,
          category,
          completed: newCompleted,
        }, { onConflict: 'user_id,date,category' });
        if (existing) await db.habitLogs.update(existing.id, { _synced: true });
      } catch { /* sync later */ }
    }

    setHabits((prev) => ({ ...prev, [category]: newCompleted }));
  }, [habits, userId, today, effectiveOnline, addToSyncQueue]);

  // Get count of completed habits today
  const completedCount = Object.values(habits).filter(Boolean).length;
  const totalCount = HABIT_CATEGORIES.length;

  // Get habit logs for a date range (for heatmap)
  const getHabitsInRange = useCallback(async (startDate: string, endDate: string): Promise<HabitLog[]> => {
    const db = getDatabase();
    const logs = await db.habitLogs
      .where('userId')
      .equals(userId)
      .filter((log) => log.date >= startDate && log.date <= endDate && log.completed === true)
      .toArray();

    return logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      date: log.date,
      category: log.category as HabitCategory,
      completed: log.completed,
      notes: log.notes,
      createdAt: log.createdAt,
    }));
  }, [userId]);

  return {
    habits,
    isLoading,
    toggleHabit,
    completedCount,
    totalCount,
    getHabitsInRange,
    refresh: loadHabits,
  };
}
