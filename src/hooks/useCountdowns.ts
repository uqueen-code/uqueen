'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { differenceInDays, parseISO } from 'date-fns';
import type { Countdown } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

export function useCountdowns() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;

  const loadCountdowns = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const data = await db.countdowns.where('userId').equals(userId).toArray();
      const now = new Date();
      const mapped: Countdown[] = data.map((c) => ({
        id: c.id,
        userId: c.userId,
        title: c.title,
        targetDate: c.targetDate,
        isRecurring: c.isRecurring,
        recurType: c.recurType as Countdown['recurType'],
        color: c.color,
        daysRemaining: Math.max(0, differenceInDays(parseISO(c.targetDate), now)),
        createdAt: c.createdAt,
      }));
      mapped.sort((a, b) => (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999));
      setCountdowns(mapped);
    } catch {
      setCountdowns([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadCountdowns(); }, [loadCountdowns]);

  const createCountdown = useCallback(async (data: {
    title: string;
    targetDate: string;
    isRecurring?: boolean;
    recurType?: string;
    color?: string;
  }): Promise<Countdown> => {
    const id = crypto.randomUUID?.() ?? `cd_${Date.now()}`;
    const now = new Date();
    const cd: Countdown = {
      id,
      userId,
      title: data.title,
      targetDate: data.targetDate,
      isRecurring: data.isRecurring ?? false,
      recurType: data.recurType ?? null,
      color: data.color ?? '#6366f1',
      daysRemaining: Math.max(0, differenceInDays(parseISO(data.targetDate), now)),
      createdAt: new Date().toISOString(),
    };

    const db = getDatabase();
    await db.countdowns.put({ ...cd, _synced: false, _modifiedAt: Date.now() });

    addToSyncQueue({ table: 'countdowns', operation: 'insert', recordId: id, data: cd as unknown as Record<string, unknown> });

    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from('countdowns').insert({ id, user_id: userId, title: cd.title, target_date: cd.targetDate, is_recurring: cd.isRecurring, recur_type: cd.recurType, color: cd.color });
        await db.countdowns.update(id, { _synced: true });
      } catch { /* sync later */ }
    }

    setCountdowns((prev) => {
      const next = [...prev, cd];
      next.sort((a, b) => (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999));
      return next;
    });
    return cd;
  }, [userId, effectiveOnline, addToSyncQueue]);

  const deleteCountdown = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.countdowns.delete(id);
    addToSyncQueue({ table: 'countdowns', operation: 'delete', recordId: id, data: {} });
    setCountdowns((prev) => prev.filter((c) => c.id !== id));
  }, [addToSyncQueue]);

  return { countdowns, isLoading, createCountdown, deleteCountdown, refresh: loadCountdowns };
}
