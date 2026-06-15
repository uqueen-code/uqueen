'use client';

import { Landmark } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useHabits } from '@/hooks/useHabits';
import { DailyFinanceCards, PortfolioManager } from '@/components/finance/FinanceWidgets';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory } from '@/types/enums';
import toast from 'react-hot-toast';

export default function FinancePage() {
  const {
    portfolio, dailyInfo, stats, chartData, isLoading,
    addItem, updatePrice, deleteItem,
  } = useFinance();
  const { habits, toggleHabit } = useHabits();

  const handleAdd = async (data: Parameters<typeof addItem>[0]) => {
    await addItem(data);
    if (!habits[ModuleCategory.FINANCE]) await toggleHabit(ModuleCategory.FINANCE);
    toast.success(`已添加 ${data.symbol}`, { icon: '📈' });
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载理财数据..." /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#eab308' }}>
          <Landmark className="h-7 w-7" />
          财务管理
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          理财就是理生活 · 每日资讯 + 资产追踪 + 投资知识
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Daily Info */}
        <div>
          <DailyFinanceCards info={dailyInfo} />
        </div>

        {/* Right: Portfolio (spans 2 columns) */}
        <div className="lg:col-span-2">
          <PortfolioManager
            items={portfolio}
            stats={stats}
            chartData={chartData}
            onAdd={handleAdd}
            onUpdatePrice={updatePrice}
            onDelete={deleteItem}
          />
        </div>
      </div>
    </div>
  );
}
