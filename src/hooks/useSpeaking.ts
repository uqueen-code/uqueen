'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getTodayString } from '@/lib/utils/date';
import { SPEAKING_LANGUAGES, SpeakingModule, type SpeakingLanguage } from '@/types/enums';
import type { SpeakingLanguageState, SpeakingMaterial, SpeakingLog } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

// Mock speaking materials for each language × module
const SHADOWING_TEXTS: Record<string, { title: string; text: string }> = {
  '粤语': { title: '日常问候', text: '你好，今日天气好好，不如一齐去饮茶啊？我好钟意食点心，虾饺烧卖样样都好味。' },
  '英语': { title: 'Daily Conversation', text: 'The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle. As with all matters of the heart, you\'ll know when you find it.' },
  '法语': { title: 'Conversation quotidienne', text: 'La vie est belle quand on prend le temps de regarder autour de soi. Chaque jour est une nouvelle opportunité d\'apprendre et de grandir.' },
  '德语': { title: 'Tägliches Gespräch', text: 'Das Leben ist wie ein Buch. Jeder Tag ist eine neue Seite. Wer nicht reist, liest nur eine Seite. Die Welt gehört dem, der sie genießt.' },
  '意大利语': { title: 'Conversazione quotidiana', text: 'La vita è troppo breve per non fare ciò che ami. Ogni giorno è un dono, ogni momento è prezioso. Sorridi e il mondo sorriderà con te.' },
  '西班牙语': { title: 'Conversación diaria', text: 'La vida es aquello que pasa mientras estás ocupado haciendo otros planes. Cada día es una nueva oportunidad para ser feliz.' },
  '日语': { title: '日常会話', text: '努力する人は希望を語り、怠ける人は不満を語る。人生に夢があるのではなく、夢が人生をつくるのです。今日という日は、残りの人生の最初の一日です。' },
  '韩语': { title: '일상 대화', text: '인생은 짧습니다. 그러므로 당신이 사랑하는 일을 하세요. 매일 아침은 새로운 시작입니다. 어제의 실수에 집착하지 말고, 오늘의 기회를 잡으세요.' },
};

const PICTURE_TOPICS: Record<string, string[]> = {
  '粤语': ['茶餐厅的热闹场景', '维港夜景', '街市买餸', '行山远足'],
  '英语': ['A busy city street at dawn', 'A family having dinner together', 'A mountain landscape in autumn', 'Children playing in a park'],
  '法语': ['Un café parisien', 'Un marché provençal', 'La Tour Eiffel au coucher du soleil', 'Un vignoble en automne'],
  '德语': ['Ein Weihnachtsmarkt', 'Die Alpen im Winter', 'Ein Berliner Straßenfest', 'Ein Schloss am Rhein'],
  '意大利语': ['Una piazza a Roma', 'La costa amalfitana', 'Un mercato a Firenze', 'I canali di Venezia'],
  '西班牙语': ['La Sagrada Familia', 'Un patio andaluz', 'Las Ramblas de Barcelona', 'Una playa en Valencia'],
  '日语': ['京都の紅葉', '東京の朝の通勤風景', '静かな神社の境内', '賑やかな居酒屋'],
  '韩语': ['서울의 야경', '전통 시장의 풍경', '한강에서의 피크닉', '봄의 벚꽃 축제'],
};

const CONNECTED_SPEECH: Record<string, string[]> = [
  'What are you going to do? → Whacha gonna do?',
  'I want to go → I wanna go',
  'Did you eat yet? → Jeet yet?',
  'I have got to go → I gotta go',
  'Let me think about it → Lemme think about it',
  'I don\'t know → I dunno',
  'Going to the store → Goin\' to the store',
  'See you later → See ya later',
];

const TOPIC_READINGS: Record<string, string[]> = {
  '粤语': ['香港文化保育', '广式美食传承', '大湾区发展机遇', '粤语流行曲历史'],
  '英语': ['The Future of AI in Daily Life', 'Climate Change and Individual Action', 'The Art of Effective Communication', 'Cultural Diversity in the Modern World'],
  '法语': ['La gastronomie française', 'Le cinéma français contemporain', 'La mode éthique', 'Les énergies renouvelables'],
  '德语': ['Deutsche Ingenieurskunst', 'Nachhaltigkeit im Alltag', 'Die Zukunft der Arbeit', 'Deutsche Literatur der Gegenwart'],
  '意大利语': ['Il design italiano', 'La dieta mediterranea', 'L\'arte rinascimentale', 'La musica italiana contemporanea'],
  '西班牙语': ['La literatura latinoamericana', 'El turismo sostenible', 'La música flamenca', 'Las tradiciones indígenas'],
  '日语': ['日本の四季と行事', 'テクノロジーと伝統の融合', '日本の食文化', '働き方改革の未来'],
  '韩语': ['한류의 세계적 영향', '한국의 전통과 현대', 'K-뷰티의 비결', '한국의 교육 열정'],
};

