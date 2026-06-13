'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Star, Sparkles, Smile, Heart } from 'lucide-react';
import { usePsychology } from '@/hooks/usePsychology';
import { useTodos } from '@/hooks/useTodos';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory, Priority } from '@/types/enums';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Star rating with half-star support
function StarRating({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = (hovered !== null) ? hovered >= i : rating >= i;
    const half = (hovered !== null) ? (hovered === i - 0.5) : (rating >= i - 0.5 && rating < i);
    stars.push(
      <div key={i} className="relative cursor-pointer" style={{ width: 44, height: 44 }}>
        <div className="absolute inset-0 w-1/2 z-10"
          onMouseEnter={() => setHovered(i - 0.5)} onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(i - 0.5)} />
        <div className="absolute inset-0 left-1/2 w-1/2 z-10"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(i)} />
        <Star className="absolute inset-0 h-11 w-11 transition-all duration-150"
          style={{
            fill: filled ? '#f59e0b' : half ? 'url(#halfGrad2)' : 'transparent',
            color: filled || half ? '#f59e0b' : '#d1d5db',
            strokeWidth: 1.5,
          }} />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 justify-center">
      <svg width="0" height="0"><defs><linearGradient id="halfGrad2"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="transparent" /></linearGradient></defs></svg>
      {stars}
    </div>
  );
}

