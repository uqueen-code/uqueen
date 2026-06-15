'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { IeltsWord } from '@/constants/ieltsWords';

interface FlashCardProps {
  word: IeltsWord;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * 雅思翻转记忆卡片
 * - 正面：单词 + 音标 + 核心搭配
 * - 背面：中文释义 + 搭配 + 例句
 * - 纯 CSS 3D 翻转动画（硬件加速）
 */
export function FlashCard({ word, onPrev, onNext, hasPrev, hasNext }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  const flip = useCallback(() => setFlipped(v => !v), []);
  const unflip = useCallback(() => setFlipped(false), []);

  const speak = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word.word);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  }, [word.word]);

  // Touch swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0]!.clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0]!.clientX - touchStart;
    if (Math.abs(diff) > 60) {
      if (diff < 0 && hasNext) { onNext(); unflip(); }
      else if (diff > 0 && hasPrev) { onPrev(); unflip(); }
    }
    setTouchStart(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      {/* Card container with perspective */}
      <div
        className="relative w-full"
        style={{ perspective: '1200px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full cursor-pointer"
          style={{
            aspectRatio: '4/3',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            willChange: 'transform',
          }}
          onClick={flip}
        >
          {/* === FRONT FACE === */}
          <div
            className="absolute inset-0 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f5ff 100%)',
              boxShadow: '0 20px 50px rgba(79,70,229,0.12), 0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid rgba(79,70,229,0.08)',
            }}
          >
            {/* Word */}
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight"
              style={{ color: '#1e1b4b' }}
            >
              {word.word}
            </h2>

            {/* Phonetic + Speak button */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm text-slate-500 font-mono">{word.phonetic}</span>
              <button
                onClick={(e) => { e.stopPropagation(); speak(); }}
                className="p-1.5 rounded-full transition-colors hover:bg-indigo-100"
                title="朗读发音"
              >
                <Volume2 className="h-4 w-4 text-indigo-500" />
              </button>
            </div>

            {/* Collocation */}
            <div className="px-4 py-2.5 rounded-xl mb-6 max-w-full"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
            >
              <p className="text-xs text-indigo-400 font-medium mb-0.5">📎 核心搭配</p>
              <p className="text-sm font-semibold text-indigo-800 break-words leading-relaxed">
                {word.collocation}
              </p>
            </div>

            {/* Hint */}
            <p className="text-xs text-slate-400 mt-auto">👆 点击卡片查看释义</p>
          </div>

          {/* === BACK FACE === */}
          <div
            className="absolute inset-0 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(145deg, #ffffff 0%, #fef3c7 100%)',
              boxShadow: '0 20px 50px rgba(245,158,11,0.12), 0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid rgba(245,158,11,0.12)',
            }}
          >
            {/* Meaning */}
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-amber-700">{word.meaning}</h3>

            {/* Collocation on back */}
            <div className="px-3 py-2 rounded-lg mb-4 max-w-full"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <p className="text-xs text-amber-500 font-medium mb-0.5">📎 核心搭配</p>
              <p className="text-sm font-semibold text-amber-800 break-words leading-relaxed">
                {word.collocation}
              </p>
            </div>

            {/* Example */}
            <div className="px-3 py-2.5 rounded-lg text-left max-w-full"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <p className="text-[11px] font-medium text-slate-400 mb-1">📝 雅思真题例句</p>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 mb-1.5"
                dangerouslySetInnerHTML={{
                  __html: word.exampleEn.replace(
                    new RegExp(`(${word.word.replace(/[.*+?^${}()|[\]\\]/g, '')})`, 'gi'),
                    '<strong class="text-amber-600">$1</strong>'
                  ),
                }}
              />
              <p className="text-xs text-slate-400 leading-relaxed">{word.exampleZh}</p>
            </div>

            {/* Hint */}
            <p className="text-xs text-slate-400 mt-auto">👆 点击卡片返回</p>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-between mt-4 px-2">
        <button
          onClick={() => { if (hasPrev) { onPrev(); unflip(); } }}
          disabled={!hasPrev}
          className="p-2 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-100"
        >
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </button>
        <span className="text-xs text-slate-400 select-none">← 滑动切换 →</span>
        <button
          onClick={() => { if (hasNext) { onNext(); unflip(); } }}
          disabled={!hasNext}
          className="p-2 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-100"
        >
          <ChevronRight className="h-6 w-6 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
