'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getTodayString } from '@/lib/utils/date';
import { LEARNING_CATEGORIES, type LearningCategory } from '@/types/enums';
import type { LearningCategoryState, LearningPlan, LearningLog } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

export function useLearning() {
  const [categories, setCategories] = useState<LearningCategoryState[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;
  const today = getTodayString();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const [cats, pl, lg] = await Promise.all([
        db.learningCategories.where('userId').equals(userId).toArray(),
        db.learningPlans.where('userId').equals(userId).toArray(),
        db.learningLogs.where('userId').equals(userId).reverse().limit(50).toArray(),
      ]);

      // Ensure all categories exist
      const existingCats = new Set(cats.map(c => c.category));
      const allCats: LearningCategoryState[] = LEARNING_CATEGORIES.map(cat => {
        const existing = cats.find(c => c.category === cat);
        return {
          id: existing?.id ?? `lcat_${userId}_${cat}`,
          userId,
          category: cat,
          isActive: existing?.isActive ?? false,
        };
      });
      setCategories(allCats);
      setPlans(pl.map(p => ({ id: p.id, userId: p.userId, category: p.category, title: p.title, methodDescription: p.methodDescription, filePath: p.filePath, planData: p.planData, isAccepted: p.isAccepted, localResourcePath: p.localResourcePath, createdAt: p.createdAt, updatedAt: p.updatedAt })));
      setLogs(lg.map(l => ({ id: l.id, userId: l.userId, date: l.date, category: l.category, planId: l.planId, completed: l.completed, notes: l.notes, createdAt: l.createdAt })));
    } catch { /* */ }
    finally { setIsLoading(false); }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Toggle category visibility
  const toggleCategory = useCallback(async (category: string) => {
    const db = getDatabase();
    const existing = categories.find(c => c.category === category);
    if (!existing) return;
    const newActive = !existing.isActive;
    const id = existing.id;

    await db.learningCategories.put({
      id, userId, category, isActive: newActive,
      _synced: false, _modifiedAt: Date.now(),
    });

    addToSyncQueue({ table: 'learning_categories', operation: existing.isActive === false && newActive ? 'insert' : 'update', recordId: id, data: { category, isActive: newActive } });

    setCategories(prev => prev.map(c => c.category === category ? { ...c, isActive: newActive } : c));
  }, [categories, userId, addToSyncQueue]);

  // Save/create learning plan
  const savePlan = useCallback(async (data: {
    category: string; title: string; methodDescription?: string;
    planData?: Record<string, unknown>; localResourcePath?: string;
  }): Promise<LearningPlan> => {
    const db = getDatabase();
    const id = crypto.randomUUID?.() ?? `lp_${Date.now()}`;
    const now = new Date().toISOString();
    const plan: LearningPlan = {
      id, userId, category: data.category, title: data.title,
      methodDescription: data.methodDescription ?? null,
      filePath: null, planData: data.planData ?? null,
      isAccepted: false, localResourcePath: data.localResourcePath ?? null,
      createdAt: now, updatedAt: now,
    };

    await db.learningPlans.put({ ...plan, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'learning_plans', operation: 'insert', recordId: id, data: plan as unknown as Record<string, unknown> });

    setPlans(prev => [...prev, plan]);
    return plan;
  }, [userId, addToSyncQueue]);

  // Accept plan → returns plan for todo creation
  const acceptPlan = useCallback(async (planId: string) => {
    const db = getDatabase();
    const now = new Date().toISOString();
    await db.learningPlans.update(planId, { isAccepted: true, updatedAt: now, _synced: false, _modifiedAt: Date.now() });
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, isAccepted: true, updatedAt: now } : p));
    return plans.find(p => p.id === planId) ?? null;
  }, [plans]);

  // Log a learning session
  const logLearning = useCallback(async (data: {
    category: string; completed?: boolean; notes?: string; planId?: string;
  }): Promise<LearningLog> => {
    const id = crypto.randomUUID?.() ?? `llog_${Date.now()}`;
    const log: LearningLog = {
      id, userId, date: today, category: data.category,
      planId: data.planId ?? null, completed: data.completed ?? true,
      notes: data.notes ?? null, createdAt: new Date().toISOString(),
    };

    const db = getDatabase();
    await db.learningLogs.put({ ...log, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'learning_logs', operation: 'insert', recordId: id, data: log as unknown as Record<string, unknown> });
    setLogs(prev => [log, ...prev]);
    return log;
  }, [userId, today, addToSyncQueue]);

  // Get today's logs
  const todayLogs = logs.filter(l => l.date === today);
  const activeCategories = categories.filter(c => c.isActive).map(c => c.category);

  return {
    categories, plans, logs, todayLogs, activeCategories,
    isLoading, toggleCategory, savePlan, acceptPlan, logLearning,
    refresh: loadData,
  };
}
