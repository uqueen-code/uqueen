'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Newspaper, DollarSign, Plus, X, Trash2, Edit3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils/cn';
import { AssetType } from '@/types/enums';
import type { DailyFinanceInfo, PortfolioItem } from '@/types/models';

// ==================== Daily Finance Info ====================
interface DailyInfoProps {
  info: DailyFinanceInfo | null;
}
export function DailyFinanceCards({ info }: DailyInfoProps) {
  const { t } = useTranslation();
  if (!info) return null;

  return (
    <div className="space-y-4">
      {info.stockPick && (
        <div className="module-card" style={{ '--module-accent': '#eab308' } as React.CSSProperties}>
          <h3 className="section-title text-sm" style={{ '--module-accent': '#eab308' } as React.CSSProperties}>
            <TrendingUp className="h-4 w-4" style={{ color: '#eab308' }} />
            {t('finance.stockPick')}
          </h3>
          <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{info.stockPick.symbol}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#22c55e18', color: '#22c55e' }}>推荐</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{info.stockPick.name}</p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{info.stockPick.reason}</p>
          </div>
        </div>
      )}

      {info.fundPick && (
        <div className="module-card" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
          <h3 className="section-title text-sm" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
            <TrendingUp className="h-4 w-4" style={{ color: '#22c55e' }} />
            {t('finance.fundPick')}
          </h3>
          <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{info.fundPick.symbol} {info.fundPick.name}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{info.fundPick.reason}</p>
          </div>
        </div>
      )}

      <div className="module-card" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
        <h3 className="section-title text-sm" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
          <Newspaper className="h-4 w-4" style={{ color: '#3b82f6' }} />
          {t('finance.knowledgeTip')}
        </h3>
        <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' }}>
          {info.knowledgeTip}
        </p>
      </div>
    </div>
  );
}

// ==================== Portfolio Item Form ====================
interface AddItemFormProps {
  onAdd: (data: { symbol: string; name: string; type: AssetType; shares?: number; buyPrice?: number; buyDate?: string; notes?: string }) => Promise<void>;
  onClose: () => void;
}
function AddItemForm({ onAdd, onClose }: AddItemFormProps) {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>(AssetType.STOCK);
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!symbol.trim() || !name.trim()) return;
    setIsSubmitting(true);
    await onAdd({ symbol: symbol.trim(), name: name.trim(), type, shares: shares ? parseFloat(shares) : undefined, buyPrice: buyPrice ? parseFloat(buyPrice) : undefined });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="p-4 rounded-xl mb-3 animate-slide-down" style={{ background: 'var(--color-surface-alt)' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold" style={{ color: '#eab308' }}>{t('finance.addAsset')}</h4>
        <button onClick={onClose}><X className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="代码 (如 AAPL)" className="input-field text-sm" autoFocus />
        <select value={type} onChange={e => setType(e.target.value as AssetType)} className="input-field text-sm">
          <option value={AssetType.STOCK}>股票</option>
          <option value={AssetType.FUND}>基金</option>
          <option value={AssetType.ETF}>ETF</option>
        </select>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="名称" className="input-field text-sm col-span-2" />
        <input value={shares} onChange={e => setShares(e.target.value)} placeholder="持有数量" type="number" step="any" className="input-field text-sm" />
        <input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="买入价格" type="number" step="any" className="input-field text-sm" />
      </div>
      <button onClick={handleSubmit} disabled={isSubmitting || !symbol.trim() || !name.trim()}
        className="btn-primary w-full text-xs mt-2" style={{ '--color-accent': '#eab308', '--color-accent-hover': '#ca8a04' } as React.CSSProperties}>
        {t('common.add')}
      </button>
    </div>
  );
}

// ==================== Portfolio Manager ====================
interface PortfolioManagerProps {
  items: PortfolioItem[];
  stats: { totalCost: number; totalValue: number; totalPL: number; totalPLPercent: number; count: number };
  chartData: { date: string; value: number; cost: number }[];
  onAdd: (data: { symbol: string; name: string; type: AssetType; shares?: number; buyPrice?: number; buyDate?: string; notes?: string }) => Promise<void>;
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
export function PortfolioManager({ items, stats, chartData, onAdd, onUpdatePrice, onDelete }: PortfolioManagerProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="module-card h-full" style={{ '--module-accent': '#eab308' } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0" style={{ '--module-accent': '#eab308' } as React.CSSProperties}>
          <DollarSign className="h-5 w-5" style={{ color: '#eab308' }} />
          {t('finance.portfolio')}
        </h2>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-primary text-xs px-3 py-1.5"
          style={{ '--color-accent': '#eab308', '--color-accent-hover': '#ca8a04' } as React.CSSProperties}>
          <Plus className="h-3.5 w-3.5 inline mr-1" />{t('finance.addAsset')}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: t('finance.totalValue'), value: `¥${stats.totalValue.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`, color: '#22c55e' },
          { label: t('finance.profitLoss'), value: `${stats.totalPL >= 0 ? '+' : ''}¥${stats.totalPL.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`, color: stats.totalPL >= 0 ? '#22c55e' : '#ef4444' },
          { label: '持仓数', value: `${stats.count}`, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--color-surface-alt)' }}>
            <p className="text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Asset Chart */}
      {chartData.length > 0 && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>资产走势（近30日模拟）</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} width={50} tickFormatter={(v: number) => `¥${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#eab308" strokeWidth={2} fill="url(#colorValue)" />
              <Line type="monotone" dataKey="cost" stroke="var(--color-text-muted)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ background: '#eab308' }} /></span>市值
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{ background: 'var(--color-text-muted)', borderTop: '1px dashed' }} /></span>成本
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && <AddItemForm onAdd={onAdd} onClose={() => setShowForm(false)} />}

      {/* Portfolio list */}
      {items.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>添加自选/持仓以查看资产走势</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-hide">
          {items.map(item => {
            const cost = (item.buyPrice ?? 0) * (item.shares ?? 0);
            const value = (item.currentPrice ?? item.buyPrice ?? 0) * (item.shares ?? 0);
            const pl = value - cost;
            const plPct = cost > 0 ? (pl / cost) * 100 : 0;
            return (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg group transition-all" style={{ background: 'var(--color-surface-alt)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{item.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: item.type === AssetType.STOCK ? '#eab30818' : item.type === AssetType.FUND ? '#22c55e18' : '#3b82f618', color: item.type === AssetType.STOCK ? '#ca8a04' : item.type === AssetType.FUND ? '#16a34a' : '#2563eb' }}>
                      {item.type === AssetType.STOCK ? '股' : item.type === AssetType.FUND ? '基' : 'ETF'}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>¥{value.toFixed(2)}</p>
                  <p className={cn('text-xs', pl >= 0 ? '' : '')} style={{ color: pl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {pl >= 0 ? '+' : ''}{plPct.toFixed(2)}%
                  </p>
                </div>
                <button onClick={() => onDelete(item.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#ef4444' }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
