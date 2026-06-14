'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Star, Sparkles, Smile, Heart, Send, Zap, Trash2 } from 'lucide-react';
import { usePsychology } from '@/hooks/usePsychology';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { getDatabase } from '@/lib/db/indexeddb';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import toast from 'react-hot-toast';

const QUIPS_ZH=['嗝！这坏情绪真难吃，下次给我带点开心的！🍬','嗷呜~ 吞下去了！味道像烧焦的西兰花，但我帮你消化掉啦！🥦','嗝~ 这烦恼有点酸，不过没关系，我最爱吃酸的了！🍋','唔…这块"不开心"有点硬，但我牙口好！嘎嘣脆！🦷','嘿嘿，吃掉了！你的不开心现在在我肚子里变成了彩虹屁~ 🌈','嗝！吃饱了吃饱了，这顿情绪大餐够我消化一整天啦~ 😋','咔嚓咔嚓…嗯？这烦恼是过期了吗？没事，我百毒不侵！🛡️','嗷~ 这块情绪好像有点甜？原来不开心里面也藏着一点点好事呢！🍯','嗝~~~ 好大一个嗝！你的坏情绪变成气体飞走啦！💨','吧唧吧唧…嗯这口有点咸，是你偷偷哭了嘛？没关系我帮你吃掉！🧂','叮！你的不开心已被本卡比兽消化系统处理完毕！✅','Zzz…啊不，我没睡着！我只是在用心消化你的坏情绪！😴'];

function StarRating({rating,onChange}:{rating:number;onChange:(r:number)=>void}){const[h,setH]=useState<number|null>(null);return(<div className="flex items-center gap-0.5 justify-center"><svg width="0" height="0"><defs><linearGradient id="hG9"><stop offset="50%" stopColor="#f59e0b"/><stop offset="50%" stopColor="transparent"/></linearGradient></defs></svg>{[1,2,3,4,5].map(i=>{const f=(h!==null)?h>=i:rating>=i;const ha=(h!==null)?(h===i-0.5):(rating>=i-0.5&&rating<i);return(<div key={i} className="relative cursor-pointer" style={{width:44,height:44}}><div className="absolute inset-0 w-1/2 z-10" onMouseEnter={()=>setH(i-0.5)} onMouseLeave={()=>setH(null)} onClick={()=>onChange(i-0.5)}/><div className="absolute inset-0 left-1/2 w-1/2 z-10" onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(null)} onClick={()=>onChange(i)}/><Star className="absolute inset-0 h-11 w-11 transition-all duration-150" style={{fill:f?'#f59e0b':ha?'url(#hG9)':'transparent',color:f||ha?'#f59e0b':'#d1d5db',strokeWidth:1.5}}/></div>);})}</div>);}

/**
 * 卡比兽组件 — 修复关键：
 * 1. 所有setTimeout使用ref追踪，unmount时全部清理
 * 2. 不再依赖useTranslation/i18n，文案硬编码中文
 */
