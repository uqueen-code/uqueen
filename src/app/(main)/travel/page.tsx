'use client';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Map, Globe, MapPin, Plane, UtensilsCrossed, Landmark, Trees, X, Navigation, Sparkles, Compass, ZoomIn, ZoomOut, RotateCcw, Footprints, Telescope, Edit3, Trash2 } from 'lucide-react';
import { useTravel } from '@/hooks/useTravel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface WC { city:string;country:string;top:number;left:number; }
const WORLD_CITIES: WC[] = [
  {city:'北京',country:'中国',top:28,left:73},{city:'上海',country:'中国',top:32,left:76},{city:'成都',country:'中国',top:31,left:68},{city:'广州',country:'中国',top:35,left:74},{city:'香港',country:'中国',top:36,left:75},{city:'台北',country:'台湾',top:33,left:79},{city:'东京',country:'日本',top:29,left:83},{city:'首尔',country:'韩国',top:26,left:81},{city:'新加坡',country:'新加坡',top:47,left:76},{city:'曼谷',country:'泰国',top:40,left:74},{city:'河内',country:'越南',top:37,left:75},{city:'胡志明市',country:'越南',top:42,left:76},{city:'吉隆坡',country:'马来西亚',top:46,left:75},{city:'马尼拉',country:'菲律宾',top:38,left:81},{city:'新德里',country:'印度',top:33,left:67},{city:'迪拜',country:'阿联酋',top:35,left:60},{city:'伊斯坦布尔',country:'土耳其',top:26,left:55},{city:'伦敦',country:'英国',top:19,left:46},{city:'巴黎',country:'法国',top:21,left:47},{city:'罗马',country:'意大利',top:24,left:50},{city:'巴塞罗那',country:'西班牙',top:25,left:46},{city:'柏林',country:'德国',top:18,left:50},{city:'阿姆斯特丹',country:'荷兰',top:17,left:48},{city:'布拉格',country:'捷克',top:20,left:50},{city:'维也纳',country:'奥地利',top:21,left:51},{city:'莫斯科',country:'俄罗斯',top:12,left:58},{city:'雷克雅未克',country:'冰岛',top:8,left:41},{city:'斯德哥尔摩',country:'瑞典',top:13,left:52},{city:'雅典',country:'希腊',top:27,left:54},{city:'开罗',country:'埃及',top:32,left:56},{city:'开普敦',country:'南非',top:70,left:54},{city:'内罗毕',country:'肯尼亚',top:52,left:56},{city:'马拉喀什',country:'摩洛哥',top:30,left:48},{city:'纽约',country:'美国',top:24,left:23},{city:'洛杉矶',country:'美国',top:29,left:13},{city:'旧金山',country:'美国',top:26,left:10},{city:'芝加哥',country:'美国',top:23,left:21},{city:'温哥华',country:'加拿大',top:15,left:10},{city:'多伦多',country:'加拿大',top:20,left:26},{city:'墨西哥城',country:'墨西哥',top:36,left:19},{city:'里约热内卢',country:'巴西',top:60,left:32},{city:'布宜诺斯艾利斯',country:'阿根廷',top:70,left:29},{city:'圣地亚哥',country:'智利',top:68,left:25},{city:'利马',country:'秘鲁',top:54,left:24},{city:'悉尼',country:'澳大利亚',top:68,left:84},{city:'墨尔本',country:'澳大利亚',top:71,left:82},{city:'奥克兰',country:'新西兰',top:74,left:89},
];

// ── throttle util ──
function throttle(fn:()=>void,ms:number){let last=0;return()=>{const now=Date.now();if(now-last>=ms){last=now;fn();}};}

