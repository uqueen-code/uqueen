'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Star, Sparkles, Smile, Heart, Send, Zap } from 'lucide-react';
import { usePsychology } from '@/hooks/usePsychology';
import { useTodos } from '@/hooks/useTodos';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory, Priority } from '@/types/enums';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════
// Monster quips
// ═══════════════════════════════════════════════════════
const QUIPS = [
  '嗝！这坏情绪真难吃，下次给我带点开心的！🍬',
  '嗷呜~ 吞下去了！味道像烧焦的西兰花，但我帮你消化掉啦！🥦',
  '嗝~ 这烦恼有点酸，不过没关系，我最爱吃酸的了！🍋',
  '唔…这块"不开心"有点硬，但我牙口好！嘎嘣脆！🦷',
  '嘿嘿，吃掉了！你的不开心现在在我肚子里变成了彩虹屁~ 🌈',
  '嗝！吃饱了吃饱了，这顿情绪大餐够我消化一整天啦~ 😋',
  '咔嚓咔嚓…嗯？这烦恼是过期了吗？没事，我百毒不侵！🛡️',
  '嗷~ 这块情绪好像有点甜？原来不开心里面也藏着一点点好事呢！🍯',
  '嗝~~~ 好大一个嗝！你的坏情绪变成气体飞走啦，再也回不来了！💨',
  '吧唧吧唧…嗯这口有点咸，是你偷偷哭了嘛？没关系我帮你吃掉！🧂',
  '叮！你的不开心已被本怪兽消化系统处理完毕，请查收一份好心情~ ✅',
  '嗷嗷！这情绪嚼起来像泡泡糖，还能吹个大泡泡！啵~ 🫧',
  '唔…这块焦虑咬下去嘎嘣脆，像薯片！再来…啊不对，希望你别再来了！😂',
  '嗝！消化完毕！你的心情现在应该像棉花糖一样轻盈啦~ ☁️',
];

// ═══════════════════════════════════════════════════════
// Star Rating
// ═══════════════════════════════════════════════════════
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
            fill: filled ? '#f59e0b' : half ? 'url(#halfGrad4)' : 'transparent',
            color: filled || half ? '#f59e0b' : '#d1d5db',
            strokeWidth: 1.5,
          }} />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 justify-center">
      <svg width="0" height="0"><defs><linearGradient id="halfGrad4"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="transparent" /></linearGradient></defs></svg>
      {stars}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 3D Clay Monster — premium blind-box figure style
