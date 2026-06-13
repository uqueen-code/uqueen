'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Star, Sparkles, Smile, Heart, Send, Zap } from 'lucide-react';
import { usePsychology } from '@/hooks/usePsychology';
import { useTodos } from '@/hooks/useTodos';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory, Priority } from '@/types/enums';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ────────────────────────────────────────────────────
// Quips the monster says after eating a bad emotion
// ────────────────────────────────────────────────────
const MONSTER_QUIPS = [
  '嗝！这坏情绪真难吃，下次给我带点开心的！🍬',
  '嗷呜~ 吞下去了！味道像烧焦的西兰花，但我帮你消化掉啦！🥦',
  '嗝~ 这烦恼有点酸，不过没关系，我最爱吃酸的了！🍋',
  '唔…这块"不开心"有点硬，但我牙口好！嘎嘣脆！🦷',
  '呕~ 好苦！但我是一只勇敢的怪兽，什么坏情绪都能吃掉！💪',
  '嘿嘿，吃掉了！你的不开心现在在我肚子里变成了彩虹屁~ 🌈',
  '嗝！吃饱了吃饱了，这顿情绪大餐够我消化一整天啦~ 😋',
  '咔嚓咔嚓…嗯？这烦恼是过期了吗？不过没事，我百毒不侵！🛡️',
  '嗷~ 这块情绪好像有点甜？原来不开心里面也藏着一点点好事呢！🍯',
  '嗝~~~ 好大一个嗝！你的坏情绪变成气体飞走啦，再也回不来了！💨',
  '吧唧吧唧…嗯这口有点咸，是你偷偷哭了嘛？没关系我帮你吃掉！🧂',
  '叮！你的不开心已被本怪兽消化系统处理完毕，请查收一份好心情~ ✅',
  '嗷嗷！这情绪嚼起来像泡泡糖，还能吹个大泡泡！啵~ 🫧',
  '唔…这块焦虑咬下去嘎嘣脆，像薯片！再来…啊不对，希望你别再来了！😂',
];

// ────────────────────────────────────────────────────
// Star rating with half-star support
// ────────────────────────────────────────────────────
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
      <svg width="0" height="0">
        <defs>
          <linearGradient id="halfGrad2"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="transparent" /></linearGradient>
        </defs>
      </svg>
      {stars}
    </div>
  );
}