function getDayIndex(): number {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

export function useSpeaking() {
  const [languages, setLanguages] = useState<SpeakingLanguageState[]>([]);
  const [materials, setMaterials] = useState<SpeakingMaterial[]>([]);
  const [logs, setLogs] = useState<SpeakingLog[]>([]);
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
      const [langs, mats, lgs] = await Promise.all([
        db.speakingLanguages.where('userId').equals(userId).toArray(),
        db.speakingMaterials.where('date').equals(today).toArray(),
        db.speakingLogs.where('userId').equals(userId).filter(l => l.date === today).toArray(),
      ]);

      // Ensure all languages exist
      const existingLangs = new Set(langs.map(l => l.language));
      const allLangs: SpeakingLanguageState[] = SPEAKING_LANGUAGES.map(lang => ({
        id: langs.find(l => l.language === lang)?.id ?? `slang_${userId}_${lang}`,
        userId, language: lang,
        isActive: langs.find(l => l.language === lang)?.isActive ?? false,
      }));
      setLanguages(allLangs);

      // Generate materials if not exist for today
      if (mats.length === 0) {
        const genMats = generateDailyMaterials(today, dayIdx);
        await db.speakingMaterials.bulkPut(genMats);
        setMaterials(genMats);
      } else {
        setMaterials(mats);
      }

      setLogs(lgs.map(l => ({
        id: l.id, userId: l.userId, date: l.date, language: l.language,
        module: l.module as SpeakingModule, completed: l.completed,
        notes: l.notes, createdAt: l.createdAt,
      })));
    } catch { /* */ }
    finally { setIsLoading(false); }
  }, [userId, today, dayIdx]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleLanguage = useCallback(async (language: string) => {
    const existing = languages.find(l => l.language === language);
    if (!existing) return;
    const newActive = !existing.isActive;
    const db = getDatabase();

    await db.speakingLanguages.put({
      id: existing.id, userId, language, isActive: newActive,
      _synced: false, _modifiedAt: Date.now(),
    });

    addToSyncQueue({ table: 'speaking_languages', operation: 'update', recordId: existing.id, data: { language, isActive: newActive } });
    setLanguages(prev => prev.map(l => l.language === language ? { ...l, isActive: newActive } : l));
  }, [languages, userId, addToSyncQueue]);

  const logModule = useCallback(async (language: string, module: SpeakingModule) => {
    const db = getDatabase();
    // Check if already logged today
    const existing = logs.find(l => l.language === language && l.module === module);
    if (existing) {
      await db.speakingLogs.update(existing.id, {
        completed: !existing.completed, _synced: false, _modifiedAt: Date.now(),
      });
      addToSyncQueue({ table: 'speaking_logs', operation: 'update', recordId: existing.id, data: { completed: !existing.completed } });
      setLogs(prev => prev.map(l => l.id === existing.id ? { ...l, completed: !l.completed } : l));
      return;
    }

    const id = crypto.randomUUID?.() ?? `splog_${Date.now()}`;
    const log: SpeakingLog = {
      id, userId, date: today, language, module, completed: true, notes: null,
      createdAt: new Date().toISOString(),
    };

    await db.speakingLogs.put({ ...log, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'speaking_logs', operation: 'insert', recordId: id, data: log as unknown as Record<string, unknown> });
    setLogs(prev => [...prev, log]);
  }, [userId, today, logs, addToSyncQueue]);

  const activeLanguages = languages.filter(l => l.isActive).map(l => l.language);
  const getMaterial = (language: string, module: SpeakingModule) =>
    materials.find(m => m.language === language && m.module === module) ?? null;

  const isModuleCompleted = (language: string, module: SpeakingModule) =>
    logs.some(l => l.language === language && l.module === module && l.completed);

  return {
    languages, materials, logs, activeLanguages,
    isLoading, toggleLanguage, logModule, getMaterial, isModuleCompleted,
    refresh: loadData,
  };
}

// Generate daily materials for all languages × modules
function generateDailyMaterials(date: string, dayIdx: number): import('@/lib/db/indexeddb').OfflineSpeakingMaterial[] {
  const mats: import('@/lib/db/indexeddb').OfflineSpeakingMaterial[] = [];

  SPEAKING_LANGUAGES.forEach(lang => {
    // Shadowing
    const shadow = SHADOWING_TEXTS[lang] ?? SHADOWING_TEXTS['英语']!;
    mats.push({
      id: `mat_${date}_${lang}_shadowing`, date, language: lang,
      module: SpeakingModule.SHADOWING, title: shadow.title,
      audioUrl: null, subtitleText: shadow.text, imageUrl: null, content: null,
    });

    // Picture Description
    const pics = PICTURE_TOPICS[lang] ?? PICTURE_TOPICS['英语']!;
    mats.push({
      id: `mat_${date}_${lang}_picture`, date, language: lang,
      module: SpeakingModule.PICTURE_DESCRIPTION,
      title: '图片描述', audioUrl: null, subtitleText: null,
      imageUrl: null, content: pics[dayIdx % pics.length] ?? null,
    });

    // Connected Speech
    mats.push({
      id: `mat_${date}_${lang}_connected`, date, language: lang,
      module: SpeakingModule.CONNECTED_SPEECH,
      title: '连读练习', audioUrl: null, subtitleText: null,
      imageUrl: null, content: CONNECTED_SPEECH[dayIdx % CONNECTED_SPEECH.length] ?? null,
    });

    // Topic Reading
    const topics = TOPIC_READINGS[lang] ?? TOPIC_READINGS['英语']!;
    mats.push({
      id: `mat_${date}_${lang}_topic`, date, language: lang,
      module: SpeakingModule.TOPIC_READING,
      title: '话题朗读', audioUrl: null, subtitleText: null,
      imageUrl: null, content: topics[dayIdx % topics.length] ?? null,
    });
  });

  return mats;
}
