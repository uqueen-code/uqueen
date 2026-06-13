'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getTodayString } from '@/lib/utils/date';
import { Severity, FlowIntensity } from '@/types/enums';
import type { IllnessLog, MenstrualLog, DailyWellness, MedicationLog } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

// Wellness recommendations by cycle phase
const WELLNESS_DATA: Record<string, { diet: string; exercise: string; tips: string }> = {
  menstrual: {
    diet: '推荐：红枣枸杞茶、温补鸡汤、深色蔬菜、全谷物。补充铁质与维生素B族，避免生冷食物。',
    exercise: '推荐：轻柔瑜伽（猫式、婴儿式）、散步15-20分钟。避免剧烈运动和倒立体式。',
    tips: '注意保暖，尤其是腹部和腰部。热水袋热敷可缓解不适。保持充足睡眠。',
  },
  follicular: {
    diet: '推荐：高蛋白食物（鸡蛋、鱼肉）、新鲜蔬果、坚果。身体代谢加快，是补充营养的好时机。',
    exercise: '推荐：中等强度有氧（慢跑、游泳）、力量训练。身体能量充沛，适合挑战新记录。',
    tips: '雌激素上升期，皮肤状态好转，精力充沛。适合开启新计划和社交活动。',
  },
  ovulation: {
    diet: '推荐：富含锌的食物（牡蛎、南瓜籽）、绿叶蔬菜、优质脂肪（牛油果）。',
    exercise: '推荐：HIIT、高强度训练、团体运动。身体处于巅峰状态，适合突破性训练。',
    tips: '身体状态最佳时期，适合重要会议和决策。注意补充水分。',
  },
  luteal: {
    diet: '推荐：复合碳水（燕麦、糙米）、镁含量高的食物（黑巧克力、香蕉）。减少咖啡因和盐分摄入。',
    exercise: '推荐：瑜伽、普拉提、散步。强度逐渐降低，听从身体的信号。',
    tips: '可能出现情绪波动和水肿，这是正常的生理现象。给自己多一些宽容和休息时间。',
  },
  general: {
    diet: '推荐：均衡饮食，多吃蔬菜水果、全谷物、优质蛋白。每天喝足8杯水。',
    exercise: '推荐：每周150分钟中等强度运动 + 2次力量训练。选择你喜欢的运动方式。',
    tips: '健康的生活方式是最好的投资。规律作息、适度运动、保持好心情。',
  },
};