function KabishouMonster({monsterName,onFeed,isFeeding}:{monsterName:string;onFeed:(text:string)=>Promise<void>;isFeeding:boolean}){
  const[input,setInput]=useState('');
  const[phase,setPhase]=useState<'idle'|'launch'|'fly'|'eat'|'belch'|'done'>('idle');
  const[quip,setQuip]=useState('');
  const[showQuip,setShowQuip]=useState(false);
  const[bubbles,setBubbles]=useState<{id:number;x:number;y:number;s:number;d:number}[]>([]);
  const ir=useRef<HTMLInputElement>(null);

  // 🔧 关键修复：追踪所有setTimeout，unmount时清理
  const timersRef=useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedRef=useRef(true);

  useEffect(()=>{
    mountedRef.current=true;
    return ()=>{
      mountedRef.current=false;
      // 清理所有未执行的定时器，防止对已卸载组件调用setState
      timersRef.current.forEach(t=>clearTimeout(t));
      timersRef.current=[];
    };
  },[]);

  const safeTimeout=useCallback((fn:()=>void,ms:number)=>{
    const id=setTimeout(()=>{
      if(mountedRef.current) fn();
    },ms);
    timersRef.current.push(id);
    return id;
  },[]);

  const Q=QUIPS_ZH;

  const doFeed=useCallback(async()=>{
    const txt=input.trim();
    if(!txt||phase!=='idle'||isFeeding)return;
    setInput('');
    setShowQuip(false);
    setPhase('launch');
    safeTimeout(()=>setPhase('fly'),120);
    safeTimeout(()=>setPhase('eat'),600);
    safeTimeout(()=>{
      setPhase('belch');
      setBubbles(Array.from({length:10},(_,i)=>({id:i,x:(Math.random()-.5)*140,y:-(Math.random()*90+20),s:5+Math.random()*18,d:Math.random()*.4})));
      setQuip(Q[Math.floor(Math.random()*Q.length)]!);
      setShowQuip(true);
      onFeed(txt);
    },900);
    safeTimeout(()=>{
      setPhase('done');
      safeTimeout(()=>{setPhase('idle');setBubbles([]);},500);
      safeTimeout(()=>setShowQuip(false),5000);
      ir.current?.focus();
    },2200);
  },[input,phase,isFeeding,onFeed,Q,safeTimeout]);

  return(<div className="text-center relative">
    <div className="relative inline-block mb-6 select-none" style={{width:200,height:200}}>
      {phase==='belch'?<motion.div className="absolute inset-0 flex items-center justify-center" animate={{scale:[1,1.15,0.92,1.07,0.96,1]}} transition={{duration:0.7,ease:'easeOut'}}><img src="/assets/kabishou.png" alt="卡比兽" className="w-full h-full object-contain" style={{filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.15))'}} draggable={false}/></motion.div>
      :phase==='eat'?<motion.div className="absolute inset-0 flex items-center justify-center" animate={{scale:[1,1.06]}} transition={{duration:0.1}}><img src="/assets/kabishou.png" alt="卡比兽" className="w-full h-full object-contain" style={{filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.15))'}} draggable={false}/></motion.div>
      :<div className="absolute inset-0 flex items-center justify-center animate-float-snorlax"><img src="/assets/kabishou.png" alt="卡比兽" className="w-full h-full object-contain" style={{filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.15))'}} draggable={false}/></div>}
      <AnimatePresence>{(phase==='launch'||phase==='fly')&&<motion.div className="absolute pointer-events-none z-30" style={{left:'5%',top:'20%'}} initial={{opacity:0,scale:.15,x:-30,y:40}} animate={{opacity:[0,1,1,0],scale:[.15,1.1,.55,.08],x:[0,15,45,70],y:[0,-40,-18,5]}} exit={{opacity:0}} transition={{duration:.6,ease:'easeInOut'}}><div className="relative"><div className="w-12 h-12 rounded-full" style={{background:'radial-gradient(circle at 35% 35%,#fef9c3,#fde68a,#fbbf24)',boxShadow:'0 0 30px rgba(251,191,36,0.5)'}}/><motion.div className="absolute -inset-3 rounded-full border-2 border-yellow-300/35" animate={{scale:[1,1.7,1],opacity:[.35,0,.35]}} transition={{duration:.5,repeat:Infinity}}/></div></motion.div>}</AnimatePresence>
      <AnimatePresence>{bubbles.map(b=><motion.div key={b.id} className="absolute pointer-events-none rounded-full" style={{width:b.s,height:b.s,left:'50%',top:'25%',background:'radial-gradient(circle at 30% 30%,rgba(255,255,255,0.8),rgba(20,184,166,0.15))',border:'1px solid rgba(153,246,228,0.25)'}} initial={{opacity:0,x:0,y:0,scale:0}} animate={{opacity:[0,.7,0],x:b.x,y:b.y,scale:[0,1.15,0]}} exit={{opacity:0}} transition={{duration:1.1,delay:b.d,ease:'easeOut'}}/>)}</AnimatePresence>
      {phase==='idle'&&<><motion.div className="absolute pointer-events-none" style={{left:0,top:0}} animate={{y:[0,-6,0],opacity:[0,.7,0],scale:[.3,1,.3]}} transition={{duration:3.2,repeat:Infinity}}>✨</motion.div><motion.div className="absolute pointer-events-none" style={{right:5,top:30}} animate={{y:[0,-5,0],opacity:[0,.5,0],scale:[.2,.7,.2]}} transition={{duration:2.7,repeat:Infinity,delay:1.5}}>💤</motion.div></>}
    </div>
    <p className="text-sm font-bold text-teal-700 tracking-wide">{monsterName}</p><p className="text-[10px] text-slate-400 mb-4">把坏情绪喂给我，我帮你吃掉它！</p>
    <div className="relative mb-4"><div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{background:'rgba(42,111,109,0.05)',border:'2px solid rgba(42,111,109,0.18)'}}><input ref={ir} type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();doFeed();}}} placeholder="今天有什么不开心？喂给卡比兽吧！" disabled={phase!=='idle'||isFeeding} className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-teal-500/40 disabled:opacity-40 text-slate-700" maxLength={200}/><motion.button whileHover={input.trim()&&phase==='idle'?{scale:1.04}:{}} whileTap={input.trim()&&phase==='idle'?{scale:.92}:{}} onClick={doFeed} disabled={!input.trim()||phase!=='idle'||isFeeding} className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-35 flex items-center gap-1.5" style={{background:input.trim()&&phase==='idle'?'linear-gradient(135deg,#2A6F6D,#3D8B89)':'linear-gradient(135deg,#99f6e4,#a5f3fc)',boxShadow:input.trim()&&phase==='idle'?'0 4px 16px rgba(42,111,109,0.35)':'none'}}><Send className="h-3.5 w-3.5"/>投喂</motion.button></div></div>
    <AnimatePresence>{showQuip&&<motion.div className="px-5 py-3.5 rounded-2xl mx-auto max-w-xs relative" style={{background:'linear-gradient(135deg,rgba(42,111,109,0.08),rgba(61,139,137,0.08))',border:'1.5px solid rgba(42,111,109,0.2)'}} initial={{opacity:0,y:18,scale:.88}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-10}} transition={{type:'spring',stiffness:280,damping:22}}><div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 rounded-sm" style={{background:'rgba(42,111,109,0.12)',border:'1px solid rgba(42,111,109,0.15)',borderRight:'none',borderBottom:'none'}}/><motion.span className="block text-center text-xl mb-1" animate={{rotate:[0,-8,8,-4,0]}} transition={{duration:.5,delay:.2}}>😪</motion.span><p className="text-sm font-medium leading-relaxed text-center text-teal-700">{quip}</p></motion.div>}</AnimatePresence>
  </div>);
}

