'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Star, Sparkles, Smile, Heart, Send, Zap } from 'lucide-react';
import { usePsychology } from '@/hooks/usePsychology';
import { useTodos } from '@/hooks/useTodos';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory, Priority } from '@/types/enums';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════
// Monster quips — witty, healing responses after eating
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// Star rating with half-star support
// ═══════════════════════════════════════════════════════════════
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
            fill: filled ? '#f59e0b' : half ? 'url(#halfGrad3)' : 'transparent',
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
          <linearGradient id="halfGrad3"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="transparent" /></linearGradient>
        </defs>
      </svg>
      {stars}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Monster Mood Eater — premium jelly blob redesign
// ═══════════════════════════════════════════════════════════════
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
  // Animation state machine
  const [phase, setPhase] = useState<'idle' | 'launch' | 'travel' | 'eat' | 'belch' | 'done'>('idle');
  const [quip, setQuip] = useState('');
  const [showQuip, setShowQuip] = useState(false);
  const [belchBubbles, setBelchBubbles] = useState<{ id: number; x: number; y: number; s: number; d: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const monsterRef = useRef<HTMLDivElement>(null);

  const handleFeed = useCallback(async () => {
    const text = inputText.trim();
    if (!text || phase !== 'idle' || isFeeding) return;
    setInputText('');
    setShowQuip(false);

    // 1. Launch energy ball from input
    setPhase('launch');
    setTimeout(() => setPhase('travel'), 150);
    // 2. Monster eats
    setTimeout(() => setPhase('eat'), 650);
    // 3. Belch
    setTimeout(() => {
      setPhase('belch');
      const bubbles = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 120,
        y: -(Math.random() * 80 + 25),
        s: 5 + Math.random() * 16,
        d: Math.random() * 0.35,
      }));
      setBelchBubbles(bubbles);
      setQuip(MONSTER_QUIPS[Math.floor(Math.random() * MONSTER_QUIPS.length)]!);
      setShowQuip(true);
      // Save
      onFeed(text);
    }, 950);
    // 4. Reset
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => { setPhase('idle'); setBelchBubbles([]); }, 400);
      setTimeout(() => setShowQuip(false), 5000);
      inputRef.current?.focus();
    }, 2000);
  }, [inputText, phase, isFeeding, onFeed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleFeed(); }
  };

  // ── Mouth path ──
  const mouthOpen = phase === 'eat' || phase === 'belch';
  const mouthPath = mouthOpen
    ? 'M 44 80 Q 60 92 76 80'  // O shape — wide open eating
    : 'M 50 84 L 60 79 L 70 84'; // ▽ shape — cute inverted V

  return (
    <div className="text-center relative">
      {/* ── Monster ── */}
      <div ref={monsterRef} className="relative inline-block mb-5 select-none">
        <motion.div
          className="relative"
          animate={
            phase === 'belch'
              ? { scale: [1, 1.13, 0.92, 1.07, 0.96, 1], rotate: [0, -4, 4, -2, 1, 0] }
              : phase === 'eat'
              ? { scale: [1, 1.04], rotate: [0, -2] }
              : { y: [0, -5, 0], rotate: [0, -0.8, 0, 0.8, 0] }
          }
          transition={
            phase === 'belch'
              ? { duration: 0.75, ease: 'easeOut' }
              : phase === 'eat'
              ? { duration: 0.15 }
              : { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <svg viewBox="0 0 120 140" className="w-48 h-auto">
            <defs>
              {/* Jelly body gradient — macaron: soft pink → lavender */}
              <radialGradient id="jellyBody" cx="45%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#fdf2f8" />
                <stop offset="25%" stopColor="#fbcfe8" />
                <stop offset="55%" stopColor="#e9d5ff" />
                <stop offset="85%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#a78bfa" />
              </radialGradient>
              {/* Inner highlight for jelly translucency */}
              <radialGradient id="jellyHighlight" cx="38%" cy="30%" r="35%">
                <stop offset="0%" stopColor="white" stopOpacity="0.7" />
                <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              {/* Belly patch */}
              <radialGradient id="bellyPatch" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#fce7f3" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f9a8d4" stopOpacity="0.15" />
              </radialGradient>
              {/* Blush gradient */}
              <radialGradient id="blushLeft" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="blushRight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
              </radialGradient>
              {/* Drop shadow filter */}
              <filter id="jellyShadow" x="-15%" y="-10%" width="130%" height="125%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="4" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.12" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Body — organic jelly/blob shape (wider at bottom, narrower at top) ── */}
            <path d="M 60 28
              Q 78 28 90 38
              Q 104 50 106 68
              Q 108 88 104 102
              Q 98 120 78 126
              Q 60 130 42 126
              Q 22 120 16 102
              Q 12 88 14 68
              Q 16 50 30 38
              Q 42 28 60 28 Z"
              fill="url(#jellyBody)"
              filter="url(#jellyShadow)"
            />

            {/* ── Inner highlight (jelly translucency effect) ── */}
            <path d="M 60 30
              Q 76 30 86 39
              Q 98 49 100 65
              Q 102 82 98 95
              Q 92 110 76 115
              Q 62 117 50 114"
              fill="none" stroke="white" strokeWidth="2.5" strokeOpacity="0.35"
              strokeLinecap="round"
            />

            {/* ── Top highlight blob ── */}
            <ellipse cx="52" cy="52" rx="19" ry="22" fill="url(#jellyHighlight)" />

            {/* ── Belly patch ── */}
            <ellipse cx="60" cy="90" rx="28" ry="23" fill="url(#bellyPatch)" />

            {/* ── Tiny belly heart ── */}
            <g opacity="0.5">
              <path d="M 60 83 Q 56 79 53 83 Q 50 88 60 96 Q 70 88 67 83 Q 64 79 60 83 Z"
                fill="#fb7185" />
            </g>

            {/* ── Horns/ears — soft rounded triangles ── */}
            <ellipse cx="34" cy="38" rx="8" ry="14" fill="#c4b5fd" transform="rotate(-20, 34, 38)" />
            <ellipse cx="34" cy="40" rx="4" ry="8" fill="#e9d5ff" transform="rotate(-20, 34, 40)" />
            <ellipse cx="86" cy="38" rx="8" ry="14" fill="#c4b5fd" transform="rotate(20, 86, 38)" />
            <ellipse cx="86" cy="40" rx="4" ry="8" fill="#e9d5ff" transform="rotate(20, 86, 40)" />

            {/* ── Eyes — large, sparkly, slightly angled for cuteness ── */}
            {/* Left eye */}
            <ellipse cx="42" cy="60" rx="12" ry="13" fill="white" />
            <ellipse cx="43" cy="61" rx="6.5" ry="7" fill="#1e1b4b" />
            {/* Eye sparkle */}
            <circle cx="46" cy="56.5" r="2.5" fill="white" />
            <circle cx="40" cy="63.5" r="1.3" fill="white" opacity="0.7" />
            {/* Eyelid top shadow */}
            <path d="M 32 52 Q 42 46 54 54" fill="none" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round" />

            {/* Right eye */}
            <ellipse cx="78" cy="60" rx="12" ry="13" fill="white" />
            <ellipse cx="77" cy="61" rx="6.5" ry="7" fill="#1e1b4b" />
            {/* Eye sparkle */}
            <circle cx="81" cy="56.5" r="2.5" fill="white" />
            <circle cx="75" cy="63.5" r="1.3" fill="white" opacity="0.7" />
            {/* Eyelid top shadow */}
            <path d="M 66 54 Q 78 46 88 52" fill="none" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round" />

            {/* ── Pupils squash when eating ── */}
            <motion.g
              animate={mouthOpen ? { scaleY: 0.25 } : { scaleY: 1 }}
              transition={{ duration: 0.1 }}
              style={{ transformOrigin: '43px 61px' }}
            >
              <ellipse cx="43" cy="61" rx="6.5" ry="7" fill="#1e1b4b" />
            </motion.g>
            <motion.g
              animate={mouthOpen ? { scaleY: 0.25 } : { scaleY: 1 }}
              transition={{ duration: 0.1 }}
              style={{ transformOrigin: '77px 61px' }}
            >
              <ellipse cx="77" cy="61" rx="6.5" ry="7" fill="#1e1b4b" />
            </motion.g>

            {/* ── Blush cheeks ── */}
            <ellipse cx="26" cy="74" rx="10" ry="6" fill="url(#blushLeft)" />
            <ellipse cx="94" cy="74" rx="10" ry="6" fill="url(#blushRight)" />

            {/* ── Mouth ── */}
            <motion.path
              d={mouthPath}
              fill={mouthOpen ? '#f9a8d4' : 'none'}
              stroke={mouthOpen ? '#c084fc' : '#8b5cf6'}
              strokeWidth={mouthOpen ? 2.2 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ d: mouthPath }}
              transition={{ duration: 0.15 }}
            />

            {/* ── Tongue (visible when mouth open) ── */}
            {mouthOpen && (
              <ellipse cx="60" cy="86" rx="7" ry="4.5" fill="#fb7185" opacity="0.6" />
            )}

            {/* ── Arms — tiny, waving nubs ── */}
            <motion.g
              animate={phase === 'eat' ? { rotate: [0, -20] } : { rotate: [0, -6, 0] }}
              transition={phase === 'eat' ? { duration: 0.15 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '18px 82px' }}
            >
              <ellipse cx="18" cy="82" rx="9" ry="6" fill="#c4b5fd" transform="rotate(-35, 18, 82)" />
            </motion.g>
            <motion.g
              animate={phase === 'eat' ? { rotate: [0, 20] } : { rotate: [0, 6, 0] }}
              transition={phase === 'eat' ? { duration: 0.15 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              style={{ transformOrigin: '102px 82px' }}
            >
              <ellipse cx="102" cy="82" rx="9" ry="6" fill="#c4b5fd" transform="rotate(35, 102, 82)" />
            </motion.g>

            {/* ── Feet — soft pads ── */}
            <ellipse cx="40" cy="124" rx="12" ry="8" fill="#8b5cf6" />
            <ellipse cx="80" cy="124" rx="12" ry="8" fill="#8b5cf6" />
            {/* Toe dots */}
            {[32, 40, 48].map(cx => (<circle key={`tl${cx}`} cx={cx} cy="127" r="3.5" fill="#7c3aed" />))}
            {[72, 80, 88].map(cx => (<circle key={`tr${cx}`} cx={cx} cy="127" r="3.5" fill="#7c3aed" />))}

            {/* ── Cute curly tail ── */}
            <path d="M 104 98 Q 116 92 114 82 Q 112 75 108 80"
              fill="none" stroke="#c4b5fd" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* ── Energy ball (flies from input to monster mouth) ── */}
        <AnimatePresence>
          {(phase === 'launch' || phase === 'travel') && (
            <motion.div
              className="absolute pointer-events-none z-30"
              style={{ left: '10%', top: '20%' }}
              initial={{ opacity: 0, scale: 0.2, x: -50, y: 80 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.2, 1.1, 0.7, 0.15],
                x: [0, -10, 25, 55],
                y: [0, -40, -20, 10],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            >
              {/* Glowing energy ball */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)',
                    boxShadow: '0 0 20px rgba(251,191,36,0.5), 0 0 40px rgba(251,191,36,0.25), 0 0 60px rgba(254,240,138,0.2)',
                  }} />
                {/* Pulse ring */}
                <motion.div className="absolute -inset-2 rounded-full border-2 border-yellow-300/40"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 0.6, repeat: Infinity }} />
                {/* Star sparkles */}
                <motion.div className="absolute -top-1 -right-1 text-base"
                  animate={{ scale: [0, 1.2, 0], rotate: [0, 180] }}
                  transition={{ duration: 0.5, repeat: Infinity }}>✨</motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Belch bubbles ── */}
        <AnimatePresence>
          {belchBubbles.map(b => (
            <motion.div key={b.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: b.s, height: b.s, left: '50%', top: '28%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(236,72,153,0.15))',
                border: '1px solid rgba(251,207,232,0.25)',
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: [0, 0.75, 0], x: b.x, y: b.y, scale: [0, 1.1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, delay: b.d, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* ── Sparkles around monster when idle ── */}
        {phase === 'idle' && (
          <>
            <motion.div className="absolute top-6 left-5 pointer-events-none"
              animate={{ y: [0, -8, 0], opacity: [0, 0.8, 0], scale: [0.4, 1, 0.4] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 0 }}>✨</motion.div>
            <motion.div className="absolute top-14 right-3 pointer-events-none"
              animate={{ y: [0, -6, 0], opacity: [0, 0.6, 0], scale: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: 1.6 }}>⭐</motion.div>
            <motion.div className="absolute top-24 left-12 pointer-events-none"
              animate={{ y: [0, -5, 0], opacity: [0, 0.5, 0], scale: [0.1, 0.6, 0.1] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: 0.9 }}>💫</motion.div>
          </>
        )}

        {/* ── Name ── */}
        <p className="text-sm font-bold mt-3 text-purple-600 tracking-wide">{monsterName}</p>
        <p className="text-[10px] text-slate-400">把坏情绪喂给我，我帮你吃掉它！🫧</p>
      </div>

      {/* ── Input + Feed ── */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl transition-all"
          style={{
            background: 'rgba(167,139,250,0.05)',
            border: '2px solid rgba(167,139,250,0.18)',
          }}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="今天有什么不开心？喂给小怪兽吧！"
            disabled={phase !== 'idle' || isFeeding}
            className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-purple-300/50 disabled:opacity-40 text-slate-700"
            maxLength={200}
          />
          <motion.button
            whileHover={inputText.trim() && phase === 'idle' ? { scale: 1.04 } : {}}
            whileTap={inputText.trim() && phase === 'idle' ? { scale: 0.93 } : {}}
            onClick={handleFeed}
            disabled={!inputText.trim() || phase !== 'idle' || isFeeding}
            className="relative flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: inputText.trim() && phase === 'idle'
                ? 'linear-gradient(135deg, #a78bfa, #f472b6)'
                : 'linear-gradient(135deg, #ddd6fe, #fbcfe8)',
              boxShadow: inputText.trim() && phase === 'idle' ? '0 4px 16px rgba(167,139,250,0.35)' : 'none',
            }}>
            <span className="flex items-center gap-1.5"><Send className="h-3.5 w-3.5" />投喂</span>
          </motion.button>
        </div>
        {inputText.length > 0 && (
          <span className="absolute -bottom-5 right-2 text-[9px] text-slate-400">{inputText.length}/200</span>
        )}
      </div>

      {/* ── Quip (appears after belch) ── */}
      <AnimatePresence>
        {showQuip && (
          <motion.div
            className="px-5 py-3.5 rounded-2xl mx-auto max-w-xs relative"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(244,114,182,0.08))',
              border: '1.5px solid rgba(167,139,250,0.2)',
            }}
            initial={{ opacity: 0, y: 18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* Little bubble triangle pointing up */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.15)', borderRight: 'none', borderBottom: 'none' }} />
            <div className="text-center mb-1">
              <motion.span className="inline-block text-xl"
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}>👾</motion.span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-center text-purple-600">{quip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Psychology Page
// ═══════════════════════════════════════════════════════════════
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
    await createTodo({
      title: `😊 今日心情：${labels[Math.round(moodRating * 2) / 2] || moodRating + '星'}`,
      description: moodNote || undefined,
      category: ModuleCategory.PSYCHOLOGY, priority: Priority.NORMAL,
      dueDate: new Date().toISOString().split('T')[0]!, isRecurring: false,
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
        <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-500">
          <Brain className="h-7 w-7" />心理空间
        </h1>
        <p className="text-sm mt-1 text-slate-400">关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Psychology Knowledge ── */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#a855f7' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#a855f7' } as React.CSSProperties}>
              <Brain className="h-5 w-5 text-purple-500" />每日心理学知识
            </h2>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 text-purple-400" />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-500">今日心理知识</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{psychTip}</p>
            </div>
            {recentMoods.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-medium mb-2 text-slate-400">最近心情趋势</p>
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
                        <span className="text-[8px] text-slate-400">{m.date.slice(5)}</span>
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
              <Smile className="h-5 w-5 text-amber-500" />今日心情
            </h2>
            <div className="text-center py-3">
              <div className="text-5xl mb-2">{mi.icon}</div>
              <p className="text-lg font-bold mb-0.5" style={{ color: mi.color }}>{mi.text}</p>
              <p className="text-2xl font-bold mb-4 text-amber-500">{moodRating > 0 ? `${moodRating} / 5` : '—'}</p>
              <StarRating rating={moodRating} onChange={setMoodRating} />
              <p className="text-[10px] mt-1 mb-3 text-slate-400">左半=0.5星 · 右半=1星</p>
              <textarea value={moodNote}
                onChange={e => setMoodNote(e.target.value)}
                placeholder="今天发生了什么？记录心情日记..."
                className="input-field min-h-[80px] text-sm mb-3" />
              <button onClick={handleSaveMood} disabled={isSubmitting || moodRating === 0}
                className="btn-primary w-full"
                style={{ '--color-accent': '#f59e0b', '--color-accent-hover': '#d97706' } as React.CSSProperties}>
                {todayMood ? '更新心情' : '保存心情'}
              </button>
              {todayMood && <p className="text-[10px] mt-2 text-emerald-500">✓ 已记录 · 同步到待办</p>}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Monster Mood Eater ── */}
        <div>
          <div className="module-card h-full relative overflow-visible" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
              <Heart className="h-5 w-5 text-pink-500" />情绪暴食怪
            </h2>
            <MonsterMoodEater monsterName={monsterName} onFeed={handleFeed} isFeeding={isFeeding} />

            {/* Today's eaten emotions */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-medium mb-2 text-center text-slate-400">
                🫧 今天已经吃掉了 {todayEmotions.length} 个坏情绪
              </p>
              {todayEmotions.length > 0 && (
                <div className="max-h-20 overflow-y-auto scrollbar-hide space-y-1">
                  {todayEmotions.map((e, i) => (
                    <motion.div key={e.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: 'rgba(236,72,153,0.04)' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}>
                      <Zap className="h-3 w-3 flex-shrink-0 text-pink-400" />
                      <span className="truncate text-slate-500">{e.emotion}</span>
                      <span className="flex-shrink-0 text-[9px] text-slate-400">{e.createdAt?.slice(11, 16) || ''}</span>
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