function CityPopup({city,isV,ex,mode,onSave,onUpdate,onDelete,onClose,onToggle}:{city:WC;isV:boolean;ex:{vd:string|null;f:string|null;id?:string};mode:'explore'|'footprint';onSave:(d:string,f:string)=>Promise<void>;onUpdate:(d:string,f:string)=>Promise<void>;onDelete:()=>void;onClose:()=>void;onToggle:()=>void}){
  const{t}=useTranslation();const[vd,svd]=useState(ex.vd||'');const[f,sf]=useState(ex.f||'');const[ed,se]=useState(!isV&&mode==='footprint');const[saving,ssv]=useState(false);
  const save=async()=>{if(!vd){toast.error(t('travel.selectDate'));return;}ssv(true);try{isV&&ex.id?await onUpdate(vd,f):await onSave(vd,f);se(false);}finally{ssv(false);}};
  return(<motion.div className="absolute top-4 right-4 w-72 sm:w-80 p-4 sm:p-5 rounded-2xl z-30" style={{background:'rgba(255,255,255,0.96)',backdropFilter:'blur(24px)',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.12)'}} initial={{opacity:0,scale:.88,y:-12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.88,y:-12}} transition={{type:'spring',stiffness:450,damping:28}}>
    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#f59e0b,#f97316)'}}><MapPin className="h-5 w-5 text-white"/></div><div><h4 className="text-sm font-bold text-slate-800">{city.city}</h4><p className="text-[10px] text-slate-500">{city.country}</p></div></div><button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-4 w-4 text-slate-400"/></button></div>
    {mode==='explore'&&!isV?(<div className="text-center py-4"><div className="text-3xl mb-2">🔭</div><p className="text-sm font-medium text-slate-600 mb-1">{t('travel.notVisited',{city:city.city})}</p><p className="text-xs text-slate-400 mb-3">{t('travel.switchToFootprint')}</p><button onClick={onToggle} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#10b981,#059669)'}}><Footprints className="h-3.5 w-3.5"/>{t('travel.enableFootprint')}</button></div>):mode==='footprint'&&isV&&!ed?(<div className="space-y-2"><div className="p-3 rounded-lg" style={{background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.12)'}}><p className="text-[10px] font-bold text-emerald-600 mb-1">📅 {t('travel.visitDate')}</p><p className="text-sm font-medium text-slate-800 ml-5">{ex.vd||t('travel.notRecorded')}</p></div><div className="p-3 rounded-lg" style={{background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.12)'}}><p className="text-[10px] font-bold text-amber-600 mb-1">💭 {t('travel.feeling')}</p><p className="text-sm italic text-slate-600 ml-5">{ex.f||t('travel.notRecorded')}</p></div><div className="flex gap-2 pt-1"><button onClick={()=>se(true)} className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1" style={{background:'rgba(16,185,129,0.08)',color:'#059669',border:'1px solid rgba(16,185,129,0.2)'}}><Edit3 className="h-3 w-3"/>{t('travel.editFootprint')}</button><button onClick={onDelete} className="py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1" style={{background:'rgba(239,68,68,0.05)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.15)'}}><Trash2 className="h-3 w-3"/></button></div></div>):(<div className="space-y-2"><div><label className="text-[10px] font-bold text-slate-500 mb-1 block">📅 {t('travel.visitDate')}</label><input type="date" value={vd} onChange={e=>svd(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-400"/></div><div><label className="text-[10px] font-bold text-slate-500 mb-1 block">💭 {t('travel.feeling')}</label><input type="text" value={f} onChange={e=>sf(e.target.value)} placeholder={t('travel.feelingPlaceholder')} maxLength={100} className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-400"/></div><div className="flex gap-2 pt-1"><button onClick={save} disabled={saving||!vd} className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-40" style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>{saving?'...':isV?t('travel.updateFootprint'):t('travel.saveFootprint')}</button>{isV&&<button onClick={()=>se(false)} className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-500">{t('common.cancel')}</button>}</div></div>)}</motion.div>);
}

export default function TravelPage(){
  const{t}=useTranslation();
  const {cities,visitedCities,showVisited,dailyRecommendation,countryKnowledge,isLoading,setShowVisited,toggleCity,updateCityVisit}=useTravel();
  const[sc,ssc]=useState<WC|null>(null);const[sp,ssp]=useState(false);
  const[zoomLabel,setZoomLabel]=useState('100%');
  const isMobile=typeof window!=='undefined'&&window.innerWidth<768;
  const[forceMobile,setForceMobile]=useState(isMobile);
  useEffect(()=>{const h=()=>setForceMobile(window.innerWidth<768);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[]);

  // ── DOM-direct refs (ZERO React re-renders during drag/zoom) ──
  const canvasRef=useRef<HTMLDivElement>(null);
  const zoomRef=useRef(1);const panRef=useRef({x:0,y:0});
  const dragRef=useRef(false);const dsRef=useRef({x:0,y:0});
  const debounceRef=useRef(0);

  const applyTransform=useCallback(()=>{
    if(canvasRef.current){
      canvasRef.current.style.transform=`translate3d(${panRef.current.x}px,${panRef.current.y}px,0) scale(${zoomRef.current}) translateZ(0)`;
    }
  },[]);

  // Debounced: update zoom label only AFTER user stops
  const updateLabel=useCallback(()=>{
    clearTimeout(debounceRef.current);
    debounceRef.current=window.setTimeout(()=>{setZoomLabel(Math.round(zoomRef.current*100)+'%');},200);
  },[]);

  // Cleanup
  useEffect(()=>()=>{clearTimeout(debounceRef.current);},[]);

  // Throttled wheel handler — DOM-only, no React state
  const onW=useMemo(()=>throttle(()=>{const z=zoomRef.current;setZoomLabel(Math.round(z*100)+'%');},200),[]);
  const handleWheel=useCallback((e:React.WheelEvent)=>{
    e.preventDefault();
    const rect=e.currentTarget.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const dz=e.deltaY>0?-0.06:0.06;
    const nz=Math.min(3,Math.max(0.5,zoomRef.current+dz));
    const sc=nz/zoomRef.current;
    panRef.current={x:mx-sc*(mx-panRef.current.x),y:my-sc*(my-panRef.current.y)};
    zoomRef.current=nz;
    applyTransform();
    onW();
  },[applyTransform,onW]);

  // Drag handlers — DOM-only during drag
  const handleDown=useCallback((e:React.MouseEvent|React.TouchEvent)=>{
    e.preventDefault();
    const ev='touches' in e?e.touches[0]!:e;
    dragRef.current=true;
    dsRef.current={x:ev.clientX-panRef.current.x,y:ev.clientY-panRef.current.y};
  },[]);
  const handleMove=useCallback((e:React.MouseEvent|React.TouchEvent)=>{
    if(!dragRef.current)return;
    const ev='touches' in e?e.touches[0]!:e;
    panRef.current={x:ev.clientX-dsRef.current.x,y:ev.clientY-dsRef.current.y};
    applyTransform();
  },[applyTransform]);
  const handleUp=useCallback(()=>{
    dragRef.current=false;
    updateLabel();
  },[updateLabel]);

  const vs=useMemo(()=>new Set(visitedCities.map(c=>`${c.city}-${c.country}`)),[visitedCities]);
  const pins=useMemo(()=>WORLD_CITIES.filter(wc=>!showVisited||vs.has(`${wc.city}-${wc.country}`)),[vs,showVisited]);

  if(isLoading)return<div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text={t('common.loading')}/></div>;
  const di=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000);
  const TIPS=[{icon:'🎒',t:'轻装出行',tip:'随身带可压缩收纳袋。'},{icon:'📱',t:'离线地图',tip:'出发前下载离线地图。'},{icon:'💰',t:'省钱秘籍',tip:'当地超市买早餐。'},{icon:'📷',t:'拍照技巧',tip:'黄金时段光线柔美。'},{icon:'🏨',t:'住宿选择',tip:'民宿体验当地文化。'},{icon:'🛂',t:'证件安全',tip:'护照拍照存手机云盘。'},{icon:'🍜',t:'美食发现',tip:'去小巷找排队最多的店。'},{icon:'🚆',t:'交通攻略',tip:'欧洲Eurail日本JR Pass。'},{icon:'🌞',t:'防晒必备',tip:'阴天也要涂防晒。'},{icon:'🗣️',t:'语言沟通',tip:'学5句当地语言。'},{icon:'⏰',t:'时差调节',tip:'到达后按当地时间作息。'},{icon:'🧳',t:'打包技巧',tip:'卷衣服省空间30%。'},{icon:'🚨',t:'安全提醒',tip:'贵重物品分开放。'},{icon:'🌿',t:'环保旅行',tip:'自带水壶和购物袋。'}];
  const tt=TIPS[di%TIPS.length]!;
  const visCount=visitedCities.length;

  return(<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
    <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-600"><Map className="h-7 w-7"/>{t('travel.title')}</h1><p className="text-sm mt-1 text-slate-400">{t('travel.subtitle')}</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="module-card overflow-hidden" style={{'--module-accent':'#10b981'} as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="section-title mb-0" style={{'--module-accent':'#10b981'} as React.CSSProperties}><Globe className="h-5 w-5 text-emerald-500"/>{showVisited?t('travel.footprintMode'):t('travel.exploreMode')}</h2>
            <div className="flex items-center gap-2">
              <button onClick={()=>setShowVisited(!showVisited)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all" style={{background:showVisited?'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.06))':'var(--color-surface-alt)',color:showVisited?'#059669':'var(--color-text-muted)',border:showVisited?'1.5px solid rgba(16,185,129,0.35)':'1.5px solid var(--color-border)'}}>{showVisited?<><Footprints className="h-3.5 w-3.5"/>{t('travel.toggleFootprint')}</>:<><Telescope className="h-3.5 w-3.5"/>{t('travel.toggleExplore')}</>}</button>
              {!forceMobile&&<div className="flex items-center gap-0.5 p-1 rounded-full bg-white/60 border border-slate-200"><button onClick={()=>{zoomRef.current=Math.min(3,zoomRef.current+.15);applyTransform();updateLabel();}} className="p-1.5 rounded-full hover:bg-white"><ZoomIn className="h-3.5 w-3.5 text-slate-500"/></button><button onClick={()=>{zoomRef.current=Math.max(0.5,zoomRef.current-.15);applyTransform();updateLabel();}} className="p-1.5 rounded-full hover:bg-white"><ZoomOut className="h-3.5 w-3.5 text-slate-500"/></button><button onClick={()=>{zoomRef.current=1;panRef.current={x:0,y:0};applyTransform();updateLabel();}} className="p-1.5 rounded-full hover:bg-white"><RotateCcw className="h-3.5 w-3.5 text-slate-500"/></button></div>}
            </div>
          </div>

          {/* ═══ MAP ═══ */}
          {forceMobile?(
            /* MOBILE: static overflow-scroll — zero zoom, zero drag */
            <div className="relative w-full rounded-2xl overflow-hidden" style={{height:400,background:'#E8F1F5'}}>
              <div className="absolute inset-0 overflow-y-scroll overflow-x-scroll">
                <div style={{width:1000,height:500,position:'relative'}}>
                  <img src="/assets/world-landmarks-map.jpg" alt="map" style={{width:'100%',height:'100%',objectFit:'cover'}} draggable={false}/>
                  {pins.map(wc=>{const isV=vs.has(`${wc.city}-${wc.country}`);
                    return(<button key={`${wc.city}-${wc.country}`} onClick={()=>{ssc(wc);ssp(true);}} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{left:`${wc.left}%`,top:`${wc.top}%`}}>{showVisited?<MapPin className="h-4 w-4" style={{color:isV?'#ef4444':'#f59e0b',fill:isV?'#ef4444':'#fbbf24'}}/>:<div className="h-2.5 w-2.5 rounded-full bg-amber-400/70 ring-1 ring-white/80"/>}</button>);
                  })}
                </div>
              </div>
            </div>
          ):(
            /* DESKTOP: GPU-accelerated, DOM-direct, zero-React-render drag/zoom */
            <div className="relative w-full rounded-2xl overflow-hidden select-none" style={{height:500,cursor:dragRef.current?'grabbing':'grab',background:'#E8F1F5',touchAction:'none'}} onWheel={handleWheel} onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp} onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={handleUp}>
              <div className="absolute inset-0 z-30 pointer-events-none rounded-2xl" style={{boxShadow:'inset 0 0 40px rgba(0,0,0,0.08)'}}/>
              <div ref={canvasRef} className="absolute inset-0" style={{transformOrigin:'center center',willChange:'transform'}}>
                <img src="/assets/world-landmarks-map.jpg" alt="map" className="absolute inset-0 w-full h-full object-cover" draggable={false}/>
                <div className="absolute inset-0">
                  {pins.map(wc=>{const isV=vs.has(`${wc.city}-${wc.country}`);const isSel=sc?.city===wc.city&&sc?.country===wc.country;
                    return(<button key={`${wc.city}-${wc.country}`} onClick={e=>{e.stopPropagation();ssc(wc);ssp(true);}} className="absolute transform -translate-x-1/2 -translate-y-1/2 group" style={{left:`${wc.left}%`,top:`${wc.top}%`}}>{showVisited?(<div className="relative"><MapPin className="h-5 w-5 drop-shadow-lg" style={{color:isV?'#ef4444':'#f59e0b',fill:isV?'#ef4444':'#fbbf24'}}/>{isV&&<span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-white">✓</span>}</div>):(<><div className="h-3 w-3 rounded-full bg-amber-400/70 ring-2 ring-white/80 shadow-md group-hover:scale-150 transition-transform"/><span className="absolute left-1/2 -translate-x-1/2 -bottom-5 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all px-2 py-0.5 rounded-lg pointer-events-none bg-white/95 backdrop-blur shadow-lg text-slate-800">{wc.city}{isV&&' ✅'}</span></>)}</button>);
                  })}
                </div>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] px-3 py-2 rounded-lg z-30" style={{background:'rgba(255,255,255,0.88)',backdropFilter:'blur(12px)',boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>{showVisited?<><span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-red-400"/>{t('travel.visited')} {visCount}</span></>:<><span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-400/60"/>{t('travel.toExplore')} {WORLD_CITIES.length}</span></>}</div>
              <div className="absolute bottom-3 right-3 text-[10px] px-2 py-1 rounded-full bg-white/70 backdrop-blur text-slate-500 shadow-sm z-30">{zoomLabel}</div>
            </div>
          )}

          <AnimatePresence>{sp&&sc&&<CityPopup city={sc} isV={vs.has(`${sc.city}-${sc.country}`)} ex={(()=>{const e=cities.find(c=>c.city===sc.city&&c.country===sc.country);return{vd:e?.visitDate||null,f:e?.feeling||null,id:e?.id};})()} mode={showVisited?'footprint':'explore'} onSave={async(d,f)=>{await toggleCity({city:sc.city,country:sc.country,lat:sc.top,lng:sc.left},d,f);toast.success(t('travel.saved')+' 🗺️');ssp(false);ssc(null);}} onUpdate={async(d,f)=>{const ex=cities.find(c=>c.city===sc.city&&c.country===sc.country);if(ex?.id){await updateCityVisit(ex.id,d,f);toast.success(t('travel.updated')+' ✨');}}} onDelete={async()=>{await toggleCity({city:sc.city,country:sc.country,lat:sc.top,lng:sc.left});toast.success(t('travel.deleted'));ssp(false);ssc(null);}} onClose={()=>{ssp(false);ssc(null);}} onToggle={()=>setShowVisited(true)}/>}</AnimatePresence>
        </div>

        {countryKnowledge&&(<div className="module-card" style={{'--module-accent':'#3b82f6'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#3b82f6'} as React.CSSProperties}><Globe className="h-5 w-5 text-blue-500"/>{t('travel.countryKnowledge')}：{countryKnowledge.flag} {countryKnowledge.country}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-3"><div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-blue-500">📖 {t('travel.history')}</p><p className="text-sm leading-relaxed text-slate-600">{countryKnowledge.history}</p></div><div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-blue-500">🎭 {t('travel.culture')}</p><p className="text-sm leading-relaxed text-slate-600">{countryKnowledge.culture}</p></div></div><div className="space-y-3"><div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-blue-500">🗺️ {t('travel.geography')}</p><p className="text-sm leading-relaxed text-slate-600">{countryKnowledge.geography}</p></div><div className="p-4 rounded-xl bg-surface-alt"><p className="text-xs font-bold mb-2 text-amber-500">🎯 {t('travel.funFacts')}</p><ul className="space-y-2">{countryKnowledge.funFacts.map((f,i)=><li key={i} className="flex items-start gap-2"><Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-amber-400"/><span className="text-xs leading-relaxed text-slate-600">{f}</span></li>)}</ul></div><div className="flex items-center gap-4 text-xs p-3 rounded-xl bg-blue-50"><span>🏙️ {t('travel.capital')}：{countryKnowledge.capital}</span><span>👥 {t('travel.population')}：{countryKnowledge.population}</span></div></div></div></div>)}
      </div>
      <div className="space-y-6">
        {dailyRecommendation&&(<div className="module-card" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#f59e0b'} as React.CSSProperties}><Plane className="h-5 w-5 text-amber-500"/>{t('travel.dailyRecommendation')}</h2><div className="p-3 rounded-xl" style={{background:'linear-gradient(135deg,rgba(245,158,11,0.07),rgba(249,115,22,0.05))',border:'1px solid rgba(245,158,11,0.18)'}}><div className="flex items-center gap-3 mb-3"><div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#f59e0b,#f97316)'}}><Plane className="h-5 w-5 text-white"/></div><div><h3 className="text-base font-bold text-amber-700">{dailyRecommendation.destination}</h3><p className="text-xs text-amber-800">{dailyRecommendation.country} · {dailyRecommendation.days}日游</p></div></div><div className="space-y-2"><div className="p-2.5 rounded-lg bg-surface"><div className="flex items-center gap-1 mb-1"><Navigation className="h-3 w-3 text-orange-500"/><span className="text-[10px] font-bold text-orange-500">路线</span></div><p className="text-[10px] leading-relaxed text-slate-600">{dailyRecommendation.route}</p></div><div className="grid grid-cols-2 gap-2"><div className="p-2.5 rounded-lg bg-surface"><div className="flex items-center gap-1 mb-1"><Landmark className="h-3 w-3 text-indigo-500"/><span className="text-[10px] font-bold text-indigo-500">景点</span></div>{dailyRecommendation.attractions.slice(0,4).map((a,i)=><p key={i} className="text-[9px] text-slate-600">• {a}</p>)}</div><div className="p-2.5 rounded-lg bg-surface"><div className="flex items-center gap-1 mb-1"><UtensilsCrossed className="h-3 w-3 text-red-500"/><span className="text-[10px] font-bold text-red-500">美食</span></div>{dailyRecommendation.food.map((f,i)=><p key={i} className="text-[9px] text-slate-600">• {f}</p>)}</div></div></div></div></div>)}
        <div className="module-card" style={{'--module-accent':'#06b6d4'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#06b6d4'} as React.CSSProperties}><Compass className="h-5 w-5 text-cyan-500"/>{t('travel.dailyTip')}</h2><div className="p-3 rounded-xl" style={{background:'rgba(6,182,212,0.05)',border:'1px solid rgba(6,182,212,0.12)'}}><div className="flex items-center gap-2 mb-2"><span className="text-2xl">{tt.icon}</span><h3 className="text-sm font-bold text-cyan-700">{tt.t}</h3></div><p className="text-xs leading-relaxed text-slate-600">{tt.tip}</p></div></div>
        {visCount>0&&(<div className="module-card" style={{'--module-accent':'#ef4444'} as React.CSSProperties}><h2 className="section-title" style={{'--module-accent':'#ef4444'} as React.CSSProperties}><MapPin className="h-5 w-5 text-red-500"/>{t('travel.myFootprints')} ({visCount})</h2><div className="space-y-1 max-h-[220px] overflow-y-auto scrollbar-hide">{visitedCities.map(city=><div key={city.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-alt"><MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-red-400"/><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><span className="text-xs font-bold text-slate-800">{city.city}</span><span className="text-[9px] text-slate-400">{city.country}</span></div>{city.visitDate&&<span className="text-[9px] text-slate-400">📅 {city.visitDate}</span>}{city.feeling&&<p className="text-[10px] mt-0.5 italic text-slate-500">"{city.feeling}"</p>}</div></div>)}</div></div>)}
      </div>
    </div>
  </div>);
}
