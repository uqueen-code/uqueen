'use client';

import { useState } from 'react';
import { Map, Globe, MapPin, Plane, UtensilsCrossed, Landmark, Trees, ToggleLeft, ToggleRight, X, Navigation, Sparkles, Compass, Camera, Star, BookOpen } from 'lucide-react';
import { useTravel } from '@/hooks/useTravel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const WORLD_CITIES = [
  { city: '北京', country: '中国', top: 24, left: 72 },
  { city: '上海', country: '中国', top: 30, left: 76 },
  { city: '成都', country: '中国', top: 28, left: 67 },
  { city: '广州', country: '中国', top: 32, left: 73 },
  { city: '东京', country: '日本', top: 26, left: 84 },
  { city: '京都', country: '日本', top: 27, left: 82 },
  { city: '首尔', country: '韩国', top: 22, left: 80 },
  { city: '新加坡', country: '新加坡', top: 42, left: 75 },
  { city: '曼谷', country: '泰国', top: 36, left: 73 },
  { city: '清迈', country: '泰国', top: 32, left: 72 },
  { city: '伦敦', country: '英国', top: 16, left: 46 },
  { city: '巴黎', country: '法国', top: 18, left: 47 },
  { city: '罗马', country: '意大利', top: 20, left: 50 },
  { city: '巴塞罗那', country: '西班牙', top: 21, left: 44 },
  { city: '柏林', country: '德国', top: 16, left: 50 },
  { city: '莫斯科', country: '俄罗斯', top: 10, left: 56 },
  { city: '纽约', country: '美国', top: 21, left: 22 },
  { city: '洛杉矶', country: '美国', top: 25, left: 13 },
  { city: '旧金山', country: '美国', top: 22, left: 11 },
  { city: '悉尼', country: '澳大利亚', top: 60, left: 86 },
  { city: '墨尔本', country: '澳大利亚', top: 62, left: 84 },
  { city: '开普敦', country: '南非', top: 65, left: 54 },
  { city: '开罗', country: '埃及', top: 28, left: 54 },
  { city: '雷克雅未克', country: '冰岛', top: 7, left: 40 },
  { city: '迪拜', country: '阿联酋', top: 32, left: 60 },
  { city: '新德里', country: '印度', top: 30, left: 66 },
  { city: '里约热内卢', country: '巴西', top: 54, left: 32 },
  { city: '布宜诺斯艾利斯', country: '阿根廷', top: 64, left: 29 },
];

// Travel tips that rotate daily
const TRAVEL_TIPS = [
  { icon: '🎒', title: '轻装出行', tip: '随身带一个可压缩收纳袋，脏衣服和干净衣服分开，省空间又卫生。' },
  { icon: '📱', title: '离线地图', tip: '出发前下载好Google Maps离线地图，没有网络也能导航不迷路。' },
  { icon: '💰', title: '省钱秘籍', tip: '用当地超市买早餐，比酒店早餐便宜5-10倍，还能体验当地人生活。' },
  { icon: '📷', title: '拍照技巧', tip: '黄金时段（日出后1小时/日落前1小时）拍照光线最柔美，避开正午强光。' },
  { icon: '🏨', title: '住宿选择', tip: '民宿比酒店更能体验当地文化，但看评价时重点关注"卫生"和"位置"两项。' },
  { icon: '🛂', title: '证件安全', tip: '护照拍照存手机+云盘，纸质复印件放不同行李箱。丢了不慌。' },
  { icon: '🍜', title: '美食发现', tip: '不要只看TripAdvisor——去当地菜市场和小巷子里找排队最多的店，那才是真好吃。' },
  { icon: '🚆', title: '交通攻略', tip: '欧洲买Eurail通票，日本买JR Pass，东南亚坐夜班巴士——省钱又省住宿。' },
  { icon: '🌞', title: '防晒必备', tip: '阴天也要涂防晒！紫外线穿云能力很强，高原和海边尤其需要注意。' },
  { icon: '🗣️', title: '语言沟通', tip: '学5句当地语言（你好/谢谢/多少钱/在哪/好吃）能打开90%的善意。' },
  { icon: '⏰', title: '时差调节', tip: '到达后立刻按当地时间作息，白天多晒太阳，帮助身体快速调整生物钟。' },
  { icon: '🧳', title: '打包技巧', tip: '卷衣服比叠衣服省空间30%，重物放箱底靠近轮子，易碎品用袜子包裹。' },
  { icon: '🚨', title: '安全提醒', tip: '贵重物品分开放——护照、现金、银行卡不要放在同一个包里。' },
  { icon: '🌿', title: '环保旅行', tip: '自带水壶和购物袋，减少一次性塑料。选择步行和骑行探索城市。' },
];