// ────────────────────────────────────────────────────
// Monster Mood Eater — the main event
// ────────────────────────────────────────────────────
function MonsterMoodEater({
  monsterName,
  onFeed,
  isFeeding,
}: {
  monsterName: string;
  onFeed: (text: string) => Promise<void>;
  isFeeding: boolean;
}) {
  const [inputText, setInputText] = useState('');
  const [feedingState, setFeedingState] = useState<'idle' | 'flying' | 'eating' | 'belching' | 'done'>('idle');
  const [currentQuip, setCurrentQuip] = useState('');
  const [showQuip, setShowQuip] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [energyBallPos, setEnergyBallPos] = useState({ x: 0, y: 0 });
  const [belchBubbles, setBelchBubbles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const feedBtnRef = useRef<HTMLButtonElement>(null);
  const monsterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFeed = useCallback(async () => {
    const text = inputText.trim();
    if (!text || feedingState !== 'idle') return;

    setFeedingState('flying');
    setShowQuip(false);
    setInputText('');

    // Calculate start and end positions for energy ball
    if (feedBtnRef.current && monsterRef.current) {
      const btnRect = feedBtnRef.current.getBoundingClientRect();
      const monsterRect = monsterRef.current.getBoundingClientRect();
      // Start from the button, end at monster's mouth area
      setEnergyBallPos({
        x: monsterRect.left + monsterRect.width * 0.5 - btnRect.left - btnRect.width * 0.5,
        y: monsterRect.top + monsterRect.height * 0.45 - btnRect.top - btnRect.height * 0.5,
      });
    }

    // After a brief delay, start the eating animation
    setTimeout(() => {
      setFeedingState('eating');
      setMouthOpen(true);
    }, 600);

    // Then belch
    setTimeout(() => {
      setFeedingState('belching');
      setMouthOpen(false);

      // Generate belch bubbles
      const bubbles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 100,
        y: -(Math.random() * 60 + 20),
        size: 6 + Math.random() * 14,
        delay: Math.random() * 0.3,
      }));
      setBelchBubbles(bubbles);

      // Pick a random quip
      const quip = MONSTER_QUIPS[Math.floor(Math.random() * MONSTER_QUIPS.length)]!;
      setCurrentQuip(quip);
      setShowQuip(true);

      // Save the emotion
      onFeed(text);
    }, 900);

    // Reset after animation completes
    setTimeout(() => {
      setFeedingState('done');
      setTimeout(() => {
        setFeedingState('idle');
        setBelchBubbles([]);
        setTimeout(() => setShowQuip(false), 4000);
      }, 300);
      // Focus back on input
      inputRef.current?.focus();
    }, 1800);
  }, [inputText, feedingState, onFeed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFeed();
    }
  };

  const mouthD = mouthOpen
    ? 'M 44 76 Q 60 102 76 76' // Wide open mouth (eating)
    : 'M 50 82 Q 60 89 70 82'; // Normal cute mouth

  const mouthFill = mouthOpen ? '#f9a8d4' : 'none';
  const mouthStroke = mouthOpen ? '#a855f7' : '#7c3aed';

  return (
    <div className="text-center relative">
      {/* Monster container */}
      <div ref={monsterRef} className="relative inline-block mb-4 select-none">
        <motion.div
          animate={
            feedingState === 'belching'
              ? { scale: [1, 1.18, 0.93, 1.08, 0.97, 1], rotate: [0, -3, 3, -2, 1, 0] }
              : feedingState === 'eating'
              ? { scale: [1, 1.05], rotate: [0, -2] }
              : { scale: [1, 1.025, 1], y: [0, -4, 0] }
          }
          transition={
            feedingState === 'belching'
              ? { duration: 0.7, ease: 'easeOut' }
              : feedingState === 'eating'
              ? { duration: 0.15 }
              : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <svg viewBox="0 0 120 135" className="w-44 h-auto drop-shadow-xl">
            {/* ── Drop shadow / glow behind monster ── */}
            <defs>
              <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#a855f7" />
              </radialGradient>
              <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fdf2f8" />
                <stop offset="60%" stopColor="#fce7f3" />
                <stop offset="100%" stopColor="#f9a8d4" stopOpacity="0.5" />
              </radialGradient>
              <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#fb7185" stopOpacity="0.3" />
              </radialGradient>
              <filter id="monsterGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Body (big round jelly blob) ── */}
            <ellipse cx="60" cy="75" rx="44" ry="43" fill="url(#bodyGrad)" filter="url(#monsterGlow)" />

            {/* ── Body highlight/sheen ── */}
            <ellipse cx="47" cy="60" rx="18" ry="20" fill="white" opacity="0.25" />

            {/* ── Belly ── */}
            <ellipse cx="60" cy="86" rx="26" ry="21" fill="url(#bellyGrad)" opacity="0.85" />

            {/* ── Small belly heart ── */}
            <path d="M 60 79 Q 57 76 54 79 Q 51 83 60 90 Q 69 83 66 79 Q 63 76 60 79 Z"
              fill="#fb7185" opacity="0.5" />

            {/* ── Horns/Ears (left) ── */}
            <ellipse cx="34" cy="36" rx="7" ry="13" fill="#a855f7" transform="rotate(-18, 34, 36)" />
            <ellipse cx="34" cy="38" rx="3.5" ry="7.5" fill="#d8b4fe" transform="rotate(-18, 34, 38)" />

            {/* ── Horns/Ears (right) ── */}
            <ellipse cx="86" cy="36" rx="7" ry="13" fill="#a855f7" transform="rotate(18, 86, 36)" />
            <ellipse cx="86" cy="38" rx="3.5" ry="7.5" fill="#d8b4fe" transform="rotate(18, 86, 38)" />

            {/* ── Eyes (big sparkly) ── */}
            <ellipse cx="44" cy="58" rx="11" ry="12" fill="white" />
            <ellipse cx="76" cy="58" rx="11" ry="12" fill="white" />

            {/* ── Pupils ── */}
            <motion.g
              animate={feedingState === 'eating' ? { scaleY: 0.3 } : { scaleY: 1 }}
              transition={{ duration: 0.15 }}
            >
              <circle cx="46" cy="60" r="6" fill="#1e1b4b" />
              <circle cx="78" cy="60" r="6" fill="#1e1b4b" />
            </motion.g>

            {/* ── Eye sparkles ── */}
            <circle cx="48.5" cy="55.5" r="2.2" fill="white" />
            <circle cx="80.5" cy="55.5" r="2.2" fill="white" />
            <circle cx="43" cy="62.5" r="1.2" fill="white" opacity="0.7" />
            <circle cx="75" cy="62.5" r="1.2" fill="white" opacity="0.7" />

            {/* ── Blush cheeks ── */}
            <ellipse cx="28" cy="70" rx="9" ry="5.5" fill="url(#cheekGrad)" />
            <ellipse cx="92" cy="70" rx="9" ry="5.5" fill="url(#cheekGrad)" />

            {/* ── Mouth ── */}
            <motion.path
              d={mouthD}
              fill={mouthFill}
              stroke={mouthStroke}
              strokeWidth="2"
              strokeLinecap="round"
              animate={mouthOpen ? { d: 'M 44 76 Q 60 102 76 76' } : { d: 'M 50 82 Q 60 89 70 82' }}
              transition={{ duration: 0.2 }}
            />

            {/* ── Tiny tongue (visible when mouth open) ── */}
            {mouthOpen && (
              <ellipse cx="60" cy="87" rx="8" ry="5" fill="#fb7185" opacity="0.7" />
            )}

            {/* ── Arms ── */}
            <motion.g
              animate={
                feedingState === 'eating'
                  ? { rotate: [-5, -25] }
                  : { rotate: [0, -8, 0] }
              }
              transition={
                feedingState === 'eating'
                  ? { duration: 0.2 }
                  : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ transformOrigin: '18px 78px' }}
            >
              <ellipse cx="18" cy="78" rx="9" ry="5.5" fill="#c084fc" transform="rotate(-30, 18, 78)" />
            </motion.g>
            <motion.g
              animate={
                feedingState === 'eating'
                  ? { rotate: [5, 25] }
                  : { rotate: [0, 8, 0] }
              }
              transition={
                feedingState === 'eating'
                  ? { duration: 0.2 }
                  : { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
              }
              style={{ transformOrigin: '102px 78px' }}
            >
              <ellipse cx="102" cy="78" rx="9" ry="5.5" fill="#c084fc" transform="rotate(30, 102, 78)" />
            </motion.g>

            {/* ── Feet ── */}
            <ellipse cx="41" cy="115" rx="11" ry="7" fill="#9333ea" />
            <ellipse cx="79" cy="115" rx="11" ry="7" fill="#9333ea" />

            {/* ── Toes ── */}
            {[33, 41, 49].map(cx => (
              <circle key={`tl${cx}`} cx={cx} cy="117.5" r="3.2" fill="#7e22ce" />
            ))}
            {[71, 79, 87].map(cx => (
              <circle key={`tr${cx}`} cx={cx} cy="117.5" r="3.2" fill="#7e22ce" />
            ))}

            {/* ── Cute little tail ── */}
            <path d="M 102 95 Q 115 90 112 80 Q 110 73 105 78" fill="none" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* ── Belch bubbles ── */}
        <AnimatePresence>
          {belchBubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              className="absolute pointer-events-none rounded-full border border-pink-300/40"
              style={{
                width: bubble.size,
                height: bubble.size,
                left: '50%',
                top: '35%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(236,72,153,0.2))',
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                x: bubble.x,
                y: bubble.y,
                scale: [0, 1.2, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: bubble.delay, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* ── Energy ball flying to mouth ── */}
        <AnimatePresence>
          {feedingState === 'flying' && (
            <motion.div
              className="absolute pointer-events-none z-20"
              style={{ left: '30%', top: '15%' }}
              initial={{ opacity: 0, scale: 0.3, x: -80, y: 80 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1.2, 0.8, 0.2],
                x: [0, energyBallPos.x * 0.5, energyBallPos.x],
                y: [0, energyBallPos.y * 0.3 - 30, energyBallPos.y * 0.7],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-lg shadow-amber-400/60 animate-glow-pulse" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 blur-sm animate-pulse" />
                {/* Sparkle ring around energy ball */}
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-yellow-300/50"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Monster name and subtitle ── */}
        <p className="text-sm font-bold mt-2" style={{ color: '#7c3aed', fontFamily: 'inherit' }}>
          {monsterName}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          把坏情绪喂给我，我帮你吃掉它！🫧
        </p>
      </div>

      {/* ── Text Input + Feed Button ── */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl transition-all"
          style={{
            background: 'rgba(168,85,247,0.06)',
            border: '2px solid rgba(168,85,247,0.2)',
          }}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="今天有什么不开心？喂给小怪兽吧！"
            disabled={feedingState !== 'idle'}
            className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-purple-300/60 disabled:opacity-40"
            style={{ color: 'var(--color-text-primary)' }}
            maxLength={200}
          />
          <motion.button
            ref={feedBtnRef}
            whileHover={inputText.trim() ? { scale: 1.05 } : {}}
            whileTap={inputText.trim() ? { scale: 0.92 } : {}}
            onClick={handleFeed}
            disabled={!inputText.trim() || feedingState !== 'idle' || isFeeding}
            className="relative flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: inputText.trim()
                ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                : 'linear-gradient(135deg, #d8b4fe, #f9a8d4)',
              boxShadow: inputText.trim() ? '0 4px 15px rgba(168,85,247,0.4)' : 'none',
            }}
          >
            <span className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" />
              投喂
            </span>
          </motion.button>
        </div>

        {/* Character count */}
        {inputText.length > 0 && (
          <span className="absolute -bottom-5 right-2 text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
            {inputText.length}/200
          </span>
        )}
      </div>

      {/* ── Monster Quip (appears after belching) ── */}
      <AnimatePresence>
        {showQuip && (
          <motion.div
            className="px-5 py-3 rounded-2xl mx-auto max-w-xs"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
              border: '1.5px solid rgba(168,85,247,0.25)',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Small monster avatar in quip */}
            <div className="text-center mb-1.5">
              <motion.span
                className="inline-block text-2xl"
                animate={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                👾
              </motion.span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-center" style={{ color: '#7c3aed' }}>
              {currentQuip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Decorative: floating sparkles when idle ── */}
      <AnimatePresence>
        {feedingState === 'idle' && (
          <>
            <motion.div
              className="absolute top-10 left-8 pointer-events-none text-lg"
              animate={{ y: [0, -10, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute top-16 right-6 pointer-events-none text-sm"
              animate={{ y: [0, -8, 0], opacity: [0, 0.8, 0], scale: [0.3, 0.9, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
            >
              ⭐
            </motion.div>
            <motion.div
              className="absolute top-28 left-16 pointer-events-none text-xs"
              animate={{ y: [0, -6, 0], opacity: [0, 0.6, 0], scale: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: 0.8 }}
            >
              💫
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────
export default function PsychologyPage() {
  const { todayMood, todayEmotions, recentMoods, psychTip, monsterName, isLoading, logMood, feedEmotion } = usePsychology();
  const { createTodo } = useTodos();

  const [moodRating, setMoodRating] = useState(todayMood?.rating ?? 0);
  const [moodNote, setMoodNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);

  useEffect(() => {
    if (todayMood) { setMoodRating(todayMood.rating); setMoodNote(todayMood.note || ''); }
  }, [todayMood]);

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

  const handleFeed = useCallback(async (text: string) => {
    setIsFeeding(true);
    await feedEmotion(text);
    toast.success('坏情绪已被吃掉！🫧', { duration: 2000 });
    setIsFeeding(false);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#a855f7' }}>
          <Brain className="h-7 w-7" />心理空间
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Psychology Knowledge ── */}
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

        {/* ── MIDDLE: Mood Rating ── */}
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

        {/* ── RIGHT: Monster Mood Eater ── */}
        <div>
          <div className="module-card h-full relative overflow-visible" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
              <Heart className="h-5 w-5" style={{ color: '#ec4899' }} />情绪暴食怪
            </h2>
            <MonsterMoodEater
              monsterName={monsterName}
              onFeed={handleFeed}
              isFeeding={isFeeding}
            />

            {/* ── Today's eaten emotions ── */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[10px] font-medium mb-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
                🫧 今天已经吃掉了 {todayEmotions.length} 个坏情绪
              </p>
              {todayEmotions.length > 0 && (
                <div className="max-h-20 overflow-y-auto scrollbar-hide space-y-1">
                  {todayEmotions.map((e, i) => (
                    <motion.div
                      key={e.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: 'rgba(236,72,153,0.05)' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Zap className="h-3 w-3 flex-shrink-0" style={{ color: '#ec4899' }} />
                      <span className="truncate" style={{ color: 'var(--color-text-secondary)' }}>
                        {e.emotion}
                      </span>
                      <span className="flex-shrink-0 text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                        {e.createdAt?.slice(11, 16) || ''}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
