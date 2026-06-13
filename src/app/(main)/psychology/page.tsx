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
// Snorlax quips
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
  '嗝~~~ 好大一个嗝！你的坏情绪变成气体飞走啦！💨',
  '吧唧吧唧…嗯这口有点咸，是你偷偷哭了嘛？没关系我帮你吃掉！🧂',
  '叮！你的不开心已被本卡比兽消化系统处理完毕！✅',
  '嗷嗷！这情绪嚼起来像泡泡糖，还能吹个大泡泡！啵~ 🫧',
  'Zzz…啊不，我没睡着！我只是在用心消化你的坏情绪！😴',
  '嗝！消化完毕！你的心情现在应该像棉花糖一样轻盈啦~ ☁️',
];

// ═══════════════════════════════════════════════════════
// Star Rating
// ═══════════════════════════════════════════════════════
function StarRating({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-0.5 justify-center">
      <svg width="0" height="0"><defs><linearGradient id="halfGrad5"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="transparent" /></linearGradient></defs></svg>
      {[1,2,3,4,5].map(i => {
        const f = (hovered !== null) ? hovered >= i : rating >= i;
        const h = (hovered !== null) ? (hovered === i - 0.5) : (rating >= i - 0.5 && rating < i);
        return (
          <div key={i} className="relative cursor-pointer" style={{ width:44, height:44 }}>
            <div className="absolute inset-0 w-1/2 z-10" onMouseEnter={() => setHovered(i-0.5)} onMouseLeave={() => setHovered(null)} onClick={() => onChange(i-0.5)} />
            <div className="absolute inset-0 left-1/2 w-1/2 z-10" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onClick={() => onChange(i)} />
            <Star className="absolute inset-0 h-11 w-11 transition-all duration-150" style={{ fill: f ? '#f59e0b' : h ? 'url(#halfGrad5)' : 'transparent', color: f || h ? '#f59e0b' : '#d1d5db', strokeWidth:1.5 }} />
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Snorlax Monster — 卡比兽风格
// ═══════════════════════════════════════════════════════
function SnorlaxMonster({
  monsterName,
  onFeed,
  isFeeding,
}: {
  monsterName: string;
  onFeed: (text: string) => Promise<void>;
  isFeeding: boolean;
}) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'idle'|'launch'|'fly'|'eat'|'belch'|'done'>('idle');
  const [quip, setQuip] = useState('');
  const [showQuip, setShowQuip] = useState(false);
  const [bubbles, setBubbles] = useState<{id:number;x:number;y:number;s:number;d:number}[]>([]);
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
      setBubbles(Array.from({length:10},(_,i)=>({id:i,x:(Math.random()-.5)*140,y:-(Math.random()*90+20),s:5+Math.random()*18,d:Math.random()*.4})));
      setQuip(QUIPS[Math.floor(Math.random()*QUIPS.length)]!);
      setShowQuip(true);
      onFeed(text);
    }, 900);
    setTimeout(() => { setPhase('done'); setTimeout(()=>{setPhase('idle');setBubbles([]);},500); setTimeout(()=>setShowQuip(false),5000); inputRef.current?.focus(); }, 2200);
  }, [input, phase, isFeeding, onFeed]);

  return (
    <div className="text-center relative">
      {/* ── MONSTER ── */}
      <div className="relative inline-block mb-6 select-none" style={{ width:210, height:240 }}>
        <motion.div className="absolute inset-0"
          animate={
            phase==='belch' ? { scale:[1,1.14,.9,1.07,.95,1], rotate:[0,-4,4,-2,1,0] } :
            phase==='eat' ? { scale:[1,1.05], rotate:[0,-1.5] } :
            { y:[0,-5,0], rotate:[0,-.4,0,.4,0] }
          }
          transition={
            phase==='belch' ? { duration:.75, ease:'easeOut' } :
            phase==='eat' ? { duration:.1 } :
            { duration:3.8, repeat:Infinity, ease:'easeInOut' }
          }
        >
          {/* ── LEFT EAR (pointed cat ear) ── */}
          <div className="absolute z-0" style={{ left:42, top:-8, width:34, height:50, transform:'rotate(-15deg)', transformOrigin:'bottom center' }}>
            <div className="absolute inset-0"
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                background: 'linear-gradient(180deg, #0d9488 0%, #0f766e 60%, #115e59 100%)',
                boxShadow: 'inset -3px -5px 10px rgba(0,0,0,0.25), inset 2px 3px 6px rgba(255,255,255,0.15)',
              }} />
            <div className="absolute"
              style={{
                clipPath: 'polygon(50% 20%, 20% 100%, 80% 100%)',
                left:6, right:6, top:8, bottom:4,
                background: 'linear-gradient(180deg, #5eead4 0%, #99f6e4 60%, #a7f3d0 100%)',
                opacity:0.6,
              }} />
          </div>

          {/* ── RIGHT EAR ── */}
          <div className="absolute z-0" style={{ right:42, top:-8, width:34, height:50, transform:'rotate(15deg)', transformOrigin:'bottom center' }}>
            <div className="absolute inset-0"
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                background: 'linear-gradient(180deg, #0d9488 0%, #0f766e 60%, #115e59 100%)',
                boxShadow: 'inset -3px -5px 10px rgba(0,0,0,0.25), inset 2px 3px 6px rgba(255,255,255,0.15)',
              }} />
            <div className="absolute"
              style={{
                clipPath: 'polygon(50% 20%, 20% 100%, 80% 100%)',
                left:6, right:6, top:8, bottom:4,
                background: 'linear-gradient(180deg, #5eead4 0%, #99f6e4 60%, #a7f3d0 100%)',
                opacity:0.6,
              }} />
          </div>

          {/* ── BODY — wide plump teal blob ── */}
          <div className="absolute"
            style={{
              left:8, top:30, width:194, height:180,
              borderRadius:'45% 55% 52% 48% / 42% 40% 60% 58%',
              background:'linear-gradient(160deg, #0ea5a9 0%, #0d9488 22%, #0f766e 50%, #115e59 78%, #134e4a 100%)',
              boxShadow:[
                'inset -14px -16px 35px rgba(0,0,0,0.3)',
                'inset 0px -10px 25px rgba(0,0,0,0.2)',
                'inset 12px 14px 30px rgba(255,255,255,0.2)',
                'inset 6px 3px 18px rgba(255,255,255,0.12)',
                '0 14px 35px rgba(15,118,110,0.25)',
                '0 4px 10px rgba(0,0,0,0.1)',
              ].join(', '),
            }}
          />

          {/* ── Body highlight ── */}
          <div className="absolute"
            style={{
              left:30, top:48, width:80, height:55,
              borderRadius:'55% 45% 60% 40% / 55% 50% 50% 45%',
              background:'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
              pointerEvents:'none',
            }}
          />

          {/* ── FACE PATCH (cream) ── */}
          <div className="absolute"
            style={{
              left:25, top:52, width:160, height:105,
              borderRadius:'48% 52% 55% 45% / 48% 45% 55% 52%',
              background:'linear-gradient(170deg, #FFF8E7 0%, #FEF3C7 40%, #FDE68A 100%)',
              boxShadow:'inset 0 3px 8px rgba(0,0,0,0.08), inset -2px -4px 10px rgba(0,0,0,0.06)',
            }}
          />

          {/* ── BELLY (big cream patch below face) ── */}
          <div className="absolute"
            style={{
              left:18, top:130, width:174, height:85,
              borderRadius:'42% 58% 55% 45% / 52% 48% 55% 48%',
              background:'linear-gradient(170deg, #FFFBEB 0%, #FEF3C7 40%, #FDE68A 100%)',
              boxShadow:'inset 0 4px 10px rgba(0,0,0,0.06)',
              opacity:0.85,
            }}
          />

          {/* ── Belly pattern lines (Snorlax's belly markings) ── */}
          <div className="absolute" style={{ left:55, top:145, width:100, height:55 }}>
            <div className="absolute rounded-full"
              style={{
                left:5, top:5, width:40, height:30,
                border:'2px solid rgba(217,119,6,0.15)',
                borderRadius:'50%',
              }} />
            <div className="absolute rounded-full"
              style={{
                right:5, top:5, width:40, height:30,
                border:'2px solid rgba(217,119,6,0.15)',
                borderRadius:'50%',
              }} />
            <div className="absolute rounded-full"
              style={{
                left:25, bottom:0, width:50, height:25,
                border:'2px solid rgba(217,119,6,0.12)',
                borderRadius:'50%',
                borderTop:'none', borderTopLeftRadius:0, borderTopRightRadius:0,
              }} />
          </div>

          {/* ── EYES — Snorlax's signature closed curved lines ── */}
          <div className="absolute z-10" style={{ left:55, top:78, width:36, height:22 }}>
            <svg width="36" height="22" viewBox="0 0 36 22">
              <path d="M 4 12 Q 18 0 32 12" fill="none" stroke="#134e4a" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute z-10" style={{ right:55, top:78, width:36, height:22 }}>
            <svg width="36" height="22" viewBox="0 0 36 22">
              <path d="M 4 12 Q 18 0 32 12" fill="none" stroke="#134e4a" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* ── MOUTH ── */}
          <div className="absolute z-10" style={{ left:'50%', top:104, transform:'translateX(-50%)' }}>
            {!mouthOpen ? (
              /* Closed: Snorlax inverted-V mouth with tiny fangs */
              <div className="relative" style={{ width:52, height:28 }}>
                <svg width="52" height="28" viewBox="0 0 52 28">
                  {/* Mouth line */}
                  <path d="M 6 4 L 18 20 L 26 6 L 34 20 L 46 4"
                    fill="none" stroke="#134e4a" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                  {/* Left fang */}
                  <polygon points="20,22 22,28 24,22" fill="white" stroke="#134e4a" strokeWidth="0.8" />
                  {/* Right fang */}
                  <polygon points="28,22 30,28 32,22" fill="white" stroke="#134e4a" strokeWidth="0.8" />
                </svg>
              </div>
            ) : (
              /* Open: wide O mouth eating */
              <div className="relative" style={{ width:52, height:32 }}>
                <svg width="52" height="32" viewBox="0 0 52 32">
                  <ellipse cx="26" cy="16" rx="18" ry="13"
                    fill="#134e4a" stroke="#0f766e" strokeWidth="2" />
                  {/* Tongue */}
                  <ellipse cx="26" cy="22" rx="9" ry="5" fill="#fb7185" opacity="0.7" />
                  {/* Fangs visible inside */}
                  <polygon points="14,6 15.5,12 17,6" fill="white" />
                  <polygon points="35,6 36.5,12 38,6" fill="white" />
                </svg>
              </div>
            )}
          </div>

          {/* ── ARMS ── */}
          <motion.div className="absolute z-10"
            style={{ left:-2, top:110, width:34, height:30, transformOrigin:'right center' }}
            animate={phase==='eat'?{rotate:-25}:{rotate:[0,-5,0]}}
            transition={phase==='eat'?{duration:.1}:{duration:2,repeat:Infinity,ease:'easeInOut'}}
          >
            <div className="w-full h-full rounded-full"
              style={{
                background:'linear-gradient(135deg, #0d9488, #0f766e)',
                boxShadow:'inset -3px -4px 8px rgba(0,0,0,0.2), inset 2px 2px 6px rgba(255,255,255,0.12)',
              }}>
              {/* Claws */}
              <div className="absolute -bottom-1 left-2 flex gap-1">
                {[0,1,2].map(i=>(<div key={i} className="w-2 h-3 rounded-t-full bg-white/80" style={{boxShadow:'0 1px 2px rgba(0,0,0,0.15)'}} />))}
              </div>
            </div>
          </motion.div>

          <motion.div className="absolute z-10"
            style={{ right:-2, top:110, width:34, height:30, transformOrigin:'left center' }}
            animate={phase==='eat'?{rotate:25}:{rotate:[0,5,0]}}
            transition={phase==='eat'?{duration:.1}:{duration:2,repeat:Infinity,ease:'easeInOut',delay:.5}}
          >
            <div className="w-full h-full rounded-full"
              style={{
                background:'linear-gradient(135deg, #0d9488, #0f766e)',
                boxShadow:'inset -3px -4px 8px rgba(0,0,0,0.2), inset 2px 2px 6px rgba(255,255,255,0.12)',
              }}>
              <div className="absolute -bottom-1 right-2 flex gap-1">
                {[0,1,2].map(i=>(<div key={i} className="w-2 h-3 rounded-t-full bg-white/80" style={{boxShadow:'0 1px 2px rgba(0,0,0,0.15)'}} />))}
              </div>
            </div>
          </motion.div>

          {/* ── FEET — large round pads ── */}
          <div className="absolute z-10" style={{ left:22, bottom:2, width:48, height:30 }}>
            <div className="w-full h-full rounded-full"
              style={{
                background:'linear-gradient(180deg, #0f766e 0%, #115e59 60%, #134e4a 100%)',
                boxShadow:'inset -4px -5px 10px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.1), 0 3px 8px rgba(0,0,0,0.15)',
                borderRadius:'48% 52% 55% 45% / 58% 58% 42% 42%',
              }}>
              {/* Claws on feet */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2">
                {[0,1,2].map(i=>(<div key={i} className="w-2.5 h-3.5 rounded-t-full bg-white/85" style={{transform:`rotate(${(i-1)*8}deg)`,boxShadow:'0 1px 2px rgba(0,0,0,0.15)'}} />))}
              </div>
            </div>
          </div>
          <div className="absolute z-10" style={{ right:22, bottom:2, width:48, height:30 }}>
            <div className="w-full h-full rounded-full"
              style={{
                background:'linear-gradient(180deg, #0f766e 0%, #115e59 60%, #134e4a 100%)',
                boxShadow:'inset -4px -5px 10px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.1), 0 3px 8px rgba(0,0,0,0.15)',
                borderRadius:'52% 48% 45% 55% / 58% 58% 42% 42%',
              }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2">
                {[0,1,2].map(i=>(<div key={i} className="w-2.5 h-3.5 rounded-t-full bg-white/85" style={{transform:`rotate(${(i-1)*8}deg)`,boxShadow:'0 1px 2px rgba(0,0,0,0.15)'}} />))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ENERGY BALL ── */}
        <AnimatePresence>
          {(phase==='launch'||phase==='fly')&&(
            <motion.div className="absolute pointer-events-none z-30"
              style={{left:'5%',top:'25%'}}
              initial={{opacity:0,scale:.15,x:-40,y:50}}
              animate={{opacity:[0,1,1,0],scale:[.15,1.1,.55,.08],x:[0,18,52,78],y:[0,-48,-22,8]}}
              exit={{opacity:0}}
              transition={{duration:.6,ease:'easeInOut'}}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full"
                  style={{background:'radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)',boxShadow:'0 0 25px rgba(251,191,36,0.5),0 0 50px rgba(251,191,36,0.25)'}} />
                <motion.div className="absolute -inset-3 rounded-full border-2 border-yellow-300/35"
                  animate={{scale:[1,1.7,1],opacity:[.35,0,.35]}} transition={{duration:.5,repeat:Infinity}} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BELCH BUBBLES ── */}
        <AnimatePresence>
          {bubbles.map(b=>(
            <motion.div key={b.id} className="absolute pointer-events-none rounded-full"
              style={{width:b.s,height:b.s,left:'50%',top:'28%',background:'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(20,184,166,0.15))',border:'1px solid rgba(153,246,228,0.25)'}}
              initial={{opacity:0,x:0,y:0,scale:0}}
              animate={{opacity:[0,.7,0],x:b.x,y:b.y,scale:[0,1.15,0]}}
              exit={{opacity:0}}
              transition={{duration:1.1,delay:b.d,ease:'easeOut'}}
            />
          ))}
        </AnimatePresence>

        {/* ── IDLE SPARKLES ── */}
        {phase==='idle'&&(<>
          <motion.div className="absolute pointer-events-none" style={{left:5,top:5}}
            animate={{y:[0,-6,0],opacity:[0,.7,0],scale:[.3,1,.3]}} transition={{duration:3.2,repeat:Infinity}}>✨</motion.div>
          <motion.div className="absolute pointer-events-none" style={{right:8,top:35}}
            animate={{y:[0,-5,0],opacity:[0,.5,0],scale:[.2,.7,.2]}} transition={{duration:2.7,repeat:Infinity,delay:1.5}}>💤</motion.div>
        </>)}
      </div>

      {/* ── NAME ── */}
      <p className="text-sm font-bold text-teal-600 tracking-wide">{monsterName}</p>
      <p className="text-[10px] text-slate-400 mb-4">把坏情绪喂给我，我帮你吃掉它！🫧</p>

      {/* ── INPUT ── */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl"
          style={{background:'rgba(20,184,166,0.05)',border:'2px solid rgba(20,184,166,0.18)'}}>
          <input ref={inputRef} type="text" value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();doFeed();}}}
            placeholder="今天有什么不开心？喂给卡比兽吧！"
            disabled={phase!=='idle'||isFeeding}
            className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-teal-400/50 disabled:opacity-40 text-slate-700"
            maxLength={200} />
          <motion.button
            whileHover={input.trim()&&phase==='idle'?{scale:1.04}:{}}
            whileTap={input.trim()&&phase==='idle'?{scale:.92}:{}}
            onClick={doFeed}
            disabled={!input.trim()||phase!=='idle'||isFeeding}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1.5"
            style={{
              background:input.trim()&&phase==='idle'?'linear-gradient(135deg, #0d9488, #06b6d4)':'linear-gradient(135deg, #99f6e4, #a5f3fc)',
              boxShadow:input.trim()&&phase==='idle'?'0 4px 16px rgba(13,148,136,0.35)':'none',
            }}>
            <Send className="h-3.5 w-3.5" />投喂
          </motion.button>
        </div>
      </div>

      {/* ── QUIP ── */}
      <AnimatePresence>
        {showQuip&&(
          <motion.div className="px-5 py-3.5 rounded-2xl mx-auto max-w-xs relative"
            style={{background:'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(6,182,212,0.08))',border:'1.5px solid rgba(13,148,136,0.2)'}}
            initial={{opacity:0,y:18,scale:.88}}
            animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:-10}}
            transition={{type:'spring',stiffness:280,damping:22}}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm"
              style={{background:'rgba(13,148,136,0.12)',border:'1px solid rgba(13,148,136,0.15)',borderRight:'none',borderBottom:'none'}} />
            <motion.span className="block text-center text-xl mb-1"
              animate={{rotate:[0,-8,8,-4,0]}} transition={{duration:.5,delay:.2}}>😪</motion.span>
            <p className="text-sm font-medium leading-relaxed text-center text-teal-600">{quip}</p>
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
    const labels: Record<number, string> = { 0.5:'非常糟糕',1:'很不好',1.5:'不太好',2:'有点低落',2.5:'一般般',3:'普普通通',3.5:'还不错',4:'挺好的',4.5:'很开心',5:'超级棒' };
    await createTodo({ title:`😊 今日心情：${labels[Math.round(moodRating*2)/2]||moodRating+'星'}`, description:moodNote||undefined, category:ModuleCategory.PSYCHOLOGY, priority:Priority.NORMAL, dueDate:new Date().toISOString().split('T')[0]!, isRecurring:false });
    toast.success('心情记录已保存 📝');
    setIsSubmitting(false);
  }, [moodRating, moodNote, logMood, createTodo]);

  const handleFeed = useCallback(async (text: string) => {
    setIsFeeding(true);
    await feedEmotion(text);
    toast.success('坏情绪已被吃掉！🫧', { duration: 2000 });
    setIsFeeding(false);
  }, [feedEmotion]);

  const ml = (r:number)=>{if(r>=4.5)return{text:'超级开心！',icon:'🥳',color:'#22c55e'};if(r>=3.5)return{text:'心情不错',icon:'😊',color:'#4ade80'};if(r>=2.5)return{text:'平平淡淡',icon:'😐',color:'#f59e0b'};if(r>=1.5)return{text:'有点低落',icon:'😟',color:'#f97316'};if(r>0)return{text:'需要抱抱',icon:'😢',color:'#ef4444'};return{text:'还没打分',icon:'🤔',color:'#94a3b8'};};
  const mi = ml(moodRating);

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-teal-500"><Brain className="h-7 w-7" />心理空间</h1>
        <p className="text-sm mt-1 text-slate-400">关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div>
          <div className="module-card h-full" style={{'--module-accent':'#0d9488'} as React.CSSProperties}>
            <h2 className="section-title" style={{'--module-accent':'#0d9488'} as React.CSSProperties}><Brain className="h-5 w-5 text-teal-500" />每日心理学知识</h2>
            <div className="p-4 rounded-xl" style={{background:'rgba(13,148,136,0.05)',border:'1px solid rgba(13,148,136,0.12)'}}>
              <div className="flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 flex-shrink-0 text-teal-400" /><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-600">今日心理知识</span></div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{psychTip}</p>
            </div>
            {recentMoods.length>0&&(<div className="mt-4 pt-4 border-t border-slate-200"><p className="text-xs font-medium mb-2 text-slate-400">最近心情趋势</p><div className="flex items-end gap-1 h-20">{recentMoods.map((m,i)=>{const h=(m.rating/5)*80;return(<div key={m.date} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full rounded-t-sm" style={{height:`${Math.max(4,h)}px`,background:m.rating>=3.5?'#22c55e':m.rating>=2.5?'#f59e0b':'#ef4444',opacity:.7+(i/recentMoods.length)*.3}} /><span className="text-[8px] text-slate-400">{m.date.slice(5)}</span></div>);})}</div></div>)}
          </div>
        </div>

        {/* MIDDLE */}
        <div>
          <div className="module-card h-full" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}>
            <h2 className="section-title" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}><Smile className="h-5 w-5 text-amber-500" />今日心情</h2>
            <div className="text-center py-3">
              <div className="text-5xl mb-2">{mi.icon}</div>
              <p className="text-lg font-bold mb-0.5" style={{color:mi.color}}>{mi.text}</p>
              <p className="text-2xl font-bold mb-4 text-amber-500">{moodRating>0?`${moodRating} / 5`:'—'}</p>
              <StarRating rating={moodRating} onChange={setMoodRating} />
              <p className="text-[10px] mt-1 mb-3 text-slate-400">左半=0.5星 · 右半=1星</p>
              <textarea value={moodNote} onChange={e=>setMoodNote(e.target.value)} placeholder="今天发生了什么？记录心情日记..." className="input-field min-h-[80px] text-sm mb-3" />
              <button onClick={handleSaveMood} disabled={isSubmitting||moodRating===0} className="btn-primary w-full" style={{'--color-accent':'#f59e0b','--color-accent-hover':'#d97706'} as React.CSSProperties}>{todayMood?'更新心情':'保存心情'}</button>
              {todayMood&&<p className="text-[10px] mt-2 text-emerald-500">✓ 已记录 · 同步到待办</p>}
            </div>
          </div>
        </div>

        {/* RIGHT — Snorlax Monster */}
        <div>
          <div className="module-card h-full relative overflow-visible" style={{'--module-accent':'#0d9488'} as React.CSSProperties}>
            <h2 className="section-title" style={{'--module-accent':'#0d9488'} as React.CSSProperties}><Heart className="h-5 w-5 text-teal-500" />情绪暴食怪</h2>
            <SnorlaxMonster monsterName={monsterName} onFeed={handleFeed} isFeeding={isFeeding} />
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-medium mb-2 text-center text-slate-400">🫧 今天已经吃掉了 {todayEmotions.length} 个坏情绪</p>
              {todayEmotions.length>0&&(<div className="max-h-20 overflow-y-auto scrollbar-hide space-y-1">{todayEmotions.map((e,i)=>(<motion.div key={e.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{background:'rgba(13,148,136,0.04)'}} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*.05}}><Zap className="h-3 w-3 flex-shrink-0 text-teal-400" /><span className="truncate text-slate-500">{e.emotion}</span><span className="flex-shrink-0 text-[9px] text-slate-400">{e.createdAt?.slice(11,16)||''}</span></motion.div>))}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
