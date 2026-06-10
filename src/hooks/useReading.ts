'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getTodayString } from '@/lib/utils/date';
import type { ReadingLog, DailyBookRecommendation } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

const CURATED_BOOKS: Omit<DailyBookRecommendation, 'id' | 'date'>[] = [
  { title: '百年孤独', author: '加西亚·马尔克斯', summary: '魔幻现实主义的巅峰之作，讲述布恩迪亚家族七代人的传奇故事，折射拉美一个世纪的风云变幻。', coverUrl: null, category: '文学' },
  { title: '活着', author: '余华', summary: '一部浓缩的中国现代史，通过一个普通人的悲欢离合，展现生命的坚韧与尊严。', coverUrl: null, category: '文学' },
  { title: '人类简史', author: '尤瓦尔·赫拉利', summary: '从认知革命到科学革命，一部宏大的人类历史叙事，颠覆你对世界的认知。', coverUrl: null, category: '历史' },
  { title: '思考，快与慢', author: '丹尼尔·卡尼曼', summary: '诺贝尔经济学奖得主带你认识大脑的两套思维系统，理解决策背后的心理学。', coverUrl: null, category: '心理学' },
  { title: '苏菲的世界', author: '乔斯坦·贾德', summary: '以小说的形式讲述西方哲学史，是哲学入门的最佳读物之一。', coverUrl: null, category: '哲学' },
  { title: '平凡的世界', author: '路遥', summary: '中国改革开放时期的壮丽史诗，展现普通人在大时代中的奋斗与追求。', coverUrl: null, category: '文学' },
  { title: '原则', author: '瑞·达利欧', summary: '桥水基金创始人的生活与工作原则，帮助你建立系统化的决策框架。', coverUrl: null, category: '商业' },
  { title: '道德经', author: '老子', summary: '中华文化的核心经典，短短五千字蕴含无穷智慧，值得一生品读。', coverUrl: null, category: '哲学' },
  { title: '瓦尔登湖', author: '梭罗', summary: '在湖畔独居的沉思录，关于简单生活、自给自足与心灵自由的经典。', coverUrl: null, category: '散文' },
  { title: '小王子', author: '圣埃克苏佩里', summary: '写给成年人的童话，用最纯真的语言讲述关于爱、责任与生命的本质。', coverUrl: null, category: '文学' },
  { title: '时间简史', author: '史蒂芬·霍金', summary: '从大爆炸到黑洞，霍金用通俗语言带你领略宇宙的奥秘。', coverUrl: null, category: '科学' },
  { title: '红楼梦', author: '曹雪芹', summary: '中国古典小说的巅峰，一部封建大家族的兴衰史，百科全书式的生活画卷。', coverUrl: null, category: '文学' },
  { title: '沉思录', author: '马可·奥勒留', summary: '罗马皇帝的哲学思考，斯多葛学派的经典，教你如何在纷扰中保持内心平静。', coverUrl: null, category: '哲学' },
  { title: '卡拉马佐夫兄弟', author: '陀思妥耶夫斯基', summary: '关于信仰、理性与自由意志的深刻探讨，世界文学的最高成就之一。', coverUrl: null, category: '文学' },
];

export function useReading() {
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [dailyBook, setDailyBook] = useState<DailyBookRecommendation | null>(null);
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
      const [logs, books] = await Promise.all([
        db.readingLogs.where('userId').equals(userId).reverse().limit(30).toArray(),
        db.bookRecommendations.where('date').equals(today).first(),
      ]);
      setReadingLogs(logs.map(l => ({
        id: l.id, userId: l.userId, date: l.date, bookTitle: l.bookTitle,
        author: l.author, chapter: l.chapter, pagesRead: l.pagesRead,
        notes: l.notes, isDailyRecommendation: l.isDailyRecommendation,
        createdAt: l.createdAt,
      })));
      if (books) {
        setDailyBook({ id: books.id, date: books.date, title: books.title, author: books.author, summary: books.summary, coverUrl: books.coverUrl, category: books.category });
      } else {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const book = CURATED_BOOKS[dayOfYear % CURATED_BOOKS.length]!;
        const rec: DailyBookRecommendation = { id: `rec_${today}`, date: today, ...book };
        await db.bookRecommendations.put(rec);
        setDailyBook(rec);
      }
    } catch { /* empty */ }
    finally { setIsLoading(false); }
  }, [userId, today]);

  useEffect(() => { loadData(); }, [loadData]);

  const logReading = useCallback(async (data: {
    bookTitle: string; author?: string; chapter?: string;
    pagesRead?: number; notes?: string;
  }): Promise<ReadingLog> => {
    const id = crypto.randomUUID?.() ?? `rd_${Date.now()}`;
    const log: ReadingLog = {
      id, userId, date: today, bookTitle: data.bookTitle,
      author: data.author ?? null, chapter: data.chapter ?? null,
      pagesRead: data.pagesRead ?? null, notes: data.notes ?? null,
      isDailyRecommendation: dailyBook?.title === data.bookTitle,
      createdAt: new Date().toISOString(),
    };
    const db = getDatabase();
    await db.readingLogs.put({ ...log, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'reading_logs', operation: 'insert', recordId: id, data: log as unknown as Record<string, unknown> });
    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await (supabase.from('reading_logs') as any).insert({
          id, user_id: userId, date: today, book_title: data.bookTitle,
          author: data.author, chapter: data.chapter, pages_read: data.pagesRead,
          notes: data.notes, is_daily_recommendation: dailyBook?.title === data.bookTitle,
        });
        await db.readingLogs.update(id, { _synced: true });
      } catch { /* sync later */ }
    }
    setReadingLogs(prev => [log, ...prev]);
    return log;
  }, [userId, today, dailyBook, effectiveOnline, addToSyncQueue]);

  const didReadToday = readingLogs.some(l => l.date === today);
  const todayLogs = readingLogs.filter(l => l.date === today);

  return {
    readingLogs, dailyBook, didReadToday, todayLogs, isLoading,
    logReading, refresh: loadData,
  };
}
