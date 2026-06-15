'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Book, Sparkles, Target, BarChart3, RotateCcw, X as XIcon, HelpCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard } from '@/components/vocab/FlashCard';
import {
  IELTS_WORDS,
  STORAGE_KEY,
  type ReviewStatus,
  type WordProgress,
} from '@/constants/ieltsWords';

function loadProgress(): WordProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WordProgress[]) : [];
  } catch { return []; }
}

function saveProgress(progress: WordProgress[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* quota exceeded, ignore */ }
}

function getStatusLabel(s: ReviewStatus): string {
  switch (s) {
    case 'mastered': return '已掌握';
    case 'blurry': return '模糊';
    case 'review': return '学习中';
    default: return '未开始';
  }
}
function getStatusColor(s: ReviewStatus): string {
  switch (s) {
    case 'mastered': return '#22c55e';
    case 'blurry': return '#eab308';
    case 'review': return '#ef4444';
    default: return '#cbd5e1';
  }
}

export default function VocabPage() {
  const [progress, setProgress] = useState<WordProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const initializedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const p = loadProgress();
    // Ensure every word has an entry
    const merged = IELTS_WORDS.map(w => {
      const existing = p.find(e => e.id === w.id);
      return existing ?? { id: w.id, status: 'new' as ReviewStatus, lastReviewed: null, reviewCount: 0 };
    });
    setProgress(merged);
    initializedRef.current = true;
  }, []);

  // Persist progress whenever it changes
  useEffect(() => {
    if (initializedRef.current && progress.length > 0) {
      saveProgress(progress);
    }
  }, [progress]);

  const currentWord = IELTS_WORDS[currentIndex]!;
  const currentProgress = progress[currentIndex] ?? { id: currentWord.id, status: 'new' as const, lastReviewed: null, reviewCount: 0 };
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < IELTS_WORDS.length - 1;

  const goNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, IELTS_WORDS.length - 1));
  }, []);
  const goPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  // Record review
  const recordReview = useCallback((status: ReviewStatus) => {
    setProgress(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(p => p.id === currentWord.id);
      const now = new Date().toISOString();
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx]!,
          status,
          lastReviewed: now,
          reviewCount: updated[idx]!.reviewCount + 1,
        };
      } else {
        updated.push({ id: currentWord.id, status, lastReviewed: now, reviewCount: 1 });
      }
      return updated;
    });
  }, [currentWord.id]);

  const handleReview = useCallback((status: ReviewStatus) => {
    recordReview(status);
    if (hasNext) {
      const t = setTimeout(() => setCurrentIndex(i => Math.min(i + 1, IELTS_WORDS.length - 1)), 180);
      return () => clearTimeout(t);
    }
  }, [recordReview, hasNext]);

  // Reset all progress
  const handleReset = useCallback(() => {
    if (!confirm('确定要重置所有学习进度吗？')) return;
    const reset = IELTS_WORDS.map(w => ({ id: w.id, status: 'new' as ReviewStatus, lastReviewed: null, reviewCount: 0 }));
    setProgress(reset);
    saveProgress(reset);
    setCurrentIndex(0);
  }, []);

  // Progress stats
  const stats = useMemo(() => {
    const total = IELTS_WORDS.length;
    const mastered = progress.filter(p => p.status === 'mastered').length;
    const blurry = progress.filter(p => p.status === 'blurry').length;
    const review = progress.filter(p => p.status === 'review').length;
    const news = progress.filter(p => p.status === 'new').length;
    return { total, mastered, blurry, review, news, studied: total - news };
  }, [progress]);

  // Progress bar segments
  const segments = useMemo(() => [
    { count: stats.mastered, color: '#22c55e', label: '已掌握' },
    { count: stats.blurry, color: '#eab308', label: '模糊' },
    { count: stats.review, color: '#ef4444', label: '学习中' },
    { count: stats.news, color: '#e2e8f0', label: '未开始' },
  ], [stats]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-600">
          <Book className="h-7 w-7" />
          IELTS 核心词汇
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          翻转卡片 · 艾宾浩斯记忆 · 雅思真题例句
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 module-card" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            学习进度
          </h3>
          <div className="flex items-center gap-3 text-xs">
            {segments.filter(s => s.count > 0).map(s => (
              <span key={s.label} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label} {s.count}
              </span>
            ))}
          </div>
        </div>

        {/* Segmented progress bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: '#f1f5f9' }}>
          {segments.map(s => {
            const pct = stats.total > 0 ? (s.count / stats.total) * 100 : 0;
            return pct > 0 ? (
              <div
                key={s.label}
                className="h-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: s.color }}
              />
            ) : null;
          })}
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            已完成 <strong className="text-indigo-600">{stats.studied}</strong> / {stats.total} 个词汇
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            重置
          </button>
        </div>
      </div>

      {/* Card index indicator */}
      <div className="text-center mb-4">
        <span className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}
        >
          {currentIndex + 1} / {IELTS_WORDS.length}
        </span>
      </div>

      {/* FlashCard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <FlashCard
            word={currentWord}
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        </motion.div>
      </AnimatePresence>

      {/* === Review Buttons (Anki-style) === */}
      <div className="flex items-center justify-center gap-3 mt-5 max-w-lg mx-auto">
        {/* ❌ Review */}
        <button
          onClick={() => handleReview('review')}
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all active:scale-95"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1.5px solid rgba(239,68,68,0.2)',
          }}
        >
          <XIcon className="h-5 w-5 text-red-500" />
          <span className="text-xs font-bold text-red-600">没记住</span>
          <span className="text-[10px] text-red-400">Review</span>
        </button>

        {/* 🟡 Blurry */}
        <button
          onClick={() => handleReview('blurry')}
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all active:scale-95"
          style={{
            background: 'rgba(234,179,8,0.06)',
            border: '1.5px solid rgba(234,179,8,0.2)',
          }}
        >
          <HelpCircle className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-bold text-amber-600">模糊</span>
          <span className="text-[10px] text-amber-400">Blurry</span>
        </button>

        {/* ✅ Mastered */}
        <button
          onClick={() => handleReview('mastered')}
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all active:scale-95"
          style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1.5px solid rgba(34,197,94,0.2)',
          }}
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-600">已掌握</span>
          <span className="text-[10px] text-emerald-400">Mastered</span>
        </button>
      </div>

      {/* Current word status */}
      <div className="text-center mt-4">
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-medium"
          style={{
            background: `${getStatusColor(currentProgress.status)}18`,
            color: getStatusColor(currentProgress.status),
          }}
        >
          <Target className="h-3 w-3" />
          当前状态：{getStatusLabel(currentProgress.status)}
          {currentProgress.reviewCount > 0 && ` · 已复习 ${currentProgress.reviewCount} 次`}
        </span>
      </div>

      {/* Word list quick-nav */}
      <div className="mt-8 module-card" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
          <Sparkles className="h-4 w-4 text-indigo-500" />
          词汇列表
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
          {IELTS_WORDS.map((w, i) => {
            const p = progress[i] ?? { id: w.id, status: 'new' as ReviewStatus, lastReviewed: null, reviewCount: 0 };
            const c = getStatusColor(p.status);
            const isActive = i === currentIndex;
            return (
              <button
                key={w.id}
                onClick={() => setCurrentIndex(i)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left"
                style={{
                  background: isActive ? `${c}15` : 'var(--color-surface-alt)',
                  border: isActive ? `1.5px solid ${c}` : '1px solid transparent',
                  color: isActive ? c : 'var(--color-text-secondary)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }} />
                <span className="truncate">{w.word}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