/**
 * 心理空间页面 — 外科手术式修复：
 * 1. 移除useTranslation，全部硬编码中文 → 消除i18n异步fetch导致的hydration死锁
 * 2. 修复useEffect缺失依赖项导致的竞态条件
 * 3. 修复卡比兽组件setTimeout未清理导致的主线程锁死
 * 4. 移除保存心情时自动创建待办任务的逻辑
 */
export default function PsychologyPage(){
  const {todayMood,todayEmotions,recentMoods,psychTip,monsterName,isLoading,logMood,feedEmotion}=usePsychology();
  const user=useAuthStore(s=>s.user);const addSync=useOfflineStore(s=>s.addToSyncQueue);
  const[mr,setMr]=useState(todayMood?.rating??0);const[mn,setMn]=useState('');const[isSub,setIsSub]=useState(false);const[isFeed,setIsFeed]=useState(false);const[el,setEl]=useState(todayEmotions);

  // 🔧 修复：添加正确的依赖项，避免数据到达后不更新
  useEffect(()=>{if(todayMood){setMr(todayMood.rating);setMn(todayMood.note||'');}},[todayMood]);
  useEffect(()=>{setEl(todayEmotions);},[todayEmotions]);

  const handleSave=useCallback(async()=>{if(mr===0){toast.error('请先打分');return;}setIsSub(true);await logMood(mr,mn||undefined);toast.success('心情记录已保存');setIsSub(false);},[mr,mn,logMood]);
  const handleFeed=useCallback(async(text:string)=>{setIsFeed(true);await feedEmotion(text);toast.success('坏情绪已被吃掉！',{duration:2000});setIsFeed(false);},[feedEmotion]);
  const handleClear=useCallback(async()=>{if(todayEmotions.length===0){toast.error('今天还没有投喂过情绪哦~');return;}if(!window.confirm('确定要一键清空今天所有的不开心记录吗？'))return;const db=getDatabase();for(const e of todayEmotions){await db.emotionEntries.delete(e.id);addSync({table:'emotion_entries',operation:'delete',recordId:e.id,data:{}});}setEl([]);toast.success('所有不开心已被一键格式化！页面纯净如新',{duration:2500});},[todayEmotions,addSync]);

  const ml=(r:number)=>{if(r>=4.5)return{text:'🥳',color:'#22c55e'};if(r>=3.5)return{text:'😊',color:'#4ade80'};if(r>=2.5)return{text:'😐',color:'#f59e0b'};if(r>=1.5)return{text:'😟',color:'#f97316'};if(r>0)return{text:'😢',color:'#ef4444'};return{text:'🤔',color:'#94a3b8'};};const mi=ml(mr);
  if(isLoading)return<div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..."/></div>;
  return(<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
    <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2 text-teal-600"><Brain className="h-7 w-7"/>心理空间</h1><p className="text-sm mt-1 text-slate-400">关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div><div className="module-card h-full" style={{'--module-accent':'#2A6F6D'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#2A6F6D'} as React.CSSProperties}><Brain className="h-5 w-5 text-teal-600"/>每日心理学知识</h2><div className="p-4 rounded-xl" style={{background:'rgba(42,111,109,0.05)',border:'1px solid rgba(42,111,109,0.12)'}}><div className="flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 flex-shrink-0 text-teal-400"/><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-600">今日心理知识</span></div><p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{psychTip}</p></div>{recentMoods.length>0&&<div className="mt-4 pt-4 border-t border-slate-200"><p className="text-xs font-medium mb-2 text-slate-400">最近心情趋势</p><div className="flex items-end gap-1 h-20">{recentMoods.map((m,i)=>{const h=(m.rating/5)*80;return(<div key={m.date} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full rounded-t-sm" style={{height:`${Math.max(4,h)}px`,background:m.rating>=3.5?'#22c55e':m.rating>=2.5?'#f59e0b':'#ef4444',opacity:.7+(i/recentMoods.length)*.3}}/><span className="text-[8px] text-slate-400">{m.date.slice(5)}</span></div>);})}</div></div>}</div></div>
      <div><div className="module-card h-full" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}><Smile className="h-5 w-5 text-amber-500"/>今日心情</h2><div className="text-center py-3"><div className="text-5xl mb-2">{mi.text}</div><p className="text-2xl font-bold mb-4 text-amber-500">{mr>0?`${mr} / 5`:'—'}</p><StarRating rating={mr} onChange={setMr}/><p className="text-[10px] mt-1 mb-3 text-slate-400">左半=0.5星 · 右半=1星</p><textarea value={mn} onChange={e=>setMn(e.target.value)} placeholder="今天发生了什么？记录心情日记..." className="input-field min-h-[80px] text-sm mb-3"/><button onClick={handleSave} disabled={isSub||mr===0} className="btn-primary w-full" style={{'--color-accent':'#f59e0b','--color-accent-hover':'#d97706'} as React.CSSProperties}>{todayMood?'更新心情':'保存心情'}</button>{todayMood&&<p className="text-[10px] mt-2 text-emerald-500">✓ 已记录</p>}</div></div></div>
      <div><div className="module-card h-full relative overflow-visible" style={{'--module-accent':'#2A6F6D'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#2A6F6D'} as React.CSSProperties}><Heart className="h-5 w-5 text-teal-500"/>情绪暴食怪</h2><KabishouMonster monsterName={monsterName} onFeed={handleFeed} isFeeding={isFeed}/>
        <div className="mt-4 pt-3 border-t border-slate-200"><div className="flex items-center justify-between mb-2"><p className="text-[10px] font-medium text-slate-400">🫧 今天已经吃掉了 {el.length} 个坏情绪</p>{el.length>0&&<motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}} onClick={handleClear} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all" style={{background:'rgba(239,68,68,0.06)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.15)'}}><Trash2 className="h-3 w-3"/>一键清空</motion.button>}</div>{el.length>0&&<div className="max-h-20 overflow-y-auto scrollbar-hide space-y-1">{el.map((e,i)=><motion.div key={e.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{background:'rgba(42,111,109,0.04)'}} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*.05}}><Zap className="h-3 w-3 flex-shrink-0 text-teal-400"/><span className="truncate text-slate-500">{e.emotion}</span><span className="flex-shrink-0 text-[9px] text-slate-400">{e.createdAt?.slice(11,16)||''}</span></motion.div>)}</div>}</div>
      </div></div>
    </div>
  </div>);
}
