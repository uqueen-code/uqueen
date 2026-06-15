'use client';
import { useState, useCallback, useEffect } from 'react';
import { GraduationCap, BookOpen, Plus, X, CheckCircle2, Circle, GitBranch, Network, Trash2, Edit3, BookMarked, ChevronRight, ChevronDown, Globe } from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { useTodos } from '@/hooks/useTodos';
import { useHabits } from '@/hooks/useHabits';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils/cn';
import { LEARNING_CATEGORIES, ModuleCategory, Priority } from '@/types/enums';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { STORIES } from '@/lib/ielts-stories';
import { NEWS_ITEMS } from '@/lib/news-data';

const NODE_COLORS=['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#60a5fa','#818cf8','#a78bfa','#e879f9','#fb7185','#f472b6'];

function MindMapBuilder({category,userId}:{category:string;userId:string}){
  const[nodes,setNodes]=useState<any[]>([]);const[loading,setLoading]=useState(true);const[expanded,setExpanded]=useState<Set<string>>(new Set());const[editingId,setEditingId]=useState<string|null>(null);const[editTitle,setEditTitle]=useState('');const addSync=useOfflineStore(s=>s.addToSyncQueue);
  const load=useCallback(async()=>{const db=getDatabase();const rows=await db.mindMapNodes.where({userId,category}).toArray();const map=new Map<string,any>();rows.forEach(r=>map.set(r.id,{...r,children:[]}));const roots:any[]=[];map.forEach(n=>{if(n.parentId&&map.has(n.parentId))map.get(n.parentId)!.children.push(n);else if(!n.parentId)roots.push(n);});roots.sort((a,b)=>a.sortOrder-b.sortOrder);setNodes(roots);setLoading(false);},[userId,category]);
  useEffect(()=>{load();},[load]);
  const addNode=async(pid:string|null)=>{const db=getDatabase();const id=crypto.randomUUID();const n={id,userId,category,parentId:pid,title:'新节点',color:NODE_COLORS[Math.floor(Math.random()*NODE_COLORS.length)]!,sortOrder:Date.now()};await db.mindMapNodes.put({...n,_synced:false,_modifiedAt:Date.now()});addSync({table:'mind_map_nodes',operation:'insert',recordId:id,data:n as any});await load();};
  const delNode=async(id:string)=>{const db=getDatabase();const delR=async(nid:string)=>{const ch=await db.mindMapNodes.where({parentId:nid}).toArray();for(const c of ch)await delR(c.id);await db.mindMapNodes.delete(nid);};await delR(id);await load();toast.success('已删除');};
  const updateTitle=async(id:string,t:string)=>{const db=getDatabase();await db.mindMapNodes.update(id,{title:t,_synced:false,_modifiedAt:Date.now()});setEditingId(null);await load();};
  const toggle=(id:string)=>{setExpanded(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});};
  const NodeC=({node,depth}:{node:any;depth:number})=>{const isExp=expanded.has(node.id)||depth<2;const hasCh=node.children.length>0;
    return(<div className="ml-0"><div className="flex items-center gap-1.5 group py-1">{hasCh?<button onClick={()=>toggle(node.id)} className="p-0.5 rounded hover:bg-slate-100">{isExp?<ChevronDown className="h-3.5 w-3.5 text-slate-400"/>:<ChevronRight className="h-3.5 w-3.5 text-slate-400"/>}</button>:<span className="w-5"/>}<div className="h-3 w-3 rounded-full flex-shrink-0" style={{background:node.color}}/>{editingId===node.id?<input value={editTitle} onChange={e=>setEditTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')updateTitle(node.id,editTitle);if(e.key==='Escape')setEditingId(null);}} onBlur={()=>updateTitle(node.id,editTitle)} className="flex-1 px-2 py-0.5 text-sm rounded border border-purple-300 outline-none" autoFocus/>:<span className="text-sm font-medium text-slate-700 cursor-pointer hover:text-purple-600 flex-1" onClick={()=>{setEditingId(node.id);setEditTitle(node.title);}}>{node.title}</span>}<div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5"><button onClick={()=>{setEditingId(node.id);setEditTitle(node.title);}} className="p-1 rounded hover:bg-slate-100"><Edit3 className="h-3 w-3 text-slate-400"/></button><button onClick={()=>addNode(node.id)} className="p-1 rounded hover:bg-purple-50"><Plus className="h-3 w-3 text-purple-400"/></button><button onClick={()=>delNode(node.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="h-3 w-3 text-red-400"/></button></div></div>{hasCh&&isExp&&<div className="ml-4 border-l-2 border-purple-100 pl-2">{node.children.map((c:any)=><NodeC key={c.id} node={c} depth={depth+1}/>)}</div>}</div>);
  };
  if(loading)return<div className="py-8"><LoadingSpinner size="sm" text="加载中..."/></div>;
  return(<div><div className="flex items-center justify-between mb-4"><p className="text-xs text-slate-400">以树状结构构建{category}的知识框架</p><button onClick={()=>addNode(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-500" style={{background:'#8b5cf612'}}><Plus className="h-3.5 w-3.5"/>添加根节点</button></div>{nodes.length===0?<div className="text-center py-12"><Network className="h-12 w-12 mx-auto mb-3 text-slate-300"/><p className="text-sm text-slate-400">还没有节点</p></div>:<div className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-hide">{nodes.map((n:any)=><NodeC key={n.id} node={n} depth={0}/>)}</div>}</div>);
}

function IeltsReading({category}:{category:string}){
  const dayIdx=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000);
  // Daily 2-story rotation — picks 2 adjacent stories based on day of year
  const idx1=dayIdx%STORIES.length;
  const idx2=(dayIdx+Math.floor(STORIES.length/2))%STORIES.length;
  const daily2=[STORIES[idx1]!,STORIES[idx2]!];
  const[hl,setHl]=useState<string|null>(null);const[readDone,setReadDone]=useState(false);
  const{logLearning,todayLogs}=useLearning();const{toggleHabit,habits}=useHabits();
  useEffect(()=>{setReadDone(todayLogs.some(l=>l.category===category&&l.completed));},[todayLogs,category]);
  const markRead=async(title:string)=>{await logLearning({category,completed:true,notes:`Read:${title}`});if(!habits[ModuleCategory.LEARNING])await toggleHabit(ModuleCategory.LEARNING);setReadDone(true);toast.success('阅读打卡完成！📖');};

  return(<div className="space-y-8">
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/60 border border-amber-100"><span className="text-lg">📰</span><span className="text-xs font-medium text-amber-700">每日精选 · 2篇雅思长文</span><span className="text-[10px] text-amber-500 ml-auto">Day {dayIdx+1}</span></div>
    {daily2.map((story,si)=>(<div key={si} className="space-y-3">
      <div className="flex items-center justify-between"><div><h3 className="text-base font-bold text-slate-800">{story.title}</h3><p className="text-[10px] text-slate-400">{story.level} · {story.wc} words · #{idx1+1}/{idx2+1} of 50</p></div><div className="flex items-center gap-2">{!readDone?<button onClick={()=>markRead(story.title)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105" style={{background:'linear-gradient(135deg,#8b5cf6,#7c3aed)'}}><BookMarked className="h-3.5 w-3.5"/>打卡阅读</button>:<span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg"><CheckCircle2 className="h-3.5 w-3.5"/>已打卡</span>}</div></div>
      <div className="space-y-3">{story.content.map((p,i)=><div key={i} className="text-sm leading-relaxed text-slate-700 p-4 rounded-xl bg-slate-50/80" dangerouslySetInnerHTML={{__html:(()=>{let r=p;story.vocab.forEach(v=>{r=r.replace(new RegExp(`\\b(${v.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})\\b`,'gi'),m=>`<span class="vocab cursor-pointer underline decoration-dotted underline-offset-2 decoration-amber-400 bg-amber-50/50 px-0.5 rounded hover:bg-amber-100" data-word="${v.word}">${m}</span>`);});return r;})()}} onClick={e=>{const t=e.target as HTMLElement;if(t.classList.contains('vocab'))setHl(t.dataset.word||null);}}/>)}</div>
      <AnimatePresence>{hl&&<motion.div className="p-3 rounded-xl" style={{background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)'}} initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}}><div className="flex items-center justify-between"><span className="text-sm font-bold text-purple-700">{hl}</span><button onClick={()=>setHl(null)} className="p-0.5"><X className="h-3.5 w-3.5 text-purple-400"/></button></div><p className="text-xs text-slate-600 mt-1">{story.vocab.find(v=>v.word===hl)?.definition||''}</p></motion.div>}</AnimatePresence>
      <div className="border-t border-slate-100 pt-2"><p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5"/>核心词汇</p><div className="flex flex-wrap gap-1.5">{story.vocab.map(v=><button key={v.word} onClick={()=>setHl(v.word)} className={cn('px-2.5 py-1 rounded-lg text-xs transition-all',hl===v.word?'bg-purple-100 text-purple-700 font-medium':'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{v.word}</button>)}</div></div>
      {si===0&&<div className="border-t-2 border-dashed border-slate-200 pt-6"/>}
    </div>))}
  </div>);
}

function NewsSection(){
  const[expandedId,setExpandedId]=useState<number|null>(null);
  const[hl,setHl]=useState<string|null>(null);
  return(<div className="space-y-4">
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/60 border border-blue-100"><span className="text-lg">🗞️</span><span className="text-xs font-medium text-blue-700">近期时政新闻 · Current Affairs</span><span className="text-[10px] text-blue-400 ml-auto">{NEWS_ITEMS.length} articles</span></div>
    {NEWS_ITEMS.map(item=>{const isExp=expandedId===item.id;
      return(<div key={item.id} className="rounded-xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-all">
        <div className="p-4 cursor-pointer" onClick={()=>setExpandedId(isExp?null:item.id)}>
          <div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><h4 className="text-sm font-bold text-slate-800 leading-snug">{item.title}</h4><p className="text-xs text-slate-500 mt-1">{item.date} · {item.source}</p><p className="text-xs text-slate-500 mt-0.5">{item.titleZh}</p></div><span className="text-lg flex-shrink-0 mt-1">{isExp?'📰':'📌'}</span></div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">{item.summary}</p>
        </div>
        {isExp&&<motion.div className="border-t border-slate-100 px-4 py-3 space-y-3" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} transition={{duration:0.3}}>
          <div className="space-y-3">{item.content.map((p,i)=><div key={i} className="text-sm leading-relaxed text-slate-700" dangerouslySetInnerHTML={{__html:(()=>{let r=p;item.vocab.forEach(v=>{r=r.replace(new RegExp(`\\b(${v.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})\\b`,'gi'),m=>`<span class="vocab cursor-pointer underline decoration-dotted underline-offset-2 decoration-emerald-400 bg-emerald-50/50 px-0.5 rounded hover:bg-emerald-100" data-word="${v.word}">${m}</span>`);});return r;})()}} onClick={e=>{const t=e.target as HTMLElement;if(t.classList.contains('vocab'))setHl(t.dataset.word||null);}}/>)}</div>
          <AnimatePresence>{hl&&<motion.div className="p-3 rounded-xl" style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)'}} initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}}><div className="flex items-center justify-between"><span className="text-sm font-bold text-emerald-700">{hl}</span><button onClick={()=>setHl(null)} className="p-0.5"><X className="h-3.5 w-3.5 text-emerald-400"/></button></div><p className="text-xs text-slate-600 mt-1">{item.vocab.find(v=>v.word===hl)?.definition||''}</p></motion.div>}</AnimatePresence>
          <div className="border-t border-slate-100 pt-2"><p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5"/>核心词汇</p><div className="flex flex-wrap gap-1.5">{item.vocab.map(v=><button key={v.word} onClick={()=>setHl(v.word)} className={cn('px-2.5 py-1 rounded-lg text-xs transition-all',hl===v.word?'bg-emerald-100 text-emerald-700 font-medium':'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{v.word}</button>)}</div></div>
        </motion.div>}
      </div>);
    })}
  </div>);
}

export default function LearningPage(){
  const{categories,plans,todayLogs,activeCategories,isLoading,toggleCategory,savePlan,acceptPlan,logLearning}=useLearning();
  const{createTodo}=useTodos();const{habits,toggleHabit}=useHabits();
  const user=useAuthStore(s=>s.user);const uid=user?.id??'local-user';
  const[sf,setSf]=useState(false);const[pc,setPc]=useState('');const[pt,setPt]=useState('');const[pm,setPm]=useState('');const[ps,setPs]=useState('');const[lp,setLp]=useState('');
  const[at,setAt]=useState<Record<string,string>>({});
  const hcp=useCallback(async()=>{if(!pt.trim()||!pc)return;await savePlan({category:pc,title:pt.trim(),methodDescription:pm.trim()||undefined,planData:ps.trim()?{schedule:ps.trim()}:undefined,localResourcePath:lp.trim()||undefined});toast.success('已保存');setPt('');setPm('');setPs('');setLp('');setSf(false);},[pc,pt,pm,ps,lp,savePlan]);
  const hap=useCallback(async(pid:string)=>{const plan=await acceptPlan(pid);if(!plan)return;await createTodo({title:`📖 ${plan.title}`,description:plan.methodDescription??undefined,category:ModuleCategory.LEARNING,priority:Priority.IMPORTANT,isRecurring:true,recurType:'daily' as any,dueDate:new Date().toISOString().split('T')[0]});if(!habits[ModuleCategory.LEARNING])await toggleHabit(ModuleCategory.LEARNING);toast.success('已接受！📖');},[acceptPlan,createTodo,habits,toggleHabit]);
  const hqc=useCallback(async(cat:string)=>{await logLearning({category:cat,completed:true});if(!habits[ModuleCategory.LEARNING])await toggleHabit(ModuleCategory.LEARNING);toast.success(`${cat}已打卡✅`);},[logLearning,habits,toggleHabit]);
  if(isLoading)return<div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..."/></div>;
  const isIelts=(cat:string)=>cat==='雅思';
  return(<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in"><div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2 text-purple-500"><GraduationCap className="h-7 w-7"/>学习记录</h1><p className="text-sm mt-1 text-slate-400">勾选子板块 · 学习计划 · 思维导图 · 英文阅读(50篇长文)</p></div>
    <div className="module-card mb-6" style={{'--module-accent':'#8b5cf6'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#8b5cf6'} as React.CSSProperties}><BookOpen className="h-5 w-5 text-purple-500"/>学习分类</h2><div className="flex flex-wrap gap-2">{LEARNING_CATEGORIES.map(cat=>{const cd=categories.find(c=>c.category===cat);const isA=cd?.isActive??false;const tc=todayLogs.some(l=>l.category===cat);return(<button key={cat} onClick={()=>toggleCategory(cat)} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all border-2 text-sm font-medium',isA?'shadow-sm':'')} style={{background:isA?'#8b5cf612':'var(--color-surface-alt)',borderColor:isA?'#8b5cf6':'var(--color-border)',color:isA?'#7c3aed':'var(--color-text-secondary)'}}><span>{cat}</span>{tc&&<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500"/>}</button>);})}</div></div>
    {activeCategories.length===0?<div className="module-card text-center py-12" style={{'--module-accent':'#8b5cf6'} as React.CSSProperties}><BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300"/><p className="text-sm text-slate-400">请先勾选上方的学习分类</p></div>:
    <div className="grid grid-cols-1 gap-6">{activeCategories.map(cat=>{const cps=plans.filter(p=>p.category===cat);const cls=todayLogs.filter(l=>l.category===cat);const isC=cls.some(l=>l.completed);const ct=at[cat]||'plan';
    return(<div key={cat} className="module-card" style={{'--module-accent':'#8b5cf6'} as React.CSSProperties}><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-purple-600">{cat}</h3><button onClick={()=>hqc(cat)} className={cn('px-3 py-1 rounded-lg text-xs font-medium')} style={{background:isC?'#22c55e18':'var(--color-surface-hover)',color:isC?'#22c55e':'var(--color-text-muted)'}}>{isC?'✓ 已完成':'标记完成'}</button></div>
    <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-slate-100">{['plan','mindmap',...(isIelts(cat)?['reading','news']:[])].map(tab=><button key={tab} onClick={()=>setAt(p=>({...p,[cat]:tab}))} className={cn('flex-1 py-1.5 rounded-md text-xs font-medium transition-all',ct===tab?'bg-white text-purple-600 shadow-sm':'text-slate-500 hover:text-slate-700')}>{tab==='plan'?'📋 计划':tab==='mindmap'?'🧠 导图':tab==='reading'?'📖 阅读':'🗞️ 新闻'}</button>)}</div>
    {ct==='plan'&&<>{cps.length>0?<div className="space-y-2 mb-3">{cps.map(p=><div key={p.id} className="p-3 rounded-lg bg-surface-alt"><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-800">{p.title}</span>{p.isAccepted?<span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">已接受</span>:<button onClick={()=>hap(p.id)} className="text-xs px-2 py-0.5 rounded btn-primary" style={{'--color-accent':'#8b5cf6','--color-accent-hover':'#7c3aed'} as React.CSSProperties}>接受</button>}</div>{p.methodDescription&&<p className="text-xs text-slate-400">{p.methodDescription}</p>}</div>)}</div>:<div className="text-center py-4 mb-3"><p className="text-xs text-slate-400">暂无计划</p></div>}<button onClick={()=>{setPc(cat);setSf(true);}} className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs text-purple-500 w-full" style={{background:'#8b5cf612'}}><Plus className="h-3.5 w-3.5"/>添加计划</button></>}
    {ct==='mindmap'&&<MindMapBuilder category={cat} userId={uid}/>}
    {ct==='reading'&&isIelts(cat)&&<IeltsReading category={cat}/>}
    {ct==='news'&&isIelts(cat)&&<NewsSection/>}
    </div>);})}</div>}
    {sf&&<><div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={()=>setSf(false)}/><div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={()=>setSf(false)}><div className="w-full max-w-md p-6 rounded-2xl shadow-2xl bg-white" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-purple-600">创建{pc}计划</h3><button onClick={()=>setSf(false)}><X className="h-5 w-5 text-slate-400"/></button></div><div className="space-y-3"><input type="text" value={pt} onChange={e=>setPt(e.target.value)} placeholder="计划标题" className="input-field text-sm" autoFocus/><textarea value={pm} onChange={e=>setPm(e.target.value)} placeholder="学习方法描述" className="input-field min-h-[80px] text-sm"/><textarea value={ps} onChange={e=>setPs(e.target.value)} placeholder="每日学习规划（可选）" className="input-field min-h-[60px] text-sm"/><input type="text" value={lp} onChange={e=>setLp(e.target.value)} placeholder="本地资料路径" className="input-field text-sm"/><button onClick={hcp} disabled={!pt.trim()} className="btn-primary w-full" style={{'--color-accent':'#8b5cf6','--color-accent-hover':'#7c3aed'} as React.CSSProperties}>保存</button></div></div></div></>}
  </div>);
}
