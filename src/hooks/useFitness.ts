'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { FitnessFocus } from '@/types/enums';
import type { FitnessData, FitnessPlan, ExerciseLog } from '@/types/models';
import type { Intensity } from '@/types/enums';

const PLACEHOLDER_USER_ID = 'local-user';

/**
 * Hook for fitness data, plans, and exercise logging.
 */
export function useFitness() {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [plans, setPlans] = useState<FitnessPlan[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;

  // Load all fitness data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const [fd, fp, el] = await Promise.all([
        db.fitnessData.where('userId').equals(userId).first(),
        db.fitnessPlans.where('userId').equals(userId).toArray(),
        db.exerciseLogs.where('userId').equals(userId).reverse().limit(30).toArray(),
      ]);
      setFitnessData(fd ? { id: fd.id, userId: fd.userId, currentWeight: fd.currentWeight, targetWeight: fd.targetWeight, height: fd.height, focusArea: fd.focusArea as FitnessFocus | null, bodyParts: fd.bodyParts, createdAt: fd.createdAt, updatedAt: fd.updatedAt } : null);
      setPlans(fp.map(p => ({ id: p.id, userId: p.userId, fitnessDataId: p.fitnessDataId, name: p.name, planData: p.planData, isAccepted: p.isAccepted, acceptedAt: p.acceptedAt, createdAt: p.createdAt })));
      setExerciseLogs(el.map(e => ({ id: e.id, userId: e.userId, date: e.date, exerciseType: e.exerciseType, durationMinutes: e.durationMinutes, intensity: e.intensity as Intensity | null, caloriesBurned: e.caloriesBurned, notes: e.notes, createdAt: e.createdAt })));
    } catch { /* empty */ }
    finally { setIsLoading(false); }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Save/update fitness data (weight, height, goals)
  const saveFitnessData = useCallback(async (data: {
    currentWeight?: number; targetWeight?: number; height?: number;
    focusArea?: FitnessFocus; bodyParts?: string[];
  }): Promise<FitnessData> => {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = fitnessData?.id ?? (crypto.randomUUID?.() ?? `fd_${Date.now()}`);
    const existing = fitnessData;

    const updated: FitnessData = {
      id,
      userId,
      currentWeight: data.currentWeight ?? existing?.currentWeight ?? null,
      targetWeight: data.targetWeight ?? existing?.targetWeight ?? null,
      height: data.height ?? existing?.height ?? null,
      focusArea: data.focusArea ?? existing?.focusArea ?? null,
      bodyParts: data.bodyParts ?? existing?.bodyParts ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await db.fitnessData.put({ ...updated, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'fitness_data', operation: existing ? 'update' : 'insert', recordId: id, data: updated as unknown as Record<string, unknown> });

    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from('fitness_data').upsert({ id, user_id: userId, current_weight: data.currentWeight, target_weight: data.targetWeight, height: data.height, focus_area: data.focusArea, body_parts: data.bodyParts }, { onConflict: 'user_id' });
        await db.fitnessData.update(id, { _synced: true });
      } catch { /* sync later */ }
    }

    setFitnessData(updated);
    return updated;
  }, [fitnessData, userId, effectiveOnline, addToSyncQueue]);

  // Generate a smart workout plan based on fitness data
  const generatePlan = useCallback(async (fd: FitnessData): Promise<FitnessPlan> => {
    const id = crypto.randomUUID?.() ?? `plan_${Date.now()}`;
    const focus = fd.focusArea ?? '综合';

    // Generate daily tasks (7-day cycle, repeating for 30 days)
    const dailyExercises: Record<string, Array<{ exercise: string; duration: number; sets?: number; reps?: number; notes?: string }>> = {
      '塑形': [
        { exercise: '瑜伽拉伸', duration: 30, notes: '全身拉伸，改善体态' },
        { exercise: '普拉提', duration: 45, notes: '核心力量训练' },
        { exercise: '力量训练（上肢）', duration: 40, sets: 3, reps: 12 },
        { exercise: '有氧操', duration: 35, notes: '保持心率在130-150' },
        { exercise: '力量训练（下肢）', duration: 40, sets: 3, reps: 12 },
        { exercise: '游泳', duration: 45, notes: '低强度有氧' },
        { exercise: '休息日', duration: 0, notes: '散步30分钟即可' },
      ],
      '燃脂': [
        { exercise: 'HIIT训练', duration: 25, notes: '高强度间歇，尽全力' },
        { exercise: '跑步', duration: 40, notes: '配速6-7min/km' },
        { exercise: '跳绳+核心', duration: 30, sets: 5, reps: 100 },
        { exercise: '动感单车', duration: 45, notes: '保持高踏频' },
        { exercise: '波比跳+力量循环', duration: 30, sets: 4, reps: 15 },
        { exercise: '游泳', duration: 50, notes: '自由泳为主' },
        { exercise: '休息日', duration: 0, notes: '轻度拉伸即可' },
      ],
      '增肌': [
        { exercise: '胸+三头', duration: 50, sets: 4, reps: 10 },
        { exercise: '背+二头', duration: 50, sets: 4, reps: 10 },
        { exercise: '腿部', duration: 55, sets: 4, reps: 8 },
        { exercise: '肩部+腹部', duration: 45, sets: 4, reps: 12 },
        { exercise: '全身复合训练', duration: 50, sets: 3, reps: 8 },
        { exercise: '有氧恢复', duration: 30, notes: '慢跑或骑行' },
        { exercise: '休息日', duration: 0, notes: '充分休息，补充蛋白质' },
      ],
      '综合': [
        { exercise: '跑步', duration: 30, notes: '中等强度' },
        { exercise: '力量训练（全身）', duration: 45, sets: 3, reps: 12 },
        { exercise: '瑜伽/拉伸', duration: 35, notes: '提高柔韧性' },
        { exercise: 'HIIT', duration: 25, notes: '燃脂+塑形' },
        { exercise: '游泳/骑行', duration: 45, notes: '有氧耐力' },
        { exercise: '力量+有氧组合', duration: 40, sets: 3, reps: 10 },
        { exercise: '休息日', duration: 0, notes: '轻松散步' },
      ],
    };

    const exercises = dailyExercises[focus] ?? dailyExercises['综合']!;
    const daily = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      ...exercises[i % 7]!,
    }));

    const monthly = [
      { month: 1, goal: '建立运动习惯，完成率≥80%', targetWeight: fd.currentWeight ? fd.currentWeight! - 1 : undefined },
      { month: 2, goal: '提升运动强度，增加肌肉量', targetWeight: fd.currentWeight ? fd.currentWeight! - 2 : undefined },
      { month: 3, goal: '达成阶段性体型目标', targetWeight: fd.targetWeight ?? undefined },
    ];

    const plan: FitnessPlan = {
      id, userId, fitnessDataId: fd.id, name: `${focus}定制方案`,
      planData: { daily, monthly }, isAccepted: false, acceptedAt: null,
      createdAt: new Date().toISOString(),
    };

    const db = getDatabase();
    await db.fitnessPlans.put({ ...plan, _synced: false, _modifiedAt: Date.now() });

    setPlans(prev => [...prev, plan]);
    return plan;
  }, [userId]);

  // Check if we should auto-generate a plan
  const shouldGeneratePlan = useMemo(() => {
    return fitnessData && fitnessData.currentWeight && fitnessData.height && plans.length === 0;
  }, [fitnessData, plans]);

  // Accept a plan → links tasks to dashboard todos
  const acceptPlan = useCallback(async (planId: string) => {
    const db = getDatabase();
    const now = new Date().toISOString();
    await db.fitnessPlans.update(planId, { isAccepted: true, acceptedAt: now, _synced: false, _modifiedAt: Date.now() });
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, isAccepted: true, acceptedAt: now } : p));
    // Returns the plan so the Dashboard page can create todos from it
    return plans.find(p => p.id === planId) ?? null;
  }, [plans]);

  // Log an exercise
  const logExercise = useCallback(async (data: {
    exerciseType: string; durationMinutes?: number; intensity?: Intensity; caloriesBurned?: number; notes?: string;
  }): Promise<ExerciseLog> => {
    const id = crypto.randomUUID?.() ?? `ex_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0]!;
    const log: ExerciseLog = {
      id, userId, date: today, exerciseType: data.exerciseType,
      durationMinutes: data.durationMinutes ?? null,
      intensity: data.intensity ?? null,
      caloriesBurned: data.caloriesBurned ?? null,
      notes: data.notes ?? null, createdAt: new Date().toISOString(),
    };

    const db = getDatabase();
    await db.exerciseLogs.put({ ...log, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'exercise_logs', operation: 'insert', recordId: id, data: log as unknown as Record<string, unknown> });

    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from('exercise_logs').insert({ id, user_id: userId, date: today, exercise_type: data.exerciseType, duration_minutes: data.durationMinutes, intensity: data.intensity, calories_burned: data.caloriesBurned, notes: data.notes });
        await db.exerciseLogs.update(id, { _synced: true });
      } catch { /* sync later */ }
    }

    setExerciseLogs(prev => [log, ...prev]);
    return log;
  }, [userId, effectiveOnline, addToSyncQueue]);

  return {
    fitnessData, plans, exerciseLogs, isLoading,
    saveFitnessData, generatePlan, acceptPlan, logExercise,
    shouldGeneratePlan, refresh: loadData,
  };
}

// Motivational messages for post-exercise check-in
export const EXERCISE_MOTIVATIONS = [
  '太棒了！每一次坚持都是对未来的自己最好的礼物。继续加油！💪',
  '汗水不会骗人，今天的你比昨天更强大！🔥',
  '没有人能随随便便成功，但你正在用行动证明自己！✨',
  '健身是一场与自己的对话，今天的对话非常精彩！🌟',
  '每一个不放弃的瞬间，都是你蜕变的证明。骄傲吧！🏆',
  '自律即自由，你今天又向自由迈进了一大步！🦋',
  '最好的投资是投资自己，你今天的分红是健康和自信！💰',
  '生活不会辜负每一个认真努力的人，包括正在运动的你！❤️',
];
