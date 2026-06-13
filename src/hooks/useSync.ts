'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useOfflineStore } from '@/stores/offlineStore';
import { useAuthStore } from '@/stores/authStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import toast from 'react-hot-toast';

const SYNC_INTERVAL = 30000;

export function useSync() {
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const syncStatus = useOfflineStore((s) => s.syncStatus);
  const setSyncStatus = useOfflineStore((s) => s.setSyncStatus);
  const setLastSyncAt = useOfflineStore((s) => s.setLastSyncAt);
  const syncQueue = useOfflineStore((s) => s.syncQueue);
  const removeFromSyncQueue = useOfflineStore((s) => s.removeFromSyncQueue);
  const user = useAuthStore((s) => s.user);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasOffline = useRef(false);

  const effectiveOnline = isOnline && !offlineMode && !!user && isSupabaseConfigured();

  const pushChanges = useCallback(async () => {
    if (syncQueue.length === 0 || !effectiveOnline) return;
    setSyncStatus('syncing');
    const db = getDatabase();
    try {
      const supabase = getSupabaseBrowserClient();
      let pushed = 0;
      const tableMap: Record<string, string> = {
        todos: 'todos', habit_logs: 'habit_logs', goals: 'goals',
        countdowns: 'countdowns', fitness_data: 'fitness_data',
        fitness_plans: 'fitness_plans', exercise_logs: 'exercise_logs',
        reading_logs: 'reading_logs', learning_categories: 'learning_categories',
        learning_plans: 'learning_plans', learning_logs: 'learning_logs',
        speaking_languages: 'speaking_languages', speaking_logs: 'speaking_logs',
        illness_logs: 'illness_logs', menstrual_logs: 'menstrual_logs',
        portfolio_items: 'portfolio_items',
        mood_logs: 'mood_logs', emotion_entries: 'emotion_entries',
        travel_cities: 'travel_cities',
      };
      for (const item of syncQueue) {
        try {
          const table = tableMap[item.table] ?? item.table;
          switch (item.operation) {
            case 'insert':
              await (supabase.from(table) as any).upsert(
                { ...item.data, user_id: user!.id, id: item.recordId },
                { onConflict: 'id' }
              );
              break;
            case 'update': {
              const updates = { ...item.data };
              delete (updates as any).id;
              await (supabase.from(table) as any).update(updates).eq('id', item.recordId).eq('user_id', user!.id);
              break;
            }
            case 'delete':
              await (supabase.from(table) as any).delete().eq('id', item.recordId).eq('user_id', user!.id);
              break;
          }
          try { await (db as any)[item.table]?.update?.(item.recordId, { _synced: true }); } catch { /* */ }
          removeFromSyncQueue(item.id);
          pushed++;
        } catch (err) {
          console.warn(`Sync failed for ${item.table}/${item.recordId}:`, err);
        }
      }
      if (pushed > 0) {
        setLastSyncAt(new Date().toISOString());
        toast.success(`同步完成：${pushed} 条记录`, { icon: '☁️', duration: 2000 });
      }
      setSyncStatus('idle');
    } catch (err) {
      console.error('Sync push error:', err);
      setSyncStatus('error');
    }
  }, [syncQueue, effectiveOnline, user, setSyncStatus, setLastSyncAt, removeFromSyncQueue]);

  const pullChanges = useCallback(async () => {
    if (!effectiveOnline) return;
    try {
      const supabase = getSupabaseBrowserClient();
      const db = getDatabase();
      const tableMap: Array<{ table: string; dexieTable: string }> = [
        { table: 'todos', dexieTable: 'todos' },
        { table: 'habit_logs', dexieTable: 'habitLogs' },
        { table: 'goals', dexieTable: 'goals' },
        { table: 'countdowns', dexieTable: 'countdowns' },
        { table: 'fitness_data', dexieTable: 'fitnessData' },
        { table: 'fitness_plans', dexieTable: 'fitnessPlans' },
        { table: 'exercise_logs', dexieTable: 'exerciseLogs' },
        { table: 'reading_logs', dexieTable: 'readingLogs' },
        { table: 'learning_categories', dexieTable: 'learningCategories' },
        { table: 'learning_plans', dexieTable: 'learningPlans' },
        { table: 'learning_logs', dexieTable: 'learningLogs' },
        { table: 'speaking_languages', dexieTable: 'speakingLanguages' },
        { table: 'speaking_logs', dexieTable: 'speakingLogs' },
        { table: 'illness_logs', dexieTable: 'illnessLogs' },
        { table: 'menstrual_logs', dexieTable: 'menstrualLogs' },
        { table: 'portfolio_items', dexieTable: 'portfolioItems' },
        { table: 'mood_logs', dexieTable: 'moodLogs' },
        { table: 'emotion_entries', dexieTable: 'emotionEntries' },
        { table: 'travel_cities', dexieTable: 'travelCities' },
      ];
      for (const { table, dexieTable } of tableMap) {
        try {
          const { data } = await (supabase.from(table) as any).select('*').eq('user_id', user!.id);
          if (data && data.length > 0) {
            const records = data.map((row: any) => ({
              ...row, userId: row.user_id, _synced: true, _modifiedAt: Date.now(),
            }));
            await (db as any)[dexieTable]?.bulkPut?.(records);
          }
        } catch { /* */ }
      }
      setLastSyncAt(new Date().toISOString());
    } catch (err) {
      console.error('Sync pull error:', err);
    }
  }, [effectiveOnline, user, setLastSyncAt]);

  const fullSync = useCallback(async () => {
    await pushChanges();
    await pullChanges();
  }, [pushChanges, pullChanges]);

  useEffect(() => {
    if (effectiveOnline && wasOffline.current) {
      wasOffline.current = false;
      fullSync();
    }
    if (!effectiveOnline) {
      wasOffline.current = true;
    }
    if (effectiveOnline) {
      intervalRef.current = setInterval(() => { pushChanges(); }, SYNC_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [effectiveOnline, pushChanges, fullSync]);

  return {
    syncStatus,
    isOnline: effectiveOnline,
    syncNow: fullSync,
    pendingCount: syncQueue.length,
  };
}