export default function TravelPage() {
  const { cities, visitedCities, showVisited, dailyRecommendation, countryKnowledge, isLoading, setShowVisited, toggleCity } = useTravel();
  const [selectedCity, setSelectedCity] = useState<typeof WORLD_CITIES[0] | null>(null);
  const [cityForm, setCityForm] = useState({ visitDate: '', feeling: '' });
  const [showPopup, setShowPopup] = useState(false);

  const handleCityClick = (wc: typeof WORLD_CITIES[0]) => {
    setSelectedCity(wc);
    const existing = cities.find(c => c.city === wc.city && c.country === wc.country);
    setCityForm({ visitDate: existing?.visitDate || '', feeling: existing?.feeling || '' });
    setShowPopup(true);
  };

  const handleSaveCity = async () => {
    if (!selectedCity) return;
    await toggleCity(
      { city: selectedCity.city, country: selectedCity.country, lat: selectedCity.top, lng: selectedCity.left },
      cityForm.visitDate || undefined, cityForm.feeling || undefined,
    );
    toast.success(`${selectedCity.city} 已标记！🗺️`);
    setShowPopup(false); setSelectedCity(null);
  };

  const handleRemoveCity = async () => {
    if (!selectedCity) return;
    await toggleCity({ city: selectedCity.city, country: selectedCity.country, lat: selectedCity.top, lng: selectedCity.left });
    setShowPopup(false); setSelectedCity(null);
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..." /></div>;

  const visitedSet = new Set(visitedCities.map(c => `${c.city}-${c.country}`));
  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip = TRAVEL_TIPS[dayIdx % TRAVEL_TIPS.length]!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#10b981' }}>
          <Map className="h-7 w-7" />旅行探索
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>探索世界 · 记录足迹 · 增长见识</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== COL 1-2: Map + Knowledge ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <div className="module-card overflow-hidden" style={{ '--module-accent': '#10b981' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0" style={{ '--module-accent': '#10b981' } as React.CSSProperties}>
                <Globe className="h-5 w-5" style={{ color: '#10b981' }} />世界地图
              </h2>
              <button onClick={() => setShowVisited(!showVisited)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: showVisited ? '#10b98118' : 'var(--color-surface-alt)',
                  color: showVisited ? '#059669' : 'var(--color-text-muted)',
                  border: showVisited ? '1px solid #10b98140' : '1px solid var(--color-border)',
                }}>
                {showVisited ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {showVisited ? '足迹模式' : '探索模式'}
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden" style={{ height: 400 }}>
              {/* Ocean gradient background */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(170deg, #0c4a6e 0%, #075985 15%, #0369a1 30%, #0284c7 50%, #0369a1 70%, #075985 85%, #0c4a6e 100%)',
              }} />

              {/* Continent shapes using SVG with realistic proportions */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                {/* North America */}
                <path d="M 120,80 Q 160,60 220,75 Q 270,85 290,120 Q 300,160 280,200 Q 260,230 230,260 Q 200,280 180,270 Q 150,260 130,230 Q 100,200 90,160 Q 85,120 120,80 Z" fill="#d1fae5" opacity="0.7" />
                <path d="M 230,260 Q 250,250 270,260 Q 285,280 280,300 Q 260,310 240,300 Q 220,290 230,260 Z" fill="#bbf7d0" opacity="0.6" />
                {/* Greenland */}
                <path d="M 250,40 Q 290,35 310,55 Q 315,80 295,90 Q 265,85 250,40 Z" fill="#d1fae5" opacity="0.6" />
                {/* South America */}
                <path d="M 230,280 Q 260,270 275,300 Q 285,340 280,380 Q 270,420 250,440 Q 230,450 220,430 Q 210,400 215,360 Q 210,320 230,280 Z" fill="#86efac" opacity="0.7" />
                {/* Europe */}
                <path d="M 440,65 Q 470,55 510,70 Q 530,85 540,110 Q 530,130 510,140 Q 480,145 460,130 Q 440,115 435,90 Q 440,65 Z" fill="#d1fae5" opacity="0.7" />
                {/* UK */}
                <ellipse cx="440" cy="85" rx="15" ry="25" fill="#bbf7d0" opacity="0.6" />
                {/* Iceland */}
                <ellipse cx="400" cy="40" rx="20" ry="12" fill="#bbf7d0" opacity="0.5" />
                {/* Africa */}
                <path d="M 460,150 Q 500,140 530,160 Q 550,190 555,230 Q 555,280 540,320 Q 520,350 500,370 Q 475,380 460,360 Q 445,330 440,290 Q 435,240 440,200 Q 450,170 460,150 Z" fill="#86efac" opacity="0.7" />
                {/* Middle East */}
                <path d="M 540,120 Q 570,110 600,120 Q 615,140 610,160 Q 590,165 570,155 Q 550,145 540,120 Z" fill="#d1fae5" opacity="0.5" />
                {/* Asia (main) */}
                <path d="M 540,50 Q 600,35 680,45 Q 750,55 800,80 Q 830,110 840,150 Q 835,190 810,210 Q 780,225 740,220 Q 700,215 670,200 Q 640,190 610,175 Q 580,160 560,130 Q 540,100 540,50 Z" fill="#d1fae5" opacity="0.7" />
                {/* India */}
                <path d="M 640,180 Q 670,170 685,200 Q 690,230 680,260 Q 665,275 650,260 Q 635,240 630,210 Q 635,190 640,180 Z" fill="#bbf7d0" opacity="0.6" />
                {/* Southeast Asia */}
                <path d="M 730,220 Q 760,210 780,230 Q 790,250 780,270 Q 760,280 740,270 Q 720,255 730,220 Z" fill="#bbf7d0" opacity="0.6" />
                {/* Japan */}
                <path d="M 830,95 Q 845,85 850,105 Q 848,125 835,135 Q 825,125 830,95 Z" fill="#bbf7d0" opacity="0.6" />
                {/* Australia */}
                <path d="M 790,320 Q 830,305 870,320 Q 890,345 880,375 Q 860,395 830,395 Q 800,385 790,360 Q 785,340 790,320 Z" fill="#6ee7b7" opacity="0.7" />
                {/* New Zealand */}
                <ellipse cx="900" cy="385" rx="10" ry="25" fill="#86efac" opacity="0.5" />

                {/* Subtle grid lines */}
                {[100, 200, 300, 400].map(y => (
                  <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                ))}
                {[200, 400, 600, 800].map(x => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                ))}
              </svg>

              {/* City markers */}
              {WORLD_CITIES.map(wc => {
                const isVisited = visitedSet.has(`${wc.city}-${wc.country}`);
                if (showVisited && !isVisited) return null;
                return (
                  <button key={`${wc.city}-${wc.country}`}
                    onClick={() => handleCityClick(wc)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                    style={{ left: `${wc.left}%`, top: `${wc.top}%` }}>
                    {isVisited ? (
                      <motion.div whileHover={{ scale: 1.4 }} className="relative">
                        <div className="relative">
                          <MapPin className="h-5 w-5 drop-shadow" style={{ color: '#ef4444', fill: '#ef4444' }} />
                          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[8px]">✓</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.4 }}
                        className="h-2 w-2 rounded-full ring-2 ring-white/70 shadow-sm"
                        style={{ background: '#fbbf24' }} />
                    )}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-4 text-[10px] font-medium whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded-lg pointer-events-none z-20
                      bg-white/90 backdrop-blur-sm shadow-md"
                      style={{ color: '#1e293b' }}>
                      {wc.city}{isVisited && ' ✅'}
                    </span>
                  </button>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-4 text-[10px] px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm"
                style={{ border: '1px solid rgba(255,255,255,0.5)' }}>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" style={{ color: '#ef4444' }} /> 已去过</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full" style={{ background: '#fbbf24' }} /> 可探索</span>
              </div>

              {/* Popup */}
              <AnimatePresence>
                {showPopup && selectedCity && (
                  <motion.div className="absolute top-3 right-3 w-72 p-4 rounded-xl z-20 shadow-xl"
                    style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0' }}
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold" style={{ color: '#1e293b' }}>📍 {selectedCity.city}, {selectedCity.country}</h4>
                      <button onClick={() => setShowPopup(false)} className="p-1 rounded-lg hover:bg-gray-100">
                        <X className="h-4 w-4" style={{ color: '#94a3b8' }} />
                      </button>
                    </div>
                    {showVisited ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-gray-500">到访日期</label>
                          <input type="date" value={cityForm.visitDate}
                            onChange={e => setCityForm(p => ({ ...p, visitDate: e.target.value }))}
                            className="input-field text-xs mt-0.5" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">当时感受</label>
                          <input type="text" value={cityForm.feeling}
                            onChange={e => setCityForm(p => ({ ...p, feeling: e.target.value }))}
                            placeholder="一句话记录感受..." className="input-field text-xs mt-0.5" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleSaveCity} className="btn-primary text-xs flex-1"
                            style={{ '--color-accent': '#10b981', '--color-accent-hover': '#059669' } as React.CSSProperties}>保存足迹</button>
                          {visitedSet.has(`${selectedCity.city}-${selectedCity.country}`) && (
                            <button onClick={handleRemoveCity} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500">删除</button>
                          )}
                        </div>
                      </div>
                    ) : (
                      visitedSet.has(`${selectedCity.city}-${selectedCity.country}`) ? (
                        <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">✅ 已去过 —— 开启足迹模式编辑</p>
                      ) : (
                        <p className="text-xs text-gray-500">开启足迹模式来标记目的地 ✈️</p>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Country Knowledge */}
          {countryKnowledge && (
            <div className="module-card" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
              <h2 className="section-title" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
                <Globe className="h-5 w-5" style={{ color: '#3b82f6' }} />
                今日国家地理：{countryKnowledge.flag} {countryKnowledge.country}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#3b82f6' }}>📖 历史人文</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{countryKnowledge.history}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#3b82f6' }}>🎭 文化特色</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{countryKnowledge.culture}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#3b82f6' }}>🗺️ 地理</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{countryKnowledge.geography}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#f59e0b' }}>🎯 冷知识</p>
                    <ul className="space-y-2">
                      {countryKnowledge.funFacts.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                          <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-4 text-xs p-3 rounded-xl" style={{ background: '#3b82f610' }}>
                    <span>🏙️ 首都：{countryKnowledge.capital}</span>
                    <span>👥 人口：{countryKnowledge.population}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== COL 3: Travel Rec + Tips + Visited ===== */}
        <div className="space-y-6">
          {/* Daily Travel Recommendation */}
          {dailyRecommendation && (
            <div className="module-card" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
              <h2 className="section-title" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
                <Plane className="h-5 w-5" style={{ color: '#f59e0b' }} />每日旅行推荐
              </h2>
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.06))', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#d97706' }}>{dailyRecommendation.destination}</h3>
                    <p className="text-xs" style={{ color: '#92400e' }}>{dailyRecommendation.country} · {dailyRecommendation.days}日游</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5"><Navigation className="h-3.5 w-3.5" style={{ color: '#f97316' }} /><span className="text-xs font-bold" style={{ color: '#f97316' }}>路线</span></div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{dailyRecommendation.route}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5"><Landmark className="h-3.5 w-3.5" style={{ color: '#6366f1' }} /><span className="text-xs font-bold" style={{ color: '#6366f1' }}>景点</span></div>
                      {dailyRecommendation.attractions.slice(0, 4).map((a, i) => (
                        <p key={i} className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>• {a}</p>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5"><UtensilsCrossed className="h-3.5 w-3.5" style={{ color: '#ef4444' }} /><span className="text-xs font-bold" style={{ color: '#ef4444' }}>美食</span></div>
                      {dailyRecommendation.food.map((f, i) => (
                        <p key={i} className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>• {f}</p>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5"><Trees className="h-3.5 w-3.5" style={{ color: '#22c55e' }} /><span className="text-xs font-bold" style={{ color: '#22c55e' }}>风光</span></div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{dailyRecommendation.scenery}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Travel Tip — fills the gap */}
          <div className="module-card" style={{ '--module-accent': '#06b6d4' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#06b6d4' } as React.CSSProperties}>
              <Compass className="h-5 w-5" style={{ color: '#06b6d4' }} />今日旅行小贴士
            </h2>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{todayTip.icon}</span>
                <h3 className="text-base font-bold" style={{ color: '#0891b2' }}>{todayTip.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{todayTip.tip}</p>
            </div>
          </div>

          {/* Visited Cities */}
          {visitedCities.length > 0 && (
            <div className="module-card" style={{ '--module-accent': '#ef4444' } as React.CSSProperties}>
              <h2 className="section-title" style={{ '--module-accent': '#ef4444' } as React.CSSProperties}>
                <MapPin className="h-5 w-5" style={{ color: '#ef4444' }} />我的足迹 ({visitedCities.length})
              </h2>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto scrollbar-hide">
                {visitedCities.map(city => (
                  <div key={city.id} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{city.city}</span>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{city.country}</span>
                      </div>
                      {city.visitDate && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>📅 {city.visitDate}</span>}
                      {city.feeling && <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-secondary)' }}>"{city.feeling}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