// ═══════════════════════════════════════════════════════
function ClayMonster({
  monsterName,
  onFeed,
  isFeeding,
}: {
  monsterName: string;
  onFeed: (text: string) => Promise<void>;
  isFeeding: boolean;
}) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'idle' | 'launch' | 'fly' | 'eat' | 'belch' | 'done'>('idle');
  const [quip, setQuip] = useState('');
  const [showQuip, setShowQuip] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; s: number; d: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mouthOpen = phase === 'eat' || phase === 'belch';

  const doFeed = useCallback(async () => {
    const text = input.trim();
    if (!text || phase !== 'idle' || isFeeding) return;
    setInput(''); setShowQuip(false);
    setPhase('launch');
    setTimeout(() => setPhase('fly'), 120);
    setTimeout(() => setPhase('eat'), 600);
    setTimeout(() => {
      setPhase('belch');
      setBubbles(Array.from({ length: 10 }, (_, i) => ({
        id: i, x: (Math.random() - 0.5) * 140, y: -(Math.random() * 90 + 20),
        s: 5 + Math.random() * 18, d: Math.random() * 0.4,
      })));
      setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]!);
      setShowQuip(true);
      onFeed(text);
    }, 900);
    setTimeout(() => { setPhase('done'); setTimeout(() => { setPhase('idle'); setBubbles([]); }, 500); setTimeout(() => setShowQuip(false), 5000); inputRef.current?.focus(); }, 2200);
  }, [input, phase, isFeeding, onFeed]);

  return (
    <div className="text-center relative">
      {/* ═══════════ MONSTER ═══════════ */}
      <div className="relative inline-block mb-6 select-none" style={{ width: 200, height: 230 }}>
        <motion.div className="absolute inset-0"
          animate={
            phase === 'belch' ? { scale: [1, 1.15, 0.9, 1.08, 0.95, 1], rotate: [0, -5, 5, -3, 1, 0] } :
            phase === 'eat'  ? { scale: [1, 1.06], rotate: [0, -2] } :
            { y: [0, -6, 0], rotate: [0, -0.5, 0, 0.5, 0] }
          }
          transition={
            phase === 'belch' ? { duration: 0.8, ease: 'easeOut' } :
            phase === 'eat'   ? { duration: 0.12 } :
            { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* ── Left Ear (bunny/elf style, angled outward) ── */}
          <div className="absolute z-0"
            style={{ left: 38, top: -42, width: 36, height: 72, transform: 'rotate(-22deg)', transformOrigin: 'bottom center' }}>
            {/* Outer ear */}
            <div className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #e9d5ff 0%, #c084fc 40%, #a855f7 100%)',
                boxShadow: 'inset -3px -6px 12px rgba(0,0,0,0.15), inset 2px 4px 8px rgba(255,255,255,0.4)',
                borderRadius: '50% 50% 45% 45%',
              }} />
            {/* Inner ear */}
            <div className="absolute inset-2 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
                boxShadow: 'inset 1px 2px 4px rgba(255,255,255,0.5)',
                borderRadius: '50% 50% 45% 45%',
              }} />
          </div>

          {/* ── Right Ear ── */}
          <div className="absolute z-0"
            style={{ right: 38, top: -42, width: 36, height: 72, transform: 'rotate(22deg)', transformOrigin: 'bottom center' }}>
            <div className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #e9d5ff 0%, #c084fc 40%, #a855f7 100%)',
                boxShadow: 'inset -3px -6px 12px rgba(0,0,0,0.15), inset 2px 4px 8px rgba(255,255,255,0.4)',
                borderRadius: '50% 50% 45% 45%',
              }} />
            <div className="absolute inset-2 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
                boxShadow: 'inset 1px 2px 4px rgba(255,255,255,0.5)',
                borderRadius: '50% 50% 45% 45%',
              }} />
          </div>

          {/* ── Curly tuft on top ── */}
          <div className="absolute left-1/2 z-10" style={{ top: -18, transform: 'translateX(-50%)' }}>
            <svg width="28" height="22" viewBox="0 0 28 22">
              <path d="M 8 20 Q 4 12 10 6 Q 14 0 18 5 Q 22 0 24 7 Q 26 14 18 20"
                fill="none" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }} />
            </svg>
          </div>

          {/* ── BODY — organic egg/drop shape with 3D clay shading ── */}
          <div className="absolute"
            style={{
              left: 14, top: 18, width: 172, height: 186,
              borderRadius: '42% 58% 68% 34% / 44% 42% 58% 56%',
              background: 'linear-gradient(145deg, #fdf2f8 0%, #fbcfe8 18%, #e9d5ff 45%, #d8b4fe 68%, #c084fc 100%)',
              boxShadow: [
                // Ambient occlusion (bottom-right dark)
                'inset -12px -14px 30px rgba(139,92,246,0.25)',
                // Deep shadow edge (bottom)
                'inset 0px -8px 20px rgba(0,0,0,0.12)',
                // Top-left rim light
                'inset 10px 12px 28px rgba(255,255,255,0.55)',
                // Top highlight
                'inset 6px 2px 16px rgba(255,255,255,0.35)',
                // External drop shadow
                '0 12px 32px rgba(139,92,246,0.18)',
                '0 4px 8px rgba(0,0,0,0.08)',
              ].join(', '),
              border: 'none',
            }}
          />

          {/* ── Body surface highlight blob ── */}
          <div className="absolute"
            style={{
              left: 38, top: 36, width: 80, height: 70,
              borderRadius: '55% 45% 60% 40% / 50% 48% 52% 50%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Belly patch ── */}
          <div className="absolute"
            style={{
              left: 55, top: 120, width: 90, height: 68,
              borderRadius: '48% 52% 55% 45% / 50% 48% 52% 50%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, rgba(252,231,243,0.25) 50%, transparent 85%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── EYES ── */}
          {/* Left eye group */}
          <div className="absolute z-10" style={{ left: 48, top: 70 }}>
            {/* Eye white */}
            <div className="relative" style={{ width: 42, height: 44 }}>
              <div className="absolute inset-0 rounded-full bg-white"
                style={{ boxShadow: 'inset -2px -3px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)' }} />
              {/* Iris — deep gemstone blue-green */}
              <div className="absolute rounded-full"
                style={{
                  width: 30, height: 32, left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle at 40% 35%, #34d399 0%, #0d9488 30%, #0f766e 60%, #134e4a 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 0 1.5px rgba(0,0,0,0.08)',
                }}
              />
              {/* Pupil */}
              <div className="absolute rounded-full bg-black"
                style={{
                  width: 16, height: 16, left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                }}
              />
              {/* Highlight 1 — large bright */}
              <div className="absolute rounded-full bg-white"
                style={{ width: 9, height: 9, left: 24, top: 14, opacity: 0.95 }} />
              {/* Highlight 2 — medium */}
              <div className="absolute rounded-full bg-white"
                style={{ width: 5, height: 5, left: 18, top: 24, opacity: 0.8 }} />
              {/* Highlight 3 — tiny */}
              <div className="absolute rounded-full bg-white"
                style={{ width: 2.5, height: 2.5, left: 28, top: 20, opacity: 0.6 }} />
            </div>
          </div>

          {/* Right eye group */}
          <div className="absolute z-10" style={{ right: 48, top: 70 }}>
            <div className="relative" style={{ width: 42, height: 44 }}>
              <div className="absolute inset-0 rounded-full bg-white"
                style={{ boxShadow: 'inset -2px -3px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)' }} />
              <div className="absolute rounded-full"
                style={{
                  width: 30, height: 32, left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle at 40% 35%, #34d399 0%, #0d9488 30%, #0f766e 60%, #134e4a 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 0 1.5px rgba(0,0,0,0.08)',
                }}
              />
              <div className="absolute rounded-full bg-black"
                style={{
                  width: 16, height: 16, left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <div className="absolute rounded-full bg-white"
                style={{ width: 9, height: 9, left: 24, top: 14, opacity: 0.95 }} />
              <div className="absolute rounded-full bg-white"
                style={{ width: 5, height: 5, left: 18, top: 24, opacity: 0.8 }} />
              <div className="absolute rounded-full bg-white"
                style={{ width: 2.5, height: 2.5, left: 28, top: 20, opacity: 0.6 }} />
            </div>
          </div>

          {/* ── BLUSH ── */}
          <div className="absolute z-10 rounded-full"
            style={{
              left: 28, top: 108, width: 24, height: 14,
              background: 'radial-gradient(ellipse at center, rgba(251,113,133,0.45) 0%, transparent 80%)',
            }} />
          <div className="absolute z-10 rounded-full"
            style={{
              right: 28, top: 108, width: 24, height: 14,
              background: 'radial-gradient(ellipse at center, rgba(251,113,133,0.45) 0%, transparent 80%)',
            }} />

          {/* ── MOUTH ── */}
          <div className="absolute z-10" style={{ left: '50%', top: 112, transform: 'translateX(-50%)' }}>
            {!mouthOpen ? (
              /* Idle: wavy cat mouth (ω shape) */
              <svg width="44" height="20" viewBox="0 0 44 20">
                <motion.path
                  d="M 12 4 Q 18 14 22 8 Q 26 14 32 4"
                  fill="none" stroke="#7c3aed" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  animate={{ d: 'M 12 4 Q 18 14 22 8 Q 26 14 32 4' }}
                  transition={{ duration: 0.2 }}
                />
              </svg>
            ) : (
              /* Eating: wide open O */
              <svg width="44" height="28" viewBox="0 0 44 28">
                <motion.ellipse cx="22" cy="14" rx="15" ry="11"
                  fill="#f9a8d4" stroke="#c084fc" strokeWidth="2"
                  initial={{ rx: 6, ry: 3 }}
                  animate={{ rx: 15, ry: 11 }}
                  transition={{ duration: 0.12 }}
                />
                {/* Tongue */}
                <ellipse cx="22" cy="20" rx="7" ry="4.5" fill="#fb7185" opacity="0.55" />
              </svg>
            )}
          </div>

          {/* ── ARMS ── */}
          <motion.div className="absolute z-10"
            style={{ left: 6, top: 108, width: 28, height: 22, transformOrigin: 'right center' }}
            animate={phase === 'eat' ? { rotate: -30 } : { rotate: [0, -8, 0] }}
            transition={phase === 'eat' ? { duration: 0.12 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-full h-full rounded-full"
              style={{
                background: 'linear-gradient(135deg, #e9d5ff, #c084fc)',
                boxShadow: 'inset -2px -3px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.3)',
                borderRadius: '55% 45% 50% 50% / 50% 50% 50% 50%',
              }} />
          </motion.div>

          <motion.div className="absolute z-10"
            style={{ right: 6, top: 108, width: 28, height: 22, transformOrigin: 'left center' }}
            animate={phase === 'eat' ? { rotate: 30 } : { rotate: [0, 8, 0] }}
            transition={phase === 'eat' ? { duration: 0.12 } : { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <div className="w-full h-full rounded-full"
              style={{
                background: 'linear-gradient(135deg, #e9d5ff, #c084fc)',
                boxShadow: 'inset -2px -3px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.3)',
                borderRadius: '45% 55% 50% 50% / 50% 50% 50% 50%',
              }} />
          </motion.div>

          {/* ── FEET ── */}
          <div className="absolute z-10" style={{ left: 38, bottom: 0, width: 38, height: 26 }}>
            <div className="w-full h-full rounded-full"
              style={{
                background: 'linear-gradient(180deg, #c084fc 0%, #a855f7 60%, #9333ea 100%)',
                boxShadow: 'inset -3px -4px 8px rgba(0,0,0,0.15), inset 2px 2px 6px rgba(255,255,255,0.2), 0 3px 6px rgba(0,0,0,0.1)',
                borderRadius: '48% 52% 55% 45% / 55% 55% 45% 45%',
              }} />
          </div>
          <div className="absolute z-10" style={{ right: 38, bottom: 0, width: 38, height: 26 }}>
            <div className="w-full h-full rounded-full"
              style={{
                background: 'linear-gradient(180deg, #c084fc 0%, #a855f7 60%, #9333ea 100%)',
                boxShadow: 'inset -3px -4px 8px rgba(0,0,0,0.15), inset 2px 2px 6px rgba(255,255,255,0.2), 0 3px 6px rgba(0,0,0,0.1)',
                borderRadius: '52% 48% 45% 55% / 55% 55% 45% 45%',
              }} />
          </div>

          {/* ── TAIL ── */}
          <div className="absolute z-10" style={{ right: -8, top: 135 }}>
            <svg width="28" height="32" viewBox="0 0 28 32">
              <path d="M 24 2 Q 26 8 20 14 Q 14 20 10 28"
                fill="none" stroke="#c084fc" strokeWidth="5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }} />
            </svg>
          </div>
        </motion.div>

        {/* ── ENERGY BALL (feed animation) ── */}
        <AnimatePresence>
          {(phase === 'launch' || phase === 'fly') && (
            <motion.div className="absolute pointer-events-none z-30"
              style={{ left: '5%', top: '25%' }}
              initial={{ opacity: 0, scale: 0.15, x: -40, y: 50 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.15, 1.15, 0.6, 0.1], x: [0, 20, 55, 80], y: [0, -50, -25, 5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)',
                    boxShadow: '0 0 25px rgba(251,191,36,0.5), 0 0 50px rgba(251,191,36,0.25), 0 0 80px rgba(254,240,138,0.2)',
                  }} />
                <motion.div className="absolute -inset-3 rounded-full border-2 border-yellow-300/35"
                  animate={{ scale: [1, 1.7, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 0.5, repeat: Infinity }} />
                <motion.div className="absolute -top-2 -right-2 text-base"
                  animate={{ scale: [0, 1.3, 0], rotate: [0, 180] }}
                  transition={{ duration: 0.45, repeat: Infinity }}>✨</motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BELCH BUBBLES ── */}
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.div key={b.id} className="absolute pointer-events-none rounded-full"
              style={{
                width: b.s, height: b.s, left: '50%', top: '30%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(236,72,153,0.15))',
                border: '1px solid rgba(251,207,232,0.2)',
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: [0, 0.7, 0], x: b.x, y: b.y, scale: [0, 1.15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, delay: b.d, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* ── IDLE SPARKLES ── */}
        {phase === 'idle' && (
          <>
            <motion.div className="absolute pointer-events-none"
              style={{ left: 10, top: 10 }}
              animate={{ y: [0, -7, 0], opacity: [0, 0.8, 0], scale: [0.3, 1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}>✨</motion.div>
            <motion.div className="absolute pointer-events-none"
              style={{ right: 8, top: 40 }}
              animate={{ y: [0, -5, 0], opacity: [0, 0.6, 0], scale: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: 1.8 }}>⭐</motion.div>
            <motion.div className="absolute pointer-events-none"
              style={{ left: 25, top: 5 }}
              animate={{ y: [0, -5, 0], opacity: [0, 0.5, 0], scale: [0.1, 0.6, 0.1] }}
              transition={{ duration: 2.3, repeat: Infinity, delay: 1 }}>💫</motion.div>
          </>
        )}
      </div>

      {/* ── NAME ── */}
      <p className="text-sm font-bold text-purple-500 tracking-wide">{monsterName}</p>
      <p className="text-[10px] text-slate-400 mb-4">把坏情绪喂给我，我帮你吃掉它！🫧</p>

      {/* ── INPUT ── */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl"
          style={{ background: 'rgba(167,139,250,0.05)', border: '2px solid rgba(167,139,250,0.18)' }}>
          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doFeed(); } }}
            placeholder="今天有什么不开心？喂给小怪兽吧！"
            disabled={phase !== 'idle' || isFeeding}
            className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-purple-300/50 disabled:opacity-40 text-slate-700"
            maxLength={200} />
          <motion.button
            whileHover={input.trim() && phase === 'idle' ? { scale: 1.04 } : {}}
            whileTap={input.trim() && phase === 'idle' ? { scale: 0.92 } : {}}
            onClick={doFeed}
            disabled={!input.trim() || phase !== 'idle' || isFeeding}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1.5"
            style={{
              background: input.trim() && phase === 'idle'
                ? 'linear-gradient(135deg, #a78bfa, #f472b6)'
                : 'linear-gradient(135deg, #ddd6fe, #fbcfe8)',
              boxShadow: input.trim() && phase === 'idle' ? '0 4px 16px rgba(167,139,250,0.35)' : 'none',
            }}>
            <Send className="h-3.5 w-3.5" />投喂
          </motion.button>
        </div>
        {input.length > 0 && <span className="absolute -bottom-5 right-2 text-[9px] text-slate-400">{input.length}/200</span>}
      </div>

      {/* ── QUIP ── */}
      <AnimatePresence>
        {showQuip && (
          <motion.div className="px-5 py-3.5 rounded-2xl mx-auto max-w-xs relative"
            style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(244,114,182,0.08))', border: '1.5px solid rgba(167,139,250,0.2)' }}
            initial={{ opacity: 0, y: 18, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.15)', borderRight: 'none', borderBottom: 'none' }} />
            <motion.span className="block text-center text-xl mb-1"
              animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>👾</motion.span>
            <p className="text-sm font-medium leading-relaxed text-center text-purple-600">{quip}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════
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
    await createTodo({ title: `😊 今日心情：${labels[Math.round(moodRating * 2) / 2] || moodRating + '星'}`, description: moodNote || undefined, category: ModuleCategory.PSYCHOLOGY, priority: Priority.NORMAL, dueDate: new Date().toISOString().split('T')[0]!, isRecurring: false });
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
        <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-500"><Brain className="h-7 w-7" />心理空间</h1>
        <p className="text-sm mt-1 text-slate-400">关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Knowledge */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#a855f7' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#a855f7' } as React.CSSProperties}><Brain className="h-5 w-5 text-purple-500" />每日心理学知识</h2>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)' }}>
              <div className="flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 flex-shrink-0 text-purple-400" /><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-500">今日心理知识</span></div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{psychTip}</p>
            </div>
            {recentMoods.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-medium mb-2 text-slate-400">最近心情趋势</p>
                <div className="flex items-end gap-1 h-20">
                  {recentMoods.map((m, i) => {
                    const h = (m.rating / 5) * 80;
                    return (<div key={m.date} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max(4, h)}px`, background: m.rating >= 3.5 ? '#22c55e' : m.rating >= 2.5 ? '#f59e0b' : '#ef4444', opacity: 0.7 + (i / recentMoods.length) * 0.3 }} /><span className="text-[8px] text-slate-400">{m.date.slice(5)}</span></div>);
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Mood */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}><Smile className="h-5 w-5 text-amber-500" />今日心情</h2>
            <div className="text-center py-3">
              <div className="text-5xl mb-2">{mi.icon}</div>
              <p className="text-lg font-bold mb-0.5" style={{ color: mi.color }}>{mi.text}</p>
              <p className="text-2xl font-bold mb-4 text-amber-500">{moodRating > 0 ? `${moodRating} / 5` : '—'}</p>
              <StarRating rating={moodRating} onChange={setMoodRating} />
              <p className="text-[10px] mt-1 mb-3 text-slate-400">左半=0.5星 · 右半=1星</p>
              <textarea value={moodNote} onChange={e => setMoodNote(e.target.value)} placeholder="今天发生了什么？记录心情日记..." className="input-field min-h-[80px] text-sm mb-3" />
              <button onClick={handleSaveMood} disabled={isSubmitting || moodRating === 0} className="btn-primary w-full" style={{ '--color-accent': '#f59e0b', '--color-accent-hover': '#d97706' } as React.CSSProperties}>{todayMood ? '更新心情' : '保存心情'}</button>
              {todayMood && <p className="text-[10px] mt-2 text-emerald-500">✓ 已记录 · 同步到待办</p>}
            </div>
          </div>
        </div>

        {/* RIGHT: Monster */}
        <div>
          <div className="module-card h-full relative overflow-visible" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#ec4899' } as React.CSSProperties}><Heart className="h-5 w-5 text-pink-500" />情绪暴食怪</h2>
            <ClayMonster monsterName={monsterName} onFeed={handleFeed} isFeeding={isFeeding} />
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-medium mb-2 text-center text-slate-400">🫧 今天已经吃掉了 {todayEmotions.length} 个坏情绪</p>
              {todayEmotions.length > 0 && (
                <div className="max-h-20 overflow-y-auto scrollbar-hide space-y-1">
                  {todayEmotions.map((e, i) => (
                    <motion.div key={e.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(236,72,153,0.04)' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Zap className="h-3 w-3 flex-shrink-0 text-pink-400" /><span className="truncate text-slate-500">{e.emotion}</span><span className="flex-shrink-0 text-[9px] text-slate-400">{e.createdAt?.slice(11, 16) || ''}</span>
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
