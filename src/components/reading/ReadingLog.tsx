'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookMarked, CheckCircle2, BookOpen } from 'lucide-react';
import type { ReadingLog as ReadingLogType, DailyBookRecommendation } from '@/types/models';

interface ReadingLogProps {
  dailyBook: DailyBookRecommendation | null;
  todayLogs: ReadingLogType[];
  didReadToday: boolean;
  onLog: (data: {
    bookTitle: string; author?: string; chapter?: string;
    pagesRead?: number; notes?: string;
  }) => Promise<void>;
}

export function ReadingLog({ dailyBook, todayLogs, didReadToday, onLog }: ReadingLogProps) {
  const { t } = useTranslation();
  const [bookTitle, setBookTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use daily recommendation as default title
  const useDailyBook = () => {
    if (dailyBook) {
      setBookTitle(dailyBook.title);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!bookTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onLog({
        bookTitle: bookTitle.trim(),
        chapter: chapter.trim() || undefined,
        pagesRead: pagesRead ? parseInt(pagesRead) : undefined,
        notes: notes.trim() || undefined,
      });
      setBookTitle(''); setChapter(''); setPagesRead(''); setNotes('');
    } finally { setIsSubmitting(false); }
  }, [bookTitle, chapter, pagesRead, notes, onLog]);

  return (
    <div className="module-card" style={{ '--module-accent': '#7d5535' } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0" style={{ '--module-accent': '#7d5535' } as React.CSSProperties}>
          <BookMarked className="h-5 w-5" style={{ color: '#7d5535' }} />
          {t('reading.readingLog')}
        </h2>
        {didReadToday && (
          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: '#22c55e20', color: '#22c55e' }}>
            <CheckCircle2 className="h-3 w-3" /> 今日已读
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Book title with quick-fill */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
            <BookOpen className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" value={bookTitle} onChange={e => setBookTitle(e.target.value)}
              placeholder={t('reading.bookTitle')} className="bg-transparent text-sm w-full outline-none" style={{ color: 'var(--color-text-primary)' }} />
          </div>
          {dailyBook && bookTitle !== dailyBook.title && (
            <button onClick={useDailyBook}
              className="text-xs px-2 py-1.5 rounded-lg flex-shrink-0 transition-colors"
              style={{ background: '#a0724a15', color: '#a0724a' }}>
              今日推荐
            </button>
          )}
        </div>

        {/* Chapter + Pages */}
        <div className="flex gap-2">
          <input type="text" value={chapter} onChange={e => setChapter(e.target.value)}
            placeholder={t('reading.chapter')} className="input-field flex-1 text-sm" />
          <input type="number" value={pagesRead} onChange={e => setPagesRead(e.target.value)}
            placeholder={t('reading.pagesRead')} className="input-field w-24 text-sm" />
        </div>

        {/* Notes */}
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={t('reading.notes')} className="input-field min-h-[60px] text-sm" />

        <button onClick={handleSubmit} disabled={isSubmitting || !bookTitle.trim()}
          className="btn-primary w-full text-sm"
          style={{ '--color-accent': '#a0724a', '--color-accent-hover': '#7d5535' } as React.CSSProperties}>
          {t('common.submit')}
        </button>
      </div>

      {/* Today's reading list */}
      {todayLogs.length > 0 && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>今日记录</p>
          <div className="space-y-1.5">
            {todayLogs.map(log => (
              <div key={log.id} className="flex items-center gap-2 p-2 rounded text-xs" style={{ background: 'var(--color-surface-alt)' }}>
                <CheckCircle2 className="h-3 w-3 flex-shrink-0" style={{ color: '#22c55e' }} />
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>《{log.bookTitle}》</span>
                {log.chapter && <span style={{ color: 'var(--color-text-muted)' }}>{log.chapter}</span>}
                {log.pagesRead && <span className="ml-auto" style={{ color: 'var(--color-text-muted)' }}>{log.pagesRead}页</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
