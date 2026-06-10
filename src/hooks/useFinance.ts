'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getTodayString } from '@/lib/utils/date';
import { AssetType } from '@/types/enums';
import type { PortfolioItem, DailyFinanceInfo } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

// Mock daily finance info
const FINANCE_TIPS = [
  '复利是世界第八大奇迹。每月定投1000元，年化10%，30年后你将拥有约226万元。',
  '不要把鸡蛋放在一个篮子里。资产配置是投资中最重要的事，建议股票+债券+现金组合。',
  '定期再平衡你的投资组合，每年1-2次即可。这能帮助你在高位卖出、低位买入。',
  '指数基金是普通投资者最好的朋友。巴菲特曾多次推荐标普500指数基金。',
  '投资的第一原则是不要亏钱，第二原则是记住第一条。——巴菲特',
  '市场短期是投票机，长期是称重机。关注企业价值，而非短期波动。',
  '定投是应对市场波动的最佳策略。无论涨跌都按计划买入，平均成本，平滑风险。',
  '紧急备用金应覆盖3-6个月的生活开支，放在流动性好的地方。',
];

const STOCK_PICKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', reason: '服务业务持续高增长，Vision Pro开辟新赛道，现金流充沛。' },
  { symbol: 'MSFT', name: 'Microsoft', reason: 'AI Copilot全面集成，云服务Azure增长强劲，企业护城河深厚。' },
  { symbol: '0700.HK', name: '腾讯控股', reason: '游戏版号常态化，视频号商业化加速，估值处于历史低位。' },
  { symbol: '600519.SH', name: '贵州茅台', reason: '品牌壁垒深厚，直销比例提升，长期增长确定性高。' },
];

const FUND_PICKS = [
  { symbol: '510300', name: '沪深300ETF', reason: '估值处于历史中低位，大盘蓝筹代表，适合长期定投。' },
  { symbol: '159915', name: '创业板ETF', reason: '科技创新驱动，高成长性，适合风险承受能力较强的投资者。' },
];

function getDayIndex(): number {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

export function useFinance() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [dailyInfo, setDailyInfo] = useState<DailyFinanceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;
  const today = getTodayString();
  const dayIdx = getDayIndex();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const [items, info] = await Promise.all([
        db.portfolioItems.where('userId').equals(userId).toArray(),
        db.financeInfo.where('date').equals(today).first(),
      ]);

      setPortfolio(items.map(i => ({
        id: i.id, userId: i.userId, symbol: i.symbol, name: i.name,
        type: i.type as AssetType, shares: i.shares, buyPrice: i.buyPrice,
        buyDate: i.buyDate, currentPrice: i.currentPrice, notes: i.notes,
        createdAt: i.createdAt, updatedAt: i.updatedAt,
      })));

      if (info) {
        setDailyInfo({ id: info.id, date: info.date, stockPick: info.stockPick as DailyFinanceInfo['stockPick'], fundPick: info.fundPick as DailyFinanceInfo['fundPick'], knowledgeTip: info.knowledgeTip });
      } else {
        const mock: DailyFinanceInfo = {
          id: `fin_${today}`, date: today,
          stockPick: STOCK_PICKS[dayIdx % STOCK_PICKS.length]!,
          fundPick: FUND_PICKS[dayIdx % FUND_PICKS.length]!,
          knowledgeTip: FINANCE_TIPS[dayIdx % FINANCE_TIPS.length]!,
        };
        await db.financeInfo.put(mock);
        setDailyInfo(mock);
      }
    } catch { /* */ }
    finally { setIsLoading(false); }
  }, [userId, today, dayIdx]);

  useEffect(() => { loadData(); }, [loadData]);

  // Add portfolio item
  const addItem = useCallback(async (data: {
    symbol: string; name: string; type: AssetType;
    shares?: number; buyPrice?: number; buyDate?: string; notes?: string;
  }): Promise<PortfolioItem> => {
    const id = crypto.randomUUID?.() ?? `pf_${Date.now()}`;
    const now = new Date().toISOString();
    const item: PortfolioItem = {
      id, userId, symbol: data.symbol, name: data.name, type: data.type,
      shares: data.shares ?? null, buyPrice: data.buyPrice ?? null,
      buyDate: data.buyDate ?? null, currentPrice: data.buyPrice ?? null,
      notes: data.notes ?? null, createdAt: now, updatedAt: now,
    };
    const db = getDatabase();
    await db.portfolioItems.put({ ...item, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'portfolio_items', operation: 'insert', recordId: id, data: item as unknown as Record<string, unknown> });
    setPortfolio(prev => [...prev, item]);
    return item;
  }, [userId, addToSyncQueue]);

  // Update current price
  const updatePrice = useCallback(async (id: string, price: number) => {
    const db = getDatabase();
    await db.portfolioItems.update(id, { currentPrice: price, updatedAt: new Date().toISOString(), _synced: false, _modifiedAt: Date.now() });
    setPortfolio(prev => prev.map(i => i.id === id ? { ...i, currentPrice: price, updatedAt: new Date().toISOString() } : i));
  }, []);

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.portfolioItems.delete(id);
    addToSyncQueue({ table: 'portfolio_items', operation: 'delete', recordId: id, data: {} });
    setPortfolio(prev => prev.filter(i => i.id !== id));
  }, [addToSyncQueue]);

  // Calculate totals
  const stats = useMemo(() => {
    const totalCost = portfolio.reduce((s, i) => s + ((i.buyPrice ?? 0) * (i.shares ?? 0)), 0);
    const totalValue = portfolio.reduce((s, i) => s + ((i.currentPrice ?? i.buyPrice ?? 0) * (i.shares ?? 0)), 0);
    const totalPL = totalValue - totalCost;
    const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
    return { totalCost, totalValue, totalPL, totalPLPercent, count: portfolio.length };
  }, [portfolio]);

  // Generate chart data (mock historical values for simplicity)
  const chartData = useMemo(() => {
    if (portfolio.length === 0) return [];
    const data: { date: string; value: number; cost: number }[] = [];
    const baseValue = stats.totalCost || 10000;
    for (let i = 30; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const noise = (Math.random() - 0.45) * (baseValue * 0.03);
      const value = baseValue + (30 - i) * (stats.totalPL / 30 || 0) + noise;
      data.push({
        date: d.toISOString().split('T')[0]!,
        value: Math.max(0, Math.round(value * 100) / 100),
        cost: Math.round(baseValue * 100) / 100,
      });
    }
    return data;
  }, [portfolio.length, stats.totalCost, stats.totalPL]);

  return {
    portfolio, dailyInfo, stats, chartData, isLoading,
    addItem, updatePrice, deleteItem, refresh: loadData,
  };
}
