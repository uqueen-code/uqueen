'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Star, Sparkles, Smile, Heart, Send, Zap, Trash2 } from 'lucide-react';
import { usePsychology } from '@/hooks/usePsychology';
import { useTodos } from '@/hooks/useTodos';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory, Priority } from '@/types/enums';
import { motion, AnimatePresence } from 'framer-motion';
import { getDatabase } from '@/lib/db/indexeddb';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getTodayString } from '@/lib/utils/date';
import toast from 'react-hot-toast';

const QUIPS = [
  '嗝！这坏情绪真难吃，下次给我带点开心的！🍬','嗷呜~ 吞下去了！味道像烧焦的西兰花，但我帮你消化掉啦！🥦','嗝~ 这烦恼有点酸，不过没关系，我最爱吃酸的了！🍋','唔…这块"不开心"有点硬，但我牙口好！嘎嘣脆！🦷','嘿嘿，吃掉了！你的不开心现在在我肚子里变成了彩虹屁~ 🌈','嗝！吃饱了吃饱了，这顿情绪大餐够我消化一整天啦~ 😋','咔嚓咔嚓…嗯？这烦恼是过期了吗？没事，我百毒不侵！🛡️','嗷~ 这块情绪好像有点甜？原来不开心里面也藏着一点点好事呢！🍯','嗝~~~ 好大一个嗝！你的坏情绪变成气体飞走啦！💨','吧唧吧唧…嗯这口有点咸，是你偷偷哭了嘛？没关系我帮你吃掉！🧂','叮！你的不开心已被本卡比兽消化系统处理完毕！✅','Zzz…啊不，我没睡着！我只是在用心消化你的坏情绪！😴','嗝！消化完毕！你的心情现在应该像棉花糖一样轻盈啦~ ☁️','嗷嗷！这情绪嚼起来像泡泡糖，还能吹个大泡泡！啵~ 🫧',
];

function StarRating({rating,onChange}:{rating:number;onChange:(r:number)=>void}){
  const [hovered,setHovered]=useState<number|null>(null);
  return(<div className="flex items-center gap-0.5 justify-center"><svg width="0" height="0"><defs><linearGradient id="hG6"><stop offset="50%" stopColor="#f59e0b"/><stop offset="50%" stopColor="transparent"/></linearGradient></defs></svg>{[1,2,3,4,5].map(i=>{const f=(hovered!==null)?hovered>=i:rating>=i;const h=(hovered!==null)?(hovered===i-0.5):(rating>=i-0.5&&rating<i);return(<div key={i} className="relative cursor-pointer" style={{width:44,height:44}}><div className="absolute inset-0 w-1/2 z-10" onMouseEnter={()=>setHovered(i-0.5)} onMouseLeave={()=>setHovered(null)} onClick={()=>onChange(i-0.5)}/><div className="absolute inset-0 left-1/2 w-1/2 z-10" onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} onClick={()=>onChange(i)}/><Star className="absolute inset-0 h-11 w-11 transition-all duration-150" style={{fill:f?'#f59e0b':h?'url(#hG6)':'transparent',color:f||h?'#f59e0b':'#d1d5db',strokeWidth:1.5}}/></div>);})}</div>);
}