// Cute emotion monster component — custom SVG monster
function EmotionMonster({ monsterName, belly, onFeed, showSuccess, justFed }: {
  monsterName: string; belly: string[];
  onFeed: (emotion: string, emoji: string) => void;
  showSuccess: boolean; justFed: string | null;
}) {
  const emotions = [
    { emoji: '😤', label: '生气', color: '#ef4444' },
    { emoji: '😢', label: '难过', color: '#3b82f6' },
    { emoji: '😰', label: '焦虑', color: '#f59e0b' },
    { emoji: '😡', label: '烦躁', color: '#f97316' },
    { emoji: '😞', label: '失落', color: '#6366f1' },
    { emoji: '🤯', label: '压力', color: '#ec4899' },
    { emoji: '😒', label: '不满', color: '#94a3b8' },
    { emoji: '😩', label: '疲惫', color: '#8b5cf6' },
  ];

  return (
    <div className="text-center">
      {/* Custom cute SVG monster */}
      <div className="relative inline-block mb-3">
        <motion.div
          animate={justFed ? {
            scale: [1, 1.2, 0.95, 1.05, 1],
            rotate: [0, -5, 5, -3, 0],
          } : {
            scale: [1, 1.02, 1],
            y: [0, -3, 0],
          }}
          transition={justFed ? { duration: 0.6 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 120 130" className="w-36 h-auto">
            {/* Body — round purple blob */}
            <ellipse cx="60" cy="75" rx="42" ry="40" fill="#c084fc" />
            {/* Body highlight */}
            <ellipse cx="50" cy="65" rx="20" ry="22" fill="#d8b4fe" opacity="0.5" />
            {/* Belly — lighter circle for eaten emotions */}
            <ellipse cx="60" cy="85" rx="25" ry="20" fill="#e9d5ff" opacity="0.6" />
            {/* Eyes — big sparkly eyes */}
            <ellipse cx="45" cy="60" rx="10" ry="11" fill="white" />
            <ellipse cx="75" cy="60" rx="10" ry="11" fill="white" />
            {/* Pupils — shiny black with highlight */}
            <circle cx="47" cy="62" r="5.5" fill="#1e1b4b" />
            <circle cx="77" cy="62" r="5.5" fill="#1e1b4b" />
            {/* Eye sparkles */}
            <circle cx="49" cy="58" r="2" fill="white" />
            <circle cx="79" cy="58" r="2" fill="white" />
            <circle cx="45" cy="64" r="1" fill="white" opacity="0.6" />
            <circle cx="75" cy="64" r="1" fill="white" opacity="0.6" />
            {/* Blush cheeks */}
            <ellipse cx="30" cy="72" rx="8" ry="5" fill="#f9a8d4" opacity="0.5" />
            <ellipse cx="90" cy="72" rx="8" ry="5" fill="#f9a8d4" opacity="0.5" />
            {/* Mouth — happy smile when just fed, neutral otherwise */}
            {justFed ? (
              <path d="M 48,78 Q 60,90 72,78" fill="#f9a8d4" stroke="#a855f7" strokeWidth="1.5" />
            ) : (
              <path d="M 50,80 Q 60,86 70,80" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
            )}
            {/* Little horns/ears */}
            <ellipse cx="35" cy="38" rx="6" ry="12" fill="#a855f7" transform="rotate(-15,35,38)" />
            <ellipse cx="85" cy="38" rx="6" ry="12" fill="#a855f7" transform="rotate(15,85,38)" />
            {/* Inner ear */}
            <ellipse cx="35" cy="40" rx="3" ry="7" fill="#d8b4fe" transform="rotate(-15,35,40)" />
            <ellipse cx="85" cy="40" rx="3" ry="7" fill="#d8b4fe" transform="rotate(15,85,40)" />
            {/* Tiny arms waving */}
            <ellipse cx="18" cy="78" rx="8" ry="5" fill="#c084fc" transform="rotate(-30,18,78)" />
            <ellipse cx="102" cy="78" rx="8" ry="5" fill="#c084fc" transform="rotate(30,102,78)" />
            {/* Feet */}
            <ellipse cx="42" cy="112" rx="10" ry="6" fill="#a855f7" />
            <ellipse cx="78" cy="112" rx="10" ry="6" fill="#a855f7" />
            {/* Toes */}
            <circle cx="34" cy="114" r="3" fill="#9333ea" />
            <circle cx="42" cy="117" r="3" fill="#9333ea" />
            <circle cx="50" cy="114" r="3" fill="#9333ea" />
            <circle cx="70" cy="114" r="3" fill="#9333ea" />
            <circle cx="78" cy="117" r="3" fill="#9333ea" />
            <circle cx="86" cy="114" r="3" fill="#9333ea" />
            {/* Heart when just fed */}
            {justFed && (
              <g>
                <path d="M 55,20 Q 60,14 65,20 Q 70,14 75,20 Q 80,28 65,38 Q 50,28 55,20" fill="#f472b6" opacity="0.9" />
              </g>
            )}
          </svg>
        </motion.div>

        {/* Success hearts floating */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl"
              initial={{ opacity: 0, y: 10, scale: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: [-10, -30, -50], scale: [0, 1.3, 1] }}
              exit={{ opacity: 0 }} transition={{ duration: 2 }}>
              💕
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-sm font-bold mt-1" style={{ color: '#7c3aed' }}>{monsterName}</p>
        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>把坏情绪喂给我，我帮你吃掉！</p>
      </div>

      {/* Belly — eaten emotions */}
      <div className="mb-4 p-3 rounded-2xl min-h-[44px] flex flex-wrap gap-1.5 justify-center items-center"
        style={{ background: 'rgba(192,132,252,0.08)', border: '2px dashed rgba(168,85,247,0.2)', borderRadius: '16px' }}>
        {belly.length > 0 ? (
          belly.map((emoji, i) => (
            <motion.span key={i} className="text-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: i * 0.05 }}>
              {emoji}
            </motion.span>
          ))
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>肚肚空空的~ 喂我吃点情绪吧</span>
        )}
      </div>

      {/* Feed buttons */}
      <div className="grid grid-cols-4 gap-2">
        {emotions.map(item => (
          <motion.button key={item.label}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onFeed(item.label, item.emoji)}
            className="p-2 rounded-xl text-center transition-all"
            style={{ background: item.color + '12', border: `1px solid ${item.color}25` }}>
            <div className="text-xl mb-0.5">{item.emoji}</div>
            <div className="text-[10px] font-medium" style={{ color: item.color }}>{item.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Success feedback */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div className="mt-4 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}>
            <p className="text-sm font-medium" style={{ color: '#7c3aed' }}>
              🎉 嗷呜~ 坏情绪吃掉啦！
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#a855f7' }}>感觉好多了吧？{monsterName}谢谢你~</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Eating animation
function FeedAnimation({ emotion, onDone }: { emotion: string; onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }} onAnimationComplete={onDone}>
      {/* Emotion floating up and shrinking like being eaten */}
      <motion.div className="text-5xl"
        initial={{ scale: 1, y: 0, opacity: 1 }}
        animate={{ scale: [1, 1.4, 0.3, 0], y: [0, -60, -160, -280], opacity: [1, 1, 0.5, 0] }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}>
        {emotion}
      </motion.div>
      {/* Sparkle burst */}
      <motion.div className="absolute text-3xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.5, 0], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.7, delay: 0.5 }}>
        ✨
      </motion.div>
    </motion.div>
  );
}

export default function PsychologyPage() {
  const { todayMood, todayEmotions, recentMoods, psychTip, monsterName, isLoading, logMood, feedEmotion } = usePsychology();
  const { createTodo } = useTodos();

  const [moodRating, setMoodRating] = useState(todayMood?.rating ?? 0);
  const [moodNote, setMoodNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feeding, setFeeding] = useState<string | null>(null);
  const [monsterBelly, setMonsterBelly] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [justFed, setJustFed] = useState<string | null>(null);

  useEffect(() => {
    if (todayMood) { setMoodRating(todayMood.rating); setMoodNote(todayMood.note || ''); }
    setMonsterBelly(todayEmotions.map(e => e.emotion.split(' ')[0]!));
  }, [todayMood, todayEmotions]);

  const handleSaveMood = useCallback(async () => {
    if (moodRating === 0) { toast.error('请先打分'); return; }
    setIsSubmitting(true);
    await logMood(moodRating, moodNote || undefined);
    const labels: Record<number, string> = { 0.5: '非常糟糕', 1: '很不好', 1.5: '不太好', 2: '有点低落', 2.5: '一般般', 3: '普普通通', 3.5: '还不错', 4: '挺好的', 4.5: '很开心', 5: '超级棒' };
    const today = new Date().toISOString().split('T')[0]!;
    await createTodo({
      title: `😊 今日心情：${labels[Math.round(moodRating * 2) / 2] || moodRating + '星'}`,
      description: moodNote || undefined,
      category: ModuleCategory.PSYCHOLOGY, priority: Priority.NORMAL,
      dueDate: today, isRecurring: false,
    });
    toast.success('心情记录已保存 📝');
    setIsSubmitting(false);
  }, [moodRating, moodNote, logMood, createTodo]);

  const handleFeed = useCallback(async (emotion: string, emoji: string) => {
    const full = `${emoji} ${emotion}`;
    setFeeding(full);
    setJustFed(emoji);
    await feedEmotion(full);
    setMonsterBelly(prev => [...prev, emoji]);
    setTimeout(() => setShowSuccess(true), 300);
    setTimeout(() => { setShowSuccess(false); setFeeding(null); setJustFed(null); }, 2800);
  }, [feedEmotion]);

  const moodLabel = (r: number) => {
    if (r >= 4.5) return { text: '超级开心！', icon: '🥳', color: '#22c55e' };
    if (r >= 3.5) return { text: '心情不错', icon: '😊', color: '#4ade80' };
    if (r >= 2.5) return { text: '平平淡淡', icon: '😐', color: '#f59e0b' };
    if (r >= 1.5) return { text: '有点低落', icon: '😟', color: '#f97316' };
    if (r > 0) return { text: '需要抱抱', icon: '😢', color: '#ef4444' };
    return { text: '还没打分', icon: '🤔', color: '#94a3b8' };
  };
  const mi = moodLabel(moodRating);

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <AnimatePresence>
        {feeding && <FeedAnimation emotion={feeding} onDone={() => setFeeding(null)} />}
      </AnimatePresence>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#a855f7' }}>
          <Brain className="h-7 w-7" />心理空间
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Psychology Knowledge — expanded */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#a855f7' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#a855f7' } as React.CSSProperties}>
              <Brain className="h-5 w-5" style={{ color: '#a855f7' }} />每日心理学知识
            </h2>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: '#a855f7' }} />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#a855f720', color: '#a855f7' }}>
                  今日心理知识
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
                {psychTip}
              </p>
            </div>

            {recentMoods.length > 0 && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>最近心情趋势</p>
                <div className="flex items-end gap-1 h-20">
                  {recentMoods.map((m, i) => {
                    const h = (m.rating / 5) * 80;
                    return (
                      <div key={m.date} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full rounded-t-sm transition-all" style={{
                          height: `${Math.max(4, h)}px`,
                          background: m.rating >= 3.5 ? '#22c55e' : m.rating >= 2.5 ? '#f59e0b' : '#ef4444',
                          opacity: 0.7 + (i / recentMoods.length) * 0.3,
                        }} />
                        <span className="text-[8px]" style={{ color: 'var(--color-text-muted)' }}>{m.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Mood Rating */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
              <Smile className="h-5 w-5" style={{ color: '#f59e0b' }} />今日心情
            </h2>
            <div className="text-center py-3">
              <div className="text-5xl mb-2">{mi.icon}</div>
              <p className="text-lg font-bold mb-0.5" style={{ color: mi.color }}>{mi.text}</p>
              <p className="text-2xl font-bold mb-4" style={{ color: '#f59e0b' }}>{moodRating > 0 ? `${moodRating} / 5` : '—'}</p>
              <StarRating rating={moodRating} onChange={setMoodRating} />
              <p className="text-[10px] mt-1 mb-3" style={{ color: 'var(--color-text-muted)' }}>
                左半=0.5星 · 右半=1星
              </p>
              <textarea value={moodNote}
                onChange={e => setMoodNote(e.target.value)}
                placeholder="今天发生了什么？记录心情日记..."
                className="input-field min-h-[80px] text-sm mb-3" />
              <button onClick={handleSaveMood} disabled={isSubmitting || moodRating === 0}
                className="btn-primary w-full"
                style={{ '--color-accent': '#f59e0b', '--color-accent-hover': '#d97706' } as React.CSSProperties}>
                {todayMood ? '更新心情' : '保存心情'}
              </button>
              {todayMood && <p className="text-[10px] mt-2" style={{ color: '#22c55e' }}>✓ 已记录 · 同步到待办</p>}
            </div>
          </div>
        </div>

        {/* RIGHT: Emotion Monster — redesigned */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
              <Heart className="h-5 w-5" style={{ color: '#ec4899' }} />情绪小怪兽
            </h2>
            <EmotionMonster
              monsterName={monsterName}
              belly={monsterBelly}
              onFeed={handleFeed}
              showSuccess={showSuccess}
              justFed={justFed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