function getDayIndex(): number {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

export function useHealth() {
  const [illnessLogs, setIllnessLogs] = useState<IllnessLog[]>([]);
  const [menstrualLogs, setMenstrualLogs] = useState<MenstrualLog[]>([]);
  const [dailyWellness, setDailyWellness] = useState<DailyWellness | null>(null);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;
  const today = getTodayString();
  const dayIdx = getDayIndex();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const [ill, men, wel, med] = await Promise.all([
        db.illnessLogs.where('userId').equals(userId).reverse().limit(30).toArray(),
        db.menstrualLogs.where('userId').equals(userId).reverse().limit(12).toArray(),
        db.wellness.where('date').equals(today).first(),
        db.medicationLogs.where('userId').equals(userId).reverse().limit(50).toArray(),
      ]);

      setIllnessLogs(ill.map(i => ({ id: i.id, userId: i.userId, date: i.date, illnessType: i.illnessType, severity: i.severity as Severity | null, symptoms: i.symptoms, medication: i.medication, recoveryDate: i.recoveryDate, notes: i.notes, createdAt: i.createdAt })));
      setMenstrualLogs(men.map(m => ({ id: m.id, userId: m.userId, startDate: m.startDate, endDate: m.endDate, cycleLength: m.cycleLength, symptoms: m.symptoms, flowIntensity: m.flowIntensity as FlowIntensity | null, notes: m.notes, createdAt: m.createdAt })));
      setMedicationLogs(med.map(m => ({ id: m.id, userId: m.userId, medicationName: m.medicationName, reason: m.reason, startDate: m.startDate, duration: m.duration, dosage: m.dosage, notes: m.notes, isCompleted: m.isCompleted, createdAt: m.createdAt, updatedAt: m.updatedAt })));

      if (wel) {
        setDailyWellness({ id: wel.id, date: wel.date, dietRecommendation: wel.dietRecommendation, exerciseRecommendation: wel.exerciseRecommendation, wellnessTips: wel.wellnessTips, suitableFor: wel.suitableFor });
      } else {
        // Generate daily wellness
        const phases = Object.keys(WELLNESS_DATA);
        const phase = phases[dayIdx % phases.length]!;
        const wData = WELLNESS_DATA[phase]!;
        const wellness: DailyWellness = { id: `well_${today}`, date: today, dietRecommendation: wData.diet, exerciseRecommendation: wData.exercise, wellnessTips: wData.tips, suitableFor: phase };
        await db.wellness.put(wellness);
        setDailyWellness(wellness);
      }
    } catch { /* */ }
    finally { setIsLoading(false); }
  }, [userId, today, dayIdx]);

  useEffect(() => { loadData(); }, [loadData]);

  // Log illness
  const logIllness = useCallback(async (data: {
    date: string; illnessType: string; severity?: Severity;
    symptoms?: string; medication?: string; recoveryDate?: string; notes?: string;
  }): Promise<IllnessLog> => {
    const id = crypto.randomUUID?.() ?? `ill_${Date.now()}`;
    const log: IllnessLog = {
      id, userId, date: data.date, illnessType: data.illnessType,
      severity: data.severity ?? null, symptoms: data.symptoms ?? null,
      medication: data.medication ?? null, recoveryDate: data.recoveryDate ?? null,
      notes: data.notes ?? null, createdAt: new Date().toISOString(),
    };
    const db = getDatabase();
    await db.illnessLogs.put({ ...log, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'illness_logs', operation: 'insert', recordId: id, data: log as unknown as Record<string, unknown> });
    setIllnessLogs(prev => [log, ...prev]);
    return log;
  }, [userId, addToSyncQueue]);

  // Log menstrual
  const logMenstrual = useCallback(async (data: {
    startDate: string; endDate?: string; cycleLength?: number;
    symptoms?: string; flowIntensity?: FlowIntensity; notes?: string;
  }): Promise<MenstrualLog> => {
    const id = crypto.randomUUID?.() ?? `men_${Date.now()}`;
    const log: MenstrualLog = {
      id, userId, startDate: data.startDate, endDate: data.endDate ?? null,
      cycleLength: data.cycleLength ?? null, symptoms: data.symptoms ?? null,
      flowIntensity: data.flowIntensity ?? null, notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    const db = getDatabase();
    await db.menstrualLogs.put({ ...log, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'menstrual_logs', operation: 'insert', recordId: id, data: log as unknown as Record<string, unknown> });
    setMenstrualLogs(prev => [log, ...prev]);
    return log;
  }, [userId, addToSyncQueue]);

  // Log medication
  const logMedication = useCallback(async (data: {
    medicationName: string; reason: string; startDate: string;
    duration: string; dosage?: string; notes?: string;
  }): Promise<MedicationLog> => {
    const id = crypto.randomUUID?.() ?? `med_${Date.now()}`;
    const now = new Date().toISOString();
    const log: MedicationLog = {
      id, userId, medicationName: data.medicationName, reason: data.reason,
      startDate: data.startDate, duration: data.duration,
      dosage: data.dosage ?? null, notes: data.notes ?? null,
      isCompleted: false, createdAt: now, updatedAt: now,
    };
    const db = getDatabase();
    await db.medicationLogs.put({ ...log, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'medication_logs', operation: 'insert', recordId: id, data: log as unknown as Record<string, unknown> });
    setMedicationLogs(prev => [log, ...prev]);
    return log;
  }, [userId, addToSyncQueue]);

  // Delete medication
  const deleteMedication = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.medicationLogs.delete(id);
    addToSyncQueue({ table: 'medication_logs', operation: 'delete', recordId: id, data: {} });
    setMedicationLogs(prev => prev.filter(m => m.id !== id));
  }, [addToSyncQueue]);

  // Predict next cycle
  const lastMenstrual = menstrualLogs[0] ?? null;
  const avgCycleLength = menstrualLogs.length >= 2
    ? Math.round(menstrualLogs.slice(0, 3).reduce((s, l) => s + (l.cycleLength ?? 28), 0) / Math.min(3, menstrualLogs.length))
    : 28;

  const predictedNextDate = lastMenstrual?.startDate
    ? new Date(new Date(lastMenstrual.startDate).getTime() + avgCycleLength * 86400000).toISOString().split('T')[0]
    : null;

  return {
    illnessLogs, menstrualLogs, dailyWellness,
    medicationLogs,
    lastMenstrual, avgCycleLength, predictedNextDate,
    isLoading, logIllness, logMenstrual, logMedication, deleteMedication,
    refresh: loadData,
  };
}
