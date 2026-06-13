'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Map, Globe, MapPin, Plane, UtensilsCrossed, Landmark, Trees,
  X, Navigation, Sparkles, Compass, Camera, Star, BookOpen,
  ZoomIn, ZoomOut, RotateCcw, Footprints, Telescope, Edit3, Trash2,
} from 'lucide-react';
import { useTravel } from '@/hooks/useTravel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ────────────────────────────────────────────────────
// World cities with coordinates (on 1000×500 viewBox)
// ────────────────────────────────────────────────────
const WORLD_CITIES = [
  { city: '北京', country: '中国', top: 24, left: 72 },
  { city: '上海', country: '中国', top: 30, left: 76 },
  { city: '成都', country: '中国', top: 28, left: 67 },
  { city: '广州', country: '中国', top: 32, left: 73 },
  { city: '深圳', country: '中国', top: 33, left: 74 },
  { city: '香港', country: '中国', top: 34, left: 74.5 },
  { city: '台北', country: '中国', top: 30, left: 78 },
  { city: '拉萨', country: '中国', top: 25, left: 62 },
  { city: '西安', country: '中国', top: 25, left: 69 },
  { city: '东京', country: '日本', top: 26, left: 84 },
  { city: '京都', country: '日本', top: 27, left: 82 },
  { city: '大阪', country: '日本', top: 28, left: 83 },
  { city: '首尔', country: '韩国', top: 22, left: 80 },
  { city: '釜山', country: '韩国', top: 24, left: 81 },
  { city: '新加坡', country: '新加坡', top: 42, left: 75 },
  { city: '曼谷', country: '泰国', top: 36, left: 73 },
  { city: '清迈', country: '泰国', top: 32, left: 72 },
  { city: '普吉岛', country: '泰国', top: 40, left: 71 },
  { city: '胡志明市', country: '越南', top: 37, left: 76 },
  { city: '河内', country: '越南', top: 32, left: 75 },
  { city: '吉隆坡', country: '马来西亚', top: 41, left: 74 },
  { city: '巴厘岛', country: '印尼', top: 48, left: 78 },
  { city: '马尼拉', country: '菲律宾', top: 34, left: 79 },
  { city: '伦敦', country: '英国', top: 16, left: 46 },
  { city: '巴黎', country: '法国', top: 18, left: 47 },
  { city: '罗马', country: '意大利', top: 20, left: 50 },
  { city: '巴塞罗那', country: '西班牙', top: 21, left: 44 },
  { city: '柏林', country: '德国', top: 16, left: 50 },
  { city: '阿姆斯特丹', country: '荷兰', top: 15, left: 48 },
  { city: '布拉格', country: '捷克', top: 17, left: 51 },
  { city: '维也纳', country: '奥地利', top: 18, left: 51.5 },
  { city: '莫斯科', country: '俄罗斯', top: 10, left: 56 },
  { city: '圣彼得堡', country: '俄罗斯', top: 8, left: 55 },
  { city: '伊斯坦布尔', country: '土耳其', top: 22, left: 55 },
  { city: '纽约', country: '美国', top: 21, left: 22 },
  { city: '洛杉矶', country: '美国', top: 25, left: 13 },
  { city: '旧金山', country: '美国', top: 22, left: 11 },
  { city: '芝加哥', country: '美国', top: 20, left: 20 },
  { city: '温哥华', country: '加拿大', top: 14, left: 10 },
  { city: '多伦多', country: '加拿大', top: 18, left: 24 },
  { city: '墨西哥城', country: '墨西哥', top: 30, left: 18 },
  { city: '悉尼', country: '澳大利亚', top: 60, left: 86 },
  { city: '墨尔本', country: '澳大利亚', top: 62, left: 84 },
  { city: '开普敦', country: '南非', top: 65, left: 54 },
  { city: '开罗', country: '埃及', top: 28, left: 54 },
  { city: '雷克雅未克', country: '冰岛', top: 7, left: 40 },
  { city: '迪拜', country: '阿联酋', top: 32, left: 60 },
  { city: '新德里', country: '印度', top: 30, left: 66 },
  { city: '孟买', country: '印度', top: 33, left: 64.5 },
  { city: '里约热内卢', country: '巴西', top: 54, left: 32 },
  { city: '布宜诺斯艾利斯', country: '阿根廷', top: 64, left: 29 },
  { city: '圣地亚哥', country: '智利', top: 62, left: 27 },
  { city: '利马', country: '秘鲁', top: 48, left: 25 },
  { city: '内罗毕', country: '肯尼亚', top: 46, left: 55.5 },
  { city: '马拉喀什', country: '摩洛哥', top: 26, left: 44 },
];

