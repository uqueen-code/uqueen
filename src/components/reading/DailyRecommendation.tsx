'use client';

import { useTranslation } from 'react-i18next';
import { BookOpen, Sparkles, Quote } from 'lucide-react';
import type { DailyBookRecommendation } from '@/types/models';

interface DailyRecommendationProps {
  book: DailyBookRecommendation | null;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '文学': { bg: '#a0724a15', text: '#a0724a', border: '#a0724a30' },
  '历史': { bg: '#6366f115', text: '#6366f1', border: '#6366f130' },
  '哲学': { bg: '#8b5cf615', text: '#8b5cf6', border: '#8b5cf630' },
  '心理学': { bg: '#ec489915', text: '#ec4899', border: '#ec489930' },
  '科学': { bg: '#3b82f615', text: '#3b82f6', border: '#3b82f630' },
  '商业': { bg: '#eab30815', text: '#ca8a04', border: '#eab30830' },
  '散文': { bg: '#22c55e15', text: '#16a34a', border: '#22c55e30' },
};

export function DailyRecommendation({ book }: DailyRecommendationProps) {
  const { t } = useTranslation();

  if (!book) {
    return (
      <div className="module-card" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
        <h2 className="section-title" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
          <Sparkles className="h-5 w-5" style={{ color: '#a0724a' }} />
          {t('reading.dailyRecommendation')}
        </h2>
        <div className="skeleton h-40 rounded-xl" />
      </div>
    );
  }

  const catColors = CATEGORY_COLORS[book.category] ?? CATEGORY_COLORS['文学']!;

  return (
    <div className="module-card" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
        <Sparkles className="h-5 w-5" style={{ color: '#a0724a' }} />
        {t('reading.dailyRecommendation')}
      </h2>

      <div className="flex gap-4">
        {/* Book cover */}
        <div
          className="flex-shrink-0 w-20 h-28 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #a0724a, #7d5535)' }}
        >
          <BookOpen className="h-8 w-8 text-white/40" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.3))' }} />
        </div>

        {/* Book info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="text-base font-bold" style={{ color: '#5c3d2e' }}>《{book.title}》</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: catColors.bg, color: catColors.text, border: `1px solid ${catColors.border}` }}>
              {book.category}
            </span>
          </div>
          <p className="text-sm mb-2" style={{ color: '#7d5535' }}>{book.author}</p>
          <div className="flex items-start gap-1.5">
            <Quote className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: '#a0724a', opacity: 0.6 }} />
            <p className="text-xs leading-relaxed" style={{ color: '#8b6914' }}>
              {book.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