function SnorlaxMonster({monsterName,onFeed,isFeeding}:{monsterName:string;onFeed:(text:string)=>Promise<void>;isFeeding:boolean}){
  const [input,setInput]=useState('');const [phase,setPhase]=useState<'idle'|'launch'|'fly'|'eat'|'belch'|'done'>('idle');const [quip,setQuip]=useState('');const [showQuip,setShowQuip]=useState(false);const [bubbles,setBubbles]=useState<{id:number;x:number;y:number;s:number;d:number}[]>([]);const inputRef=useRef<HTMLInputElement>(null);const mouthOpen=phase==='eat'||phase==='belch';
  const doFeed=useCallback(async()=>{const text=input.trim();if(!text||phase!=='idle'||isFeeding)return;setInput('');setShowQuip(false);setPhase('launch');setTimeout(()=>setPhase('fly'),120);setTimeout(()=>setPhase('eat'),600);setTimeout(()=>{setPhase('belch');setBubbles(Array.from({length:10},(_,i)=>({id:i,x:(Math.random()-.5)*140,y:-(Math.random()*90+20),s:5+Math.random()*18,d:Math.random()*.4})));setQuip(QUIPS[Math.floor(Math.random()*QUIPS.length)]!);setShowQuip(true);onFeed(text);},900);setTimeout(()=>{setPhase('done');setTimeout(()=>{setPhase('idle');setBubbles([]);},500);setTimeout(()=>setShowQuip(false),5000);inputRef.current?.focus();},2200);},[input,phase,isFeeding,onFeed]);

  return(<div className="text-center relative">
    <div className="relative inline-block mb-6 select-none" style={{width:220,height:260}}>
      <motion.div className="absolute inset-0"
        animate={phase==='belch'?{scale:[1,1.13,.9,1.06,.95,1],rotate:[0,-3,3,-2,1,0]}:phase==='eat'?{scale:[1,1.04],rotate:[0,-1]}:{y:[0,-4,0],rotate:[0,-.3,0,.3,0]}}
        transition={phase==='belch'?{duration:.7,ease:'easeOut'}:phase==='eat'?{duration:.1}:{duration:3.5,repeat:Infinity,ease:'easeInOut'}}>
        {/* Full Snorlax as a polished SVG */}
        <svg viewBox="0 0 220 260" className="w-full h-full">
          <defs>
            <radialGradient id="bodyG" cx="45%" cy="35%" r="55%"><stop offset="0%" stopColor="#14b8a6"/><stop offset="35%" stopColor="#0d9488"/><stop offset="70%" stopColor="#0f766e"/><stop offset="100%" stopColor="#115e59"/></radialGradient>
            <radialGradient id="faceG" cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#FFFBEB"/><stop offset="60%" stopColor="#FEF3C7"/><stop offset="100%" stopColor="#FDE68A"/></radialGradient>
            <radialGradient id="bellyG" cx="50%" cy="45%" r="55%"><stop offset="0%" stopColor="#FFFBEB"/><stop offset="50%" stopColor="#FEF3C7"/><stop offset="100%" stopColor="#FDE68A"/></radialGradient>
            <filter id="soft3D" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dx="0" dy="5"/><feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {/* Ears */}
          <path d="M 62 52 L 48 16 Q 46 6 56 8 L 68 18 Q 74 32 72 46 Z" fill="#0f766e" stroke="#115e59" strokeWidth="1"/>
          <path d="M 64 46 L 54 22 Q 53 16 58 18 L 66 26 Q 68 36 68 44 Z" fill="#5eead4" opacity="0.35"/>
          <path d="M 158 52 L 172 16 Q 174 6 164 8 L 152 18 Q 146 32 148 46 Z" fill="#0f766e" stroke="#115e59" strokeWidth="1"/>
          <path d="M 156 46 L 166 22 Q 167 16 162 18 L 154 26 Q 152 36 152 44 Z" fill="#5eead4" opacity="0.35"/>
          {/* Body */}
          <ellipse cx="110" cy="150" rx="82" ry="78" fill="url(#bodyG)" filter="url(#soft3D)"/>
          {/* Body highlight */}
          <ellipse cx="88" cy="120" rx="40" ry="35" fill="white" opacity="0.08"/>
          {/* Belly */}
          <ellipse cx="110" cy="175" rx="62" ry="50" fill="url(#bellyG)" opacity="0.9"/>
          {/* Belly patterns */}
          <ellipse cx="90" cy="168" rx="18" ry="12" fill="none" stroke="rgba(217,119,6,0.12)" strokeWidth="1.5"/>
          <ellipse cx="130" cy="168" rx="18" ry="12" fill="none" stroke="rgba(217,119,6,0.12)" strokeWidth="1.5"/>
          <path d="M 95 185 Q 110 196 125 185" fill="none" stroke="rgba(217,119,6,0.1)" strokeWidth="1.5"/>
          {/* Face patch */}
          <ellipse cx="110" cy="105" rx="60" ry="42" fill="url(#faceG)" opacity="0.88"/>
          {/* Eyes — peaceful curved lines */}
          <path d="M 82 102 Q 92 94 102 102" fill="none" stroke="#134e4a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M 118 102 Q 128 94 138 102" fill="none" stroke="#134e4a" strokeWidth="3" strokeLinecap="round"/>
          {/* Mouth */}
          {!mouthOpen?<g><path d="M 96 118 L 104 130 L 110 120 L 116 130 L 124 118" fill="none" stroke="#134e4a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><polygon points="102,126 103.5,132 105,126" fill="white" stroke="#134e4a" strokeWidth="0.6"/><polygon points="115,126 116.5,132 118,126" fill="white" stroke="#134e4a" strokeWidth="0.6"/></g>:<g><ellipse cx="110" cy="124" rx="16" ry="11" fill="#134e4a"/><ellipse cx="110" cy="129" rx="8" ry="4.5" fill="#fb7185" opacity="0.65"/><polygon points="96,118 98,124 100,118" fill="white"/><polygon points="120,118 122,124 124,118" fill="white"/></g>}
          {/* Arms */}
          <motion.g animate={phase==='eat'?{rotate:-20}:{rotate:[0,-4,0]}} transition={phase==='eat'?{duration:.1}:{duration:2,repeat:Infinity,ease:'easeInOut'}} style={{transformOrigin:'60px 146px'}}>
            <ellipse cx="42" cy="148" rx="22" ry="18" fill="#0d9488"/><ellipse cx="42" cy="144" rx="16" ry="12" fill="#0f766e"/><circle cx="30" cy="160" r="3" fill="white" opacity="0.75"/><circle cx="36" cy="164" r="3" fill="white" opacity="0.75"/><circle cx="42" cy="162" r="3" fill="white" opacity="0.75"/>
          </motion.g>
          <motion.g animate={phase==='eat'?{rotate:20}:{rotate:[0,4,0]}} transition={phase==='eat'?{duration:.1}:{duration:2,repeat:Infinity,ease:'easeInOut',delay:.5}} style={{transformOrigin:'160px 146px'}}>
            <ellipse cx="178" cy="148" rx="22" ry="18" fill="#0d9488"/><ellipse cx="178" cy="144" rx="16" ry="12" fill="#0f766e"/><circle cx="178" cy="160" r="3" fill="white" opacity="0.75"/><circle cx="184" cy="164" r="3" fill="white" opacity="0.75"/><circle cx="190" cy="162" r="3" fill="white" opacity="0.75"/>
          </motion.g>
          {/* Feet */}
          <ellipse cx="78" cy="222" rx="34" ry="20" fill="#115e59"/><ellipse cx="78" cy="218" rx="28" ry="14" fill="#0f766e"/><circle cx="58" cy="212" r="3" fill="white" opacity="0.7"/><circle cx="66" cy="208" r="3" fill="white" opacity="0.7"/><circle cx="74" cy="210" r="3" fill="white" opacity="0.7"/>
          <ellipse cx="142" cy="222" rx="34" ry="20" fill="#115e59"/><ellipse cx="142" cy="218" rx="28" ry="14" fill="#0f766e"/><circle cx="146" cy="210" r="3" fill="white" opacity="0.7"/><circle cx="154" cy="208" r="3" fill="white" opacity="0.7"/><circle cx="162" cy="212" r="3" fill="white" opacity="0.7"/>
        </svg>
      </motion.div>
      {/* Energy ball */}
      <AnimatePresence>{(phase==='launch'||phase==='fly')&&<motion.div className="absolute pointer-events-none z-30" style={{left:'5%',top:'25%'}} initial={{opacity:0,scale:.15,x:-40,y:50}} animate={{opacity:[0,1,1,0],scale:[.15,1.1,.55,.08],x:[0,18,52,78],y:[0,-48,-22,8]}} exit={{opacity:0}} transition={{duration:.6,ease:'easeInOut'}}><div className="relative"><div className="w-11 h-11 rounded-full" style={{background:'radial-gradient(circle at 35% 35%, #fef9c3, #fde68a, #fbbf24)',boxShadow:'0 0 25px rgba(251,191,36,0.5)'}}/><motion.div className="absolute -inset-3 rounded-full border-2 border-yellow-300/35" animate={{scale:[1,1.7,1],opacity:[.35,0,.35]}} transition={{duration:.5,repeat:Infinity}}/></div></motion.div>}</AnimatePresence>
      {/* Belch bubbles */}
      <AnimatePresence>{bubbles.map(b=><motion.div key={b.id} className="absolute pointer-events-none rounded-full" style={{width:b.s,height:b.s,left:'50%',top:'28%',background:'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(20,184,166,0.15))',border:'1px solid rgba(153,246,228,0.25)'}} initial={{opacity:0,x:0,y:0,scale:0}} animate={{opacity:[0,.7,0],x:b.x,y:b.y,scale:[0,1.15,0]}} exit={{opacity:0}} transition={{duration:1.1,delay:b.d,ease:'easeOut'}}/>)}</AnimatePresence>
      {phase==='idle'&&<><motion.div className="absolute pointer-events-none" style={{left:5,top:5}} animate={{y:[0,-6,0],opacity:[0,.7,0],scale:[.3,1,.3]}} transition={{duration:3.2,repeat:Infinity}}>✨</motion.div><motion.div className="absolute pointer-events-none" style={{right:8,top:35}} animate={{y:[0,-5,0],opacity:[0,.5,0],scale:[.2,.7,.2]}} transition={{duration:2.7,repeat:Infinity,delay:1.5}}>💤</motion.div></>}
    </div>
    <p className="text-sm font-bold text-teal-600 tracking-wide">{monsterName}</p><p className="text-[10px] text-slate-400 mb-4">把坏情绪喂给我，我帮你吃掉它！🫧</p>
    <div className="relative mb-4"><div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{background:'rgba(20,184,166,0.05)',border:'2px solid rgba(20,184,166,0.18)'}}><input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();doFeed();}}} placeholder="今天有什么不开心？喂给卡比兽吧！" disabled={phase!=='idle'||isFeeding} className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-teal-400/50 disabled:opacity-40 text-slate-700" maxLength={200}/><motion.button whileHover={input.trim()&&phase==='idle'?{scale:1.04}:{}} whileTap={input.trim()&&phase==='idle'?{scale:.92}:{}} onClick={doFeed} disabled={!input.trim()||phase!=='idle'||isFeeding} className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1.5" style={{background:input.trim()&&phase==='idle'?'linear-gradient(135deg, #0d9488, #06b6d4)':'linear-gradient(135deg, #99f6e4, #a5f3fc)',boxShadow:input.trim()&&phase==='idle'?'0 4px 16px rgba(13,148,136,0.35)':'none'}}><Send className="h-3.5 w-3.5"/>投喂</motion.button></div></div>
    <AnimatePresence>{showQuip&&<motion.div className="px-5 py-3.5 rounded-2xl mx-auto max-w-xs relative" style={{background:'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(6,182,212,0.08))',border:'1.5px solid rgba(13,148,136,0.2)'}} initial={{opacity:0,y:18,scale:.88}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-10}} transition={{type:'spring',stiffness:280,damping:22}}><div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm" style={{background:'rgba(13,148,136,0.12)',border:'1px solid rgba(13,148,136,0.15)',borderRight:'none',borderBottom:'none'}}/><motion.span className="block text-center text-xl mb-1" animate={{rotate:[0,-8,8,-4,0]}} transition={{duration:.5,delay:.2}}>😪</motion.span><p className="text-sm font-medium leading-relaxed text-center text-teal-600">{quip}</p></motion.div>}</AnimatePresence>
  </div>);
}