// ────────────────────────────────────────────────────
// Travel tips
// ────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────
// Map Popup Card
// ────────────────────────────────────────────────────
function CityPopupCard({
  city,
  isVisited,
  existingData,
  mode,
  onSave,
  onUpdate,
  onDelete,
  onClose,
  onToggleMode,
}: {
  city: typeof WORLD_CITIES[0];
  isVisited: boolean;
  existingData: { visitDate: string | null; feeling: string | null; id?: string };
  mode: 'explore' | 'footprint';
  onSave: (visitDate: string, feeling: string) => void;
  onUpdate: (visitDate: string, feeling: string) => void;
  onDelete: () => void;
  onClose: () => void;
  onToggleMode: () => void;
}) {
  const [visitDate, setVisitDate] = useState(existingData.visitDate || '');
  const [feeling, setFeeling] = useState(existingData.feeling || '');
  const [isEditing, setIsEditing] = useState(!isVisited && mode === 'footprint');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!visitDate) { toast.error('请选择到访日期'); return; }
    setIsSaving(true);
    try {
      if (isVisited && existingData.id) {
        await onUpdate(visitDate, feeling);
      } else {
        await onSave(visitDate, feeling);
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="absolute top-3 right-3 w-80 p-5 rounded-2xl z-30 shadow-2xl"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.8)',
      }}
      initial={{ opacity: 0, scale: 0.85, y: -15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -15 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold" style={{ color: '#1e293b' }}>{city.city}</h4>
            <p className="text-[10px]" style={{ color: '#64748b' }}>{city.country}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <X className="h-4 w-4" style={{ color: '#94a3b8' }} />
        </button>
      </div>

      {/* Content based on mode & visit status */}
      {mode === 'explore' && !isVisited ? (
        <div className="text-center py-4">
          <motion.div
            className="text-4xl mb-3"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🔭
          </motion.div>
          <p className="text-sm font-medium mb-1" style={{ color: '#64748b' }}>
            你还没有去过{city.city}
          </p>
          <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
            切换到"足迹模式"来标记你的旅行记忆 ✈️
          </p>
          <button
            onClick={onToggleMode}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Footprints className="h-3.5 w-3.5" />
              开启足迹模式
            </span>
          </button>
        </div>
      ) : mode === 'footprint' && isVisited && !isEditing ? (
        /* Read-only view — show existing visit */
        <div className="space-y-3">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📅</span>
              <span className="text-xs font-bold" style={{ color: '#059669' }}>到访日期</span>
            </div>
            <p className="text-sm font-medium ml-7" style={{ color: '#1e293b' }}>
              {existingData.visitDate || '未记录'}
            </p>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💭</span>
              <span className="text-xs font-bold" style={{ color: '#d97706' }}>当时感受</span>
            </div>
            <p className="text-sm leading-relaxed ml-7 italic" style={{ color: '#475569' }}>
              {existingData.feeling || '未记录'}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: 'rgba(16,185,129,0.1)',
                color: '#059669',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <Edit3 className="h-3 w-3" />编辑
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: 'rgba(239,68,68,0.06)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <Trash2 className="h-3 w-3" />删除
            </button>
          </div>
        </div>
      ) : (
        /* Edit / Add mode */
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold mb-1.5 block" style={{ color: '#64748b' }}>
              📅 到访日期
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-emerald-400"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold mb-1.5 block" style={{ color: '#64748b' }}>
              💭 一句话感受
            </label>
            <input
              type="text"
              value={feeling}
              onChange={e => setFeeling(e.target.value)}
              placeholder="那一刻，我心里在想……"
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-emerald-400"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            {feeling.length > 0 && (
              <p className="text-[9px] mt-1 text-right" style={{ color: 'var(--color-text-muted)' }}>
                {feeling.length}/100
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isSaving || !visitDate}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {isSaving ? '保存中...' : isVisited ? '💾 更新足迹' : '📍 标记足迹'}
            </button>
            {isVisited && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: 'var(--color-surface-alt)',
                  color: 'var(--color-text-muted)',
                }}
              >
                取消
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────
// Main Travel Page
// ────────────────────────────────────────────────────
export default function TravelPage() {
  const {
    cities, visitedCities, showVisited, dailyRecommendation, countryKnowledge,
    isLoading, setShowVisited, toggleCity, updateCityVisit,
  } = useTravel();

  const [selectedCity, setSelectedCity] = useState<typeof WORLD_CITIES[0] | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Pan and zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const minZoom = 0.7;
  const maxZoom = 3;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(maxZoom, Math.max(minZoom, z + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleCityClick = (wc: typeof WORLD_CITIES[0]) => {
    setSelectedCity(wc);
    setShowPopup(true);
  };

  const handleSaveCity = async (visitDate: string, feeling: string) => {
    if (!selectedCity) return;
    await toggleCity(
      { city: selectedCity.city, country: selectedCity.country, lat: selectedCity.top, lng: selectedCity.left },
      visitDate, feeling,
    );
    toast.success(`${selectedCity.city} 已标记！🗺️`, { duration: 2000 });
    setShowPopup(false);
    setSelectedCity(null);
  };

  const handleUpdateCity = async (visitDate: string, feeling: string) => {
    if (!selectedCity) return;
    const existing = cities.find(
      c => c.city === selectedCity.city && c.country === selectedCity.country
    );
    if (existing?.id) {
      await updateCityVisit(existing.id, visitDate, feeling);
      toast.success('足迹已更新 ✨', { duration: 2000 });
    }
  };

  const handleDeleteCity = async () => {
    if (!selectedCity) return;
    await toggleCity({
      city: selectedCity.city, country: selectedCity.country,
      lat: selectedCity.top, lng: selectedCity.left,
    });
    toast.success('足迹已删除', { duration: 2000 });
    setShowPopup(false);
    setSelectedCity(null);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const visitedSet = new Set(visitedCities.map(c => `${c.city}-${c.country}`));
  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip = TRAVEL_TIPS[dayIdx % TRAVEL_TIPS.length]!;

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载中..." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#10b981' }}>
          <Map className="h-7 w-7" />旅行探索
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>探索世界 · 记录足迹 · 增长见识</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── COL 1-2: Map + Knowledge ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── World Map Card ── */}
          <div className="module-card overflow-hidden" style={{ '--module-accent': '#10b981' } as React.CSSProperties}>
            {/* Header with toggle */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="section-title mb-0" style={{ '--module-accent': '#10b981' } as React.CSSProperties}>
                <Globe className="h-5 w-5" style={{ color: '#10b981' }} />
                {showVisited ? '足迹点亮 · 世界航海图' : '白纸探索 · 世界航海图'}
              </h2>

              <div className="flex items-center gap-2">
                {/* Mode toggle */}
                <button
                  onClick={() => setShowVisited(!showVisited)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    background: showVisited
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))'
                      : 'var(--color-surface-alt)',
                    color: showVisited ? '#059669' : 'var(--color-text-muted)',
                    border: showVisited
                      ? '1.5px solid rgba(16,185,129,0.4)'
                      : '1.5px solid var(--color-border)',
                  }}
                >
                  {showVisited ? (
                    <>
                      <Footprints className="h-4 w-4" />
                      足迹点亮模式
                    </>
                  ) : (
                    <>
                      <Telescope className="h-4 w-4" />
                      白纸探索模式
                    </>
                  )}
                </button>

                {/* Zoom controls */}
                <div className="flex items-center gap-1 p-1 rounded-full"
                  style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => setZoom(z => Math.min(maxZoom, z + 0.2))}
                    className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
                    title="放大"
                  >
                    <ZoomIn className="h-3.5 w-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                  <button
                    onClick={() => setZoom(z => Math.max(minZoom, z - 0.2))}
                    className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
                    title="缩小"
                  >
                    <ZoomOut className="h-3.5 w-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                  <button
                    onClick={handleResetView}
                    className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
                    title="重置视图"
                  >
                    <RotateCcw className="h-3.5 w-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Map container */}
            <div
              ref={mapContainerRef}
              className="relative rounded-2xl overflow-hidden select-none"
              style={{
                height: 460,
                cursor: isPanning ? 'grabbing' : 'grab',
                background: showVisited
                  ? 'linear-gradient(170deg, #0c4a6e 0%, #075985 15%, #0f766e 35%, #0d9488 50%, #0f766e 65%, #075985 85%, #0c4a6e 100%)'
                  : 'linear-gradient(170deg, #1e293b 0%, #334155 15%, #475569 35%, #64748b 50%, #475569 65%, #334155 85%, #1e293b 100%)',
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Transform layer */}
              <div
                className="absolute inset-0 transition-transform duration-75"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'center center',
                }}
              >
                {/* SVG World Map */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                  {/* ── Grid lines (lat/lon) ── */}
                  {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map(y => (
                    <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y}
                      stroke={showVisited ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)'}
                      strokeWidth="1" strokeDasharray="4 8" />
                  ))}
                  {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(x => (
                    <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500"
                      stroke={showVisited ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)'}
                      strokeWidth="1" strokeDasharray="4 8" />
                  ))}
                  {/* Equator */}
                  <line x1="0" y1="250" x2="1000" y2="250"
                    stroke={showVisited ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}
                    strokeWidth="1.5" strokeDasharray="2 6" />

                  {/* ── Continents ── */}
                  <g opacity={showVisited ? 0.85 : 0.35}>
                    {/* North America */}
                    <path d="M 65 130 Q 80 85 110 65 Q 150 45 190 50 Q 230 55 260 75 Q 285 90 295 125 Q 300 160 290 195 Q 280 225 255 255 Q 230 275 210 280 Q 180 275 160 260 Q 135 240 110 225 Q 85 200 75 170 Z"
                      fill={showVisited ? '#a7f3d0' : '#94a3b8'} opacity={showVisited ? 0.8 : 0.6} />
                    {/* Greenland */}
                    <path d="M 270 35 Q 320 28 340 50 Q 345 75 325 90 Q 295 95 275 80 Q 265 60 270 35 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.7 : 0.5} />
                    {/* Central America */}
                    <path d="M 215 280 Q 230 290 240 310 Q 245 325 235 340 Q 225 335 215 320 Q 208 300 215 280 Z"
                      fill={showVisited ? '#86efac' : '#94a3b8'} opacity={showVisited ? 0.75 : 0.55} />

                    {/* South America */}
                    <path d="M 225 340 Q 260 330 280 360 Q 290 395 285 430 Q 275 455 260 470 Q 245 478 230 470 Q 218 455 212 430 Q 208 400 212 370 Z"
                      fill={showVisited ? '#6ee7b7' : '#64748b'} opacity={showVisited ? 0.8 : 0.6} />

                    {/* Europe */}
                    <path d="M 435 85 Q 465 70 500 75 Q 530 80 545 100 Q 555 120 545 140 Q 525 155 500 162 Q 475 165 455 155 Q 440 145 432 125 Q 428 105 435 85 Z"
                      fill={showVisited ? '#a7f3d0' : '#94a3b8'} opacity={showVisited ? 0.8 : 0.6} />
                    {/* UK & Ireland */}
                    <ellipse cx="430" cy="95" rx="14" ry="22" fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.65 : 0.5} />
                    {/* Scandinavia */}
                    <path d="M 455 55 Q 480 35 510 45 Q 530 55 535 70 Q 520 75 500 72 Q 475 68 455 55 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.7 : 0.5} />
                    {/* Iceland */}
                    <ellipse cx="400" cy="48" rx="18" ry="10" fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.55 : 0.4} />

                    {/* Africa */}
                    <path d="M 465 165 Q 500 150 540 160 Q 565 175 575 210 Q 580 255 575 300 Q 565 335 545 360 Q 525 378 500 382 Q 480 380 465 360 Q 450 335 445 290 Q 440 240 445 200 Q 450 180 465 165 Z"
                      fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.8 : 0.6} />
                    {/* Madagascar */}
                    <path d="M 590 340 Q 600 335 605 350 Q 600 365 592 360 Q 585 350 590 340 Z"
                      fill={showVisited ? '#6ee7b7' : '#64748b'} opacity={showVisited ? 0.7 : 0.5} />

                    {/* Middle East / Arabian Peninsula */}
                    <path d="M 555 130 Q 585 118 615 130 Q 630 148 625 168 Q 610 178 585 172 Q 565 165 555 148 Z"
                      fill={showVisited ? '#a7f3d0' : '#94a3b8'} opacity={showVisited ? 0.7 : 0.5} />

                    {/* Asia (main landmass) */}
                    <path d="M 545 60 Q 600 35 680 38 Q 760 42 820 65 Q 855 90 865 130 Q 870 170 850 200 Q 825 225 780 230 Q 730 235 685 225 Q 645 215 615 195 Q 585 175 565 145 Q 545 115 545 60 Z"
                      fill={showVisited ? '#a7f3d0' : '#94a3b8'} opacity={showVisited ? 0.8 : 0.6} />
                    {/* India */}
                    <path d="M 645 185 Q 678 172 700 195 Q 710 225 700 255 Q 685 275 663 265 Q 643 248 638 220 Q 635 200 645 185 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.7 : 0.55} />
                    {/* Southeast Asia */}
                    <path d="M 735 225 Q 770 215 795 230 Q 810 250 800 270 Q 780 282 755 275 Q 735 262 725 245 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.7 : 0.55} />
                    {/* Indonesia / Malay Archipelago */}
                    <path d="M 780 280 Q 795 272 810 280 Q 820 290 815 298 Q 800 305 785 298 Q 775 290 780 280 Z"
                      fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.65 : 0.5} />
                    <path d="M 810 285 Q 825 280 835 288 Q 838 298 828 305 Q 815 302 810 285 Z"
                      fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.65 : 0.5} />
                    <path d="M 835 290 Q 850 285 858 295 Q 855 305 842 305 Q 832 300 835 290 Z"
                      fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.65 : 0.5} />
                    {/* Japan */}
                    <path d="M 838 85 Q 858 70 865 90 Q 868 112 855 130 Q 845 135 835 125 Q 830 108 838 85 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.7 : 0.55} />
                    {/* Philippines */}
                    <path d="M 818 208 Q 825 200 830 215 Q 828 228 820 225 Q 815 215 818 208 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.6 : 0.5} />
                    {/* Sri Lanka */}
                    <ellipse cx="670" cy="275" rx="5" ry="8" fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.6 : 0.5} />
                    {/* Korean Peninsula */}
                    <path d="M 808 72 Q 815 65 822 72 Q 825 85 820 98 Q 815 102 810 95 Q 805 82 808 72 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.65 : 0.5} />
                    {/* Taiwan */}
                    <ellipse cx="820" cy="155" rx="5" ry="8" fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.65 : 0.5} />
                    {/* Hainan */}
                    <ellipse cx="792" cy="185" rx="5" ry="6" fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.6 : 0.5} />

                    {/* Australia */}
                    <path d="M 790 330 Q 830 315 875 325 Q 905 340 895 375 Q 875 400 845 405 Q 810 402 790 385 Q 778 360 790 330 Z"
                      fill={showVisited ? '#6ee7b7' : '#64748b'} opacity={showVisited ? 0.8 : 0.6} />
                    {/* New Zealand */}
                    <ellipse cx="910" cy="395" rx="8" ry="22" fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.55 : 0.4} />
                    {/* Tasmania */}
                    <ellipse cx="865" cy="408" rx="10" ry="6" fill={showVisited ? '#86efac' : '#64748b'} opacity={showVisited ? 0.55 : 0.4} />
                    {/* Papua New Guinea */}
                    <path d="M 795 295 Q 815 285 835 290 Q 842 300 835 308 Q 815 310 800 302 Z"
                      fill={showVisited ? '#bbf7d0' : '#94a3b8'} opacity={showVisited ? 0.6 : 0.5} />

                    {/* Antarctica hint */}
                    <path d="M 100 478 Q 250 468 400 472 Q 550 465 700 470 Q 850 465 950 475"
                      fill="none" stroke={showVisited ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
                      strokeWidth="3" strokeLinecap="round" />
                  </g>

                  {/* ── Compass Rose (decorative) ── */}
                  <g transform="translate(930, 70)">
                    <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                    <line x1="0" y1="-20" x2="0" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <polygon points="0,-18 -4,-4 0,-8 4,-4" fill="rgba(255,255,255,0.3)" />
                    <polygon points="0,18 -4,4 0,8 4,4" fill="rgba(255,255,255,0.15)" />
                    <text x="0" y="-23" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="bold">N</text>
                  </g>

                  {/* ── City Markers ── */}
                  {WORLD_CITIES.map(wc => {
                    const isVisited = visitedSet.has(`${wc.city}-${wc.country}`);
                    const isSelected = selectedCity?.city === wc.city && selectedCity?.country === wc.country;

                    // In explore mode, show all cities as neutral dots
                    // In footprint mode, only show visited cities
                    if (showVisited && !isVisited) return null;

                    if (!showVisited) {
                      // Explore mode: subtle neutral markers
                      return (
                        <g key={`${wc.city}-${wc.country}`}
                          className="cursor-pointer"
                          onClick={() => handleCityClick(wc)}
                          transform={`translate(${wc.left * 10}, ${wc.top * 10})`}
                        >
                          <circle cx="0" cy="0" r="3.5" fill="rgba(255,255,255,0.3)"
                            stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                          {isSelected && (
                            <circle cx="0" cy="0" r="8" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="1.5">
                              <animate attributeName="r" from="8" to="15" dur="1.5s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                          )}
                        </g>
                      );
                    }

                    // Footprint mode: glowing warm markers
                    return (
                      <g key={`${wc.city}-${wc.country}`}
                        className="cursor-pointer"
                        onClick={() => handleCityClick(wc)}
                        transform={`translate(${wc.left * 10}, ${wc.top * 10})`}
                      >
                        {/* Glow ring */}
                        <circle cx="0" cy="0" r="12" fill="rgba(251,191,36,0.15)">
                          <animate attributeName="r" from="10" to="16" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.25" to="0.05" dur="2s" repeatCount="indefinite" />
                        </circle>
                        {/* Pin body */}
                        <path d="M -4 -6 Q 0 -10 4 -6 L 6 4 Q 3 9 0 10 Q -3 9 -6 4 Z"
                          fill="url(#pinGrad)" stroke="white" strokeWidth="1" />
                        {/* Pin highlight */}
                        <circle cx="-1.5" cy="-3" r="1.5" fill="rgba(255,255,255,0.6)" />
                        {/* Inner dot */}
                        <circle cx="0" cy="2" r="2" fill="white" opacity="0.9" />

                        {/* Selected pulse */}
                        {isSelected && (
                          <circle cx="0" cy="0" r="8" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.7">
                            <animate attributeName="r" from="8" to="18" dur="1.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.7" to="0" dur="1.2s" repeatCount="indefinite" />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* ── Pin gradient definition ── */}
                  <defs>
                    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* ── Map Overlays ── */}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] px-4 py-2.5 rounded-xl shadow-lg"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}>
                {showVisited ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} /> 已点亮足迹
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs">{visitedCities.length}</span> 个目的地
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ background: 'rgba(255,255,255,0.5)' }} /> 待探索城市
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs">{WORLD_CITIES.length}</span> 个可选目的地
                    </span>
                  </>
                )}
              </div>

              {/* Zoom level indicator */}
              <div className="absolute bottom-4 right-4 text-[10px] px-2.5 py-1 rounded-full shadow-md"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(8px)',
                  color: '#64748b',
                }}>
                {Math.round(zoom * 100)}%
              </div>

              {/* ── Popup Card ── */}
              <AnimatePresence>
                {showPopup && selectedCity && (
                  <CityPopupCard
                    city={selectedCity}
                    isVisited={visitedSet.has(`${selectedCity.city}-${selectedCity.country}`)}
                    existingData={(() => {
                      const existing = cities.find(
                        c => c.city === selectedCity.city && c.country === selectedCity.country
                      );
                      return {
                        visitDate: existing?.visitDate || null,
                        feeling: existing?.feeling || null,
                        id: existing?.id,
                      };
                    })()}
                    mode={showVisited ? 'footprint' : 'explore'}
                    onSave={handleSaveCity}
                    onUpdate={handleUpdateCity}
                    onDelete={handleDeleteCity}
                    onClose={() => { setShowPopup(false); setSelectedCity(null); }}
                    onToggleMode={() => setShowVisited(true)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Country Knowledge ── */}
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

        {/* ── COL 3: Sidebar ── */}
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

          {/* Travel Tip */}
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

          {/* Visited Cities List */}
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
