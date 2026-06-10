'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { differenceInDays, parseISO } from 'date-fns';
import { GoalType } from '@/types/enums';
import type { Goal } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const data = await db.goals.where('userId').equals(userId).toArray();
      const mapped: Goal[] = data.map((g) => ({
        id: g.id,
        userId: g.userId,
        title: g.title,
        description: g.description,
        type: g.type as GoalType,
        year: g.year,
        deadline: g.deadline,
        progress: g.progress,
        isCompleted: g.isCompleted,
        daysRemaining: g.deadline ? Math.max(0, differenceInDays(parseISO(g.deadline), new Date())) : undefined,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }));
      // Sort: shorter deadline first
      mapped.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
      setGoals(mapped);
    } catch {
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const createGoal = useCallback(async (data: {
    title: string;
    description?: string;
    type?: GoalType;
    year?: number;
    deadline?: string;
  }): Promise<Goal> => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID?.() ?? `goal_${Date.now()}`;
    const goal: Goal = {
      id,
      userId,
      title: data.title,
      description: data.description ?? null,
      type: data.type ?? GoalType.YEARLY,
      year: data.year ?? new Date().getFullYear(),
      deadline: data.deadline ?? null,
      progress: 0,
      isCompleted: false,
      daysRemaining: data.deadline ? Math.max(0, differenceInDays(parseISO(data.deadline), new Date())) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const db = getDatabase();
    await db.goals.put({ ...goal, _synced: false, _modifiedAt: Date.now() });

    addToSyncQueue({ table: 'goals', operation: 'insert', recordId: id, data: goal as unknown as Record<string, unknown> });

    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await (supabase.from('goals') as any).insert({ id, user_id: userId, title: goal.title, description: goal.description, type: goal.type, year: goal.year, deadline: goal.deadline, progress: 0 });
        await db.goals.update(id, { _synced: true });
      } catch { /* sync later */ }
    }

    setGoals((prev) => {
      const next = [...prev, goal];
      next.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
      return next;
    });
    return goal;
  }, [userId, effectiveOnline, addToSyncQueue]);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    const db = getDatabase();
    await db.goals.update(id, { progress, updatedAt: new Date().toISOString(), _synced: false, _modifiedAt: Date.now() });

    addToSyncQueue({ table: 'goals', operation: 'update', recordId: id, data: { progress } });

    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress, updatedAt: new Date().toISOString() } : g)));
  }, [addToSyncQueue]);

  const deleteGoal = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.goals.delete(id);
    addToSyncQueue({ table: 'goals', operation: 'delete', recordId: id, data: {} });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, [addToSyncQueue]);

  return { goals, isLoading, createGoal, updateProgress, deleteGoal, refresh: loadGoals };
}