export default function PsychologyPage(){
  const {todayMood,todayEmotions,recentMoods,psychTip,monsterName,isLoading,logMood,feedEmotion}=usePsychology();
  const {createTodo}=useTodos();
  const user=useAuthStore(s=>s.user);const userId=user?.id??'local-user';const today=getTodayString();
  const addToSyncQueue=useOfflineStore(s=>s.addToSyncQueue);
  const [moodRating,setMoodRating]=useState(todayMood?.rating??0);const [moodNote,setMoodNote]=useState('');const [isSubmitting,setIsSubmitting]=useState(false);const [isFeeding,setIsFeeding]=useState(false);
  const [emotionList,setEmotionList]=useState(todayEmotions);
  useEffect(()=>{if(todayMood){setMoodRating(todayMood.rating);setMoodNote(todayMood.note||'');}setEmotionList(todayEmotions);},[todayMood,todayEmotions]);

  const handleSaveMood=useCallback(async()=>{if(moodRating===0){toast.error('请先打分');return;}setIsSubmitting(true);await logMood(moodRating,moodNote||undefined);const labels:Record<number,string>={0.5:'非常糟糕',1:'很不好',1.5:'不太好',2:'有点低落',2.5:'一般般',3:'普普通通',3.5:'还不错',4:'挺好的',4.5:'很开心',5:'超级棒'};await createTodo({title:`😊 今日心情：${labels[Math.round(moodRating*2)/2]||moodRating+'星'}`,description:moodNote||undefined,category:ModuleCategory.PSYCHOLOGY,priority:Priority.NORMAL,dueDate:new Date().toISOString().split('T')[0]!,isRecurring:false});toast.success('心情记录已保存 📝');setIsSubmitting(false);},[moodRating,moodNote,logMood,createTodo]);

  const handleFeed=useCallback(async(text:string)=>{setIsFeeding(true);await feedEmotion(text);toast.success('坏情绪已被吃掉！🫧',{duration:2000});setIsFeeding(false);},[feedEmotion]);

  const handleClearAll=useCallback(async()=>{
    if(todayEmotions.length===0){toast.error('今天还没有投喂过情绪哦~');return;}
    const confirmed=window.confirm('确定要一键清空今天所有的不开心记录吗？清空后无法恢复哦！');
    if(!confirmed)return;
    const db=getDatabase();
    for(const e of todayEmotions){await db.emotionEntries.delete(e.id);addToSyncQueue({table:'emotion_entries',operation:'delete',recordId:e.id,data:{}});}
    setEmotionList([]);
    toast.success('所有不开心已被一键格式化！页面纯净如新 ✨',{duration:2500});
  },[todayEmotions,addToSyncQueue]);

  const ml=(r:number)=>{if(r>=4.5)return{text:'超级开心！',icon:'🥳',color:'#22c55e'};if(r>=3.5)return{text:'心情不错',icon:'😊',color:'#4ade80'};if(r>=2.5)return{text:'平平淡淡',icon:'😐',color:'#f59e0b'};if(r>=1.5)return{text:'有点低落',icon:'😟',color:'#f97316'};if(r>0)return{text:'需要抱抱',icon:'😢',color:'#ef4444'};return{text:'还没打分',icon:'🤔',color:'#94a3b8'};};
  const mi=ml(moodRating);
  if(isLoading)return<div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..."/></div>;

  return(<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
    <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2 text-teal-500"><Brain className="h-7 w-7"/>心理空间</h1><p className="text-sm mt-1 text-slate-400">关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div><div className="module-card h-full" style={{'--module-accent':'#0d9488'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#0d9488'} as React.CSSProperties}><Brain className="h-5 w-5 text-teal-500"/>每日心理学知识</h2><div className="p-4 rounded-xl" style={{background:'rgba(13,148,136,0.05)',border:'1px solid rgba(13,148,136,0.12)'}}><div className="flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 flex-shrink-0 text-teal-400"/><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-600">今日心理知识</span></div><p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{psychTip}</p></div>{recentMoods.length>0&&<div className="mt-4 pt-4 border-t border-slate-200"><p className="text-xs font-medium mb-2 text-slate-400">最近心情趋势</p><div className="flex items-end gap-1 h-20">{recentMoods.map((m,i)=>{const h=(m.rating/5)*80;return(<div key={m.date} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full rounded-t-sm" style={{height:`${Math.max(4,h)}px`,background:m.rating>=3.5?'#22c55e':m.rating>=2.5?'#f59e0b':'#ef4444',opacity:.7+(i/recentMoods.length)*.3}}/><span className="text-[8px] text-slate-400">{m.date.slice(5)}</span></div>);})}</div></div>}</div></div>
      <div><div className="module-card h-full" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}><Smile className="h-5 w-5 text-amber-500"/>今日心情</h2><div className="text-center py-3"><div className="text-5xl mb-2">{mi.icon}</div><p className="text-lg font-bold mb-0.5" style={{color:mi.color}}>{mi.text}</p><p className="text-2xl font-bold mb-4 text-amber-500">{moodRating>0?`${moodRating} / 5`:'—'}</p><StarRating rating={moodRating} onChange={setMoodRating}/><p className="text-[10px] mt-1 mb-3 text-slate-400">左半=0.5星 · 右半=1星</p><textarea value={moodNote} onChange={e=>setMoodNote(e.target.value)} placeholder="今天发生了什么？记录心情日记..." className="input-field min-h-[80px] text-sm mb-3"/><button onClick={handleSaveMood} disabled={isSubmitting||moodRating===0} className="btn-primary w-full" style={{'--color-accent':'#f59e0b','--color-accent-hover':'#d97706'} as React.CSSProperties}>{todayMood?'更新心情':'保存心情'}</button>{todayMood&&<p className="text-[10px] mt-2 text-emerald-500">✓ 已记录 · 同步到待办</p>}</div></div></div>
      <div><div className="module-card h-full relative overflow-visible" style={{'--module-accent':'#0d9488'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#0d9488'} as React.CSSProperties}><Heart className="h-5 w-5 text-teal-500"/>情绪暴食怪</h2><SnorlaxMonster monsterName={monsterName} onFeed={handleFeed} isFeeding={isFeeding}/>
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2"><p className="text-[10px] font-medium text-slate-400">🫧 今天已经吃掉了 {emotionList.length} 个坏情绪</p>
            {emotionList.length>0&&<motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}} onClick={handleClearAll} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all" style={{background:'rgba(239,68,68,0.06)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.15)'}}><Trash2 className="h-3 w-3"/>一键清空</motion.button>}
          </div>
          {emotionList.length>0&&<div className="max-h-20 overflow-y-auto scrollbar-hide space-y-1">{emotionList.map((e,i)=><motion.div key={e.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{background:'rgba(13,148,136,0.04)'}} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*.05}}><Zap className="h-3 w-3 flex-shrink-0 text-teal-400"/><span className="truncate text-slate-500">{e.emotion}</span><span className="flex-shrink-0 text-[9px] text-slate-400">{e.createdAt?.slice(11,16)||''}</span></motion.div>)}</div>}
        </div>
      </div></div>
    </div>
  </div>);
}
