'use client';

import { useState, useCallback } from 'react';
import {
  Briefcase, Lightbulb, Kanban, DollarSign,
  Plus, Trash2, ChevronRight, ChevronDown,
  TrendingUp, TrendingDown, Target, AlertCircle,
  Clock, CheckCircle2, XCircle, ArrowRight,
  Wallet, Receipt, Calculator,
} from 'lucide-react';
import { useBusiness } from '@/hooks/useBusiness';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import type { BusinessIdea, BusinessProject } from '@/types/models';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  watching: { label: '👀 观望', color: '#94a3b8', bg: '#f1f5f9' },
  researching: { label: '🔍 调研中', color: '#3b82f6', bg: '#eff6ff' },
  testing: { label: '🧪 测试中', color: '#f59e0b', bg: '#fffbeb' },
  paused: { label: '⏸️ 暂停', color: '#ef4444', bg: '#fef2f2' },
};

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  todo: { label: '待开始', color: '#94a3b8' },
  in_progress: { label: '进行中', color: '#3b82f6' },
  done: { label: '已完成', color: '#22c55e' },
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  important_not_urgent: { label: '重要不紧急', icon: '🎯' },
  weekly_focus: { label: '本周焦点', icon: '⚡' },
  blocked: { label: '阻塞点', icon: '🚧' },
};

export default function BusinessPage() {
  const {
    ideas, projects, transactions,
    totalIncome, totalExpense, netProfit, monthlyIncome, monthlyExpense,
    isLoading,
    addIdea, updateIdea, deleteIdea,
    addProject, moveProject, deleteProject,
    addTransaction, deleteTransaction,
  } = useBusiness();

  // Section visibility
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // Idea form state
  const [ideaName, setIdeaName] = useState('');
  const [ideaValue, setIdeaValue] = useState('');
  const [ideaStatus, setIdeaStatus] = useState<BusinessIdea['status']>('watching');
  const [ideaAction, setIdeaAction] = useState('');

  // Project form state
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCat, setProjCat] = useState<BusinessProject['category']>('weekly_focus');
  const [projBlocker, setProjBlocker] = useState('');

  // Transaction form state
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]!);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txChannel, setTxChannel] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txRoi, setTxRoi] = useState('');

  // Handlers
  const handleAddIdea = useCallback(async () => {
    if (!ideaName.trim() || !ideaValue.trim()) return;
    await addIdea({ name: ideaName.trim(), value: ideaValue.trim(), status: ideaStatus, nextAction: ideaAction.trim() });
    setIdeaName(''); setIdeaValue(''); setIdeaAction('');
    setShowIdeaForm(false);
    toast.success('商业想法已保存 💡');
  }, [ideaName, ideaValue, ideaStatus, ideaAction, addIdea]);

  const handleAddProject = useCallback(async () => {
    if (!projTitle.trim()) return;
    await addProject({
      title: projTitle.trim(), description: projDesc.trim() || undefined,
      category: projCat, blockerReason: projCat === 'blocked' ? projBlocker.trim() : undefined,
    });
    setProjTitle(''); setProjDesc(''); setProjBlocker('');
    setShowProjectForm(false);
    toast.success('项目已添加 📋');
  }, [projTitle, projDesc, projCat, projBlocker, addProject]);

  const handleAddTransaction = useCallback(async () => {
    if (!txChannel.trim() || !txAmount || !txDesc.trim()) return;
    await addTransaction({
      date: txDate, type: txType, channel: txChannel.trim(),
      amount: parseFloat(txAmount), description: txDesc.trim(),
      roiNote: txRoi.trim() || undefined,
    });
    setTxChannel(''); setTxAmount(''); setTxDesc(''); setTxRoi('');
    setShowTransactionForm(false);
    toast.success('流水已记录 💰');
  }, [txDate, txType, txChannel, txAmount, txDesc, txRoi, addTransaction]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载商业数据..." /></div>;
  }

  const todoProjects = projects.filter(p => p.stage === 'todo');
  const inProgressProjects = projects.filter(p => p.stage === 'in_progress');
  const doneProjects = projects.filter(p => p.stage === 'done');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#6366f1' }}>
          <Briefcase className="h-7 w-7" />
          商业板块
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          想法池 · 项目看板 · 收支流水 — 用商业思维管理人生
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ====== Column 1: Business Idea Pool ====== */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
                <Lightbulb className="h-5 w-5" style={{ color: '#f59e0b' }} />
                ① 商业想法池
              </h2>
              <button onClick={() => setShowIdeaForm(!showIdeaForm)}
                className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                style={{ background: '#f59e0b18', color: '#f59e0b' }}>
                <Plus className="h-3 w-3" /> 新想法
              </button>
            </div>

            <AnimatePresence>
              {showIdeaForm && (
                <motion.div
                  className="p-4 rounded-xl mb-3 space-y-2"
                  style={{ background: 'var(--color-surface-alt)' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input type="text" value={ideaName}
                    onChange={e => setIdeaName(e.target.value)}
                    placeholder="想法名称（一句话）" className="input-field text-sm" autoFocus />
                  <textarea value={ideaValue}
                    onChange={e => setIdeaValue(e.target.value)}
                    placeholder="潜在价值——解决什么问题？能赚多少钱？"
                    className="input-field text-sm min-h-[60px]" />
                  <select value={ideaStatus}
                    onChange={e => setIdeaStatus(e.target.value as BusinessIdea['status'])}
                    className="input-field text-sm">
                    <option value="watching">👀 观望</option>
                    <option value="researching">🔍 调研中</option>
                    <option value="testing">🧪 小范围测试中</option>
                    <option value="paused">⏸️ 暂停</option>
                  </select>
                  <input type="text" value={ideaAction}
                    onChange={e => setIdeaAction(e.target.value)}
                    placeholder="下一步最小行动..." className="input-field text-sm" />
                  <button onClick={handleAddIdea}
                    className="btn-primary w-full text-xs"
                    style={{ '--color-accent': '#f59e0b', '--color-accent-hover': '#d97706' } as React.CSSProperties}>
                    保存想法
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
              {ideas.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>还没有商业想法，点击上方按钮添加</p>
                </div>
              ) : ideas.map(idea => {
                const statusInfo = STATUS_LABELS[idea.status]!;
                return (
                  <div key={idea.id}
                    className="p-3 rounded-xl transition-all group"
                    style={{ background: 'var(--color-surface-alt)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            💡 {idea.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: statusInfo.bg, color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                          {idea.value}
                        </p>
                        {idea.nextAction && (
                          <div className="flex items-center gap-1 text-[10px]" style={{ color: '#3b82f6' }}>
                            <ArrowRight className="h-3 w-3" />
                            下一步：{idea.nextAction}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <select
                          value={idea.status}
                          onChange={e => updateIdea(idea.id, { status: e.target.value as BusinessIdea['status'] })}
                          className="text-[10px] p-0.5 rounded"
                          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                          <option value="watching">观望</option>
                          <option value="researching">调研中</option>
                          <option value="testing">测试中</option>
                          <option value="paused">暂停</option>
                        </select>
                        <button onClick={() => deleteIdea(idea.id)}
                          className="p-1 rounded">
                          <Trash2 className="h-3 w-3" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ====== Column 2: Project Kanban ====== */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0" style={{ '--module-accent': '#3b82f6' } as React.CSSProperties}>
                <Kanban className="h-5 w-5" style={{ color: '#3b82f6' }} />
                ② 项目看板
              </h2>
              <button onClick={() => setShowProjectForm(!showProjectForm)}
                className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                style={{ background: '#3b82f618', color: '#3b82f6' }}>
                <Plus className="h-3 w-3" /> 新项目
              </button>
            </div>

            <AnimatePresence>
              {showProjectForm && (
                <motion.div
                  className="p-4 rounded-xl mb-3 space-y-2"
                  style={{ background: 'var(--color-surface-alt)' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input type="text" value={projTitle}
                    onChange={e => setProjTitle(e.target.value)}
                    placeholder="项目名称" className="input-field text-sm" autoFocus />
                  <textarea value={projDesc}
                    onChange={e => setProjDesc(e.target.value)}
                    placeholder="项目描述（可选）"
                    className="input-field text-sm min-h-[50px]" />
                  <select value={projCat}
                    onChange={e => setProjCat(e.target.value as BusinessProject['category'])}
                    className="input-field text-sm">
                    <option value="important_not_urgent">🎯 重要不紧急</option>
                    <option value="weekly_focus">⚡ 本周焦点</option>
                    <option value="blocked">🚧 阻塞点</option>
                  </select>
                  {projCat === 'blocked' && (
                    <input type="text" value={projBlocker}
                      onChange={e => setProjBlocker(e.target.value)}
                      placeholder="阻塞原因（缺技能？缺时间？缺思路？）"
                      className="input-field text-sm" />
                  )}
                  <button onClick={handleAddProject}
                    className="btn-primary w-full text-xs"
                    style={{ '--color-accent': '#3b82f6', '--color-accent-hover': '#2563eb' } as React.CSSProperties}>
                    添加项目
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Kanban columns */}
            <div className="space-y-4">
              {[
                { stage: 'todo' as const, projects: todoProjects, icon: '📋' },
                { stage: 'in_progress' as const, projects: inProgressProjects, icon: '⚡' },
                { stage: 'done' as const, projects: doneProjects, icon: '✅' },
              ].map(col => (
                <div key={col.stage}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{col.icon}</span>
                    <span className="text-xs font-bold" style={{ color: STAGE_LABELS[col.stage]!.color }}>
                      {STAGE_LABELS[col.stage]!.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
                      {col.projects.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[40px]">
                    {col.projects.map(proj => {
                      const catInfo = CATEGORY_LABELS[proj.category]!;
                      return (
                        <div key={proj.id}
                          className="p-2.5 rounded-lg group flex items-start gap-2"
                          style={{ background: 'var(--color-surface-alt)' }}
                          draggable>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px]">{catInfo.icon}</span>
                              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {proj.title}
                              </span>
                            </div>
                            {proj.description && (
                              <p className="text-[10px] mt-0.5 ml-4" style={{ color: 'var(--color-text-muted)' }}>
                                {proj.description}
                              </p>
                            )}
                            {proj.blockerReason && (
                              <p className="text-[10px] mt-0.5 ml-4 flex items-center gap-1" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" /> {proj.blockerReason}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            {col.stage !== 'todo' && (
                              <button onClick={() => moveProject(proj.id, 'todo')}
                                className="p-0.5 rounded" title="移到待开始">
                                <ChevronDown className="h-3 w-3" style={{ color: '#94a3b8' }} />
                              </button>
                            )}
                            {col.stage !== 'in_progress' && (
                              <button onClick={() => moveProject(proj.id, 'in_progress')}
                                className="p-0.5 rounded" title="移到进行中">
                                <ChevronRight className="h-3 w-3" style={{ color: '#3b82f6' }} />
                              </button>
                            )}
                            {col.stage !== 'done' && (
                              <button onClick={() => moveProject(proj.id, 'done')}
                                className="p-0.5 rounded" title="移到已完成">
                                <CheckCircle2 className="h-3 w-3" style={{ color: '#22c55e' }} />
                              </button>
                            )}
                            <button onClick={() => deleteProject(proj.id)}
                              className="p-0.5 rounded">
                              <Trash2 className="h-3 w-3" style={{ color: '#ef4444' }} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ====== Column 3: Income & Expense ====== */}
        <div>
          <div className="module-card h-full" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0" style={{ '--module-accent': '#22c55e' } as React.CSSProperties}>
                <DollarSign className="h-5 w-5" style={{ color: '#22c55e' }} />
                ③ 收支流水
              </h2>
              <button onClick={() => setShowTransactionForm(!showTransactionForm)}
                className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                style={{ background: '#22c55e18', color: '#22c55e' }}>
                <Plus className="h-3 w-3" /> 记一笔
              </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.08)' }}>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>本月收入</p>
                <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
                  ¥{monthlyIncome.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>本月支出</p>
                <p className="text-sm font-bold" style={{ color: '#ef4444' }}>
                  ¥{monthlyExpense.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>总净利</p>
                <p className="text-sm font-bold" style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                  ¥{netProfit.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {showTransactionForm && (
                <motion.div
                  className="p-4 rounded-xl mb-3 space-y-2"
                  style={{ background: 'var(--color-surface-alt)' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex gap-2">
                    <input type="date" value={txDate}
                      onChange={e => setTxDate(e.target.value)}
                      className="input-field text-sm flex-1" />
                    <select value={txType}
                      onChange={e => setTxType(e.target.value as 'income' | 'expense')}
                      className="input-field text-sm w-28">
                      <option value="income">💰 收入</option>
                      <option value="expense">💸 支出</option>
                    </select>
                  </div>
                  <input type="text" value={txChannel}
                    onChange={e => setTxChannel(e.target.value)}
                    placeholder="渠道（如：咨询费、工资、工具订阅）"
                    className="input-field text-sm" />
                  <div className="flex gap-2">
                    <input type="number" value={txAmount}
                      onChange={e => setTxAmount(e.target.value)}
                      placeholder="金额" className="input-field text-sm flex-1"
                      step="0.01" min="0" />
                    <input type="text" value={txDesc}
                      onChange={e => setTxDesc(e.target.value)}
                      placeholder="描述" className="input-field text-sm flex-1" />
                  </div>
                  <input type="text" value={txRoi}
                    onChange={e => setTxRoi(e.target.value)}
                    placeholder="这笔钱换来了什么？（ROI思考）"
                    className="input-field text-sm" />
                  <button onClick={handleAddTransaction}
                    className="btn-primary w-full text-xs"
                    style={{ '--color-accent': '#22c55e', '--color-accent-hover': '#16a34a' } as React.CSSProperties}>
                    记录流水
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transaction list */}
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-hide">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--color-text-muted)', opacity: 0.3 }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>还没有收支记录</p>
                </div>
              ) : transactions.slice(0, 20).map(tx => (
                <div key={tx.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg group"
                  style={{ background: 'var(--color-surface-alt)' }}>
                  <div className="flex-shrink-0">
                    {tx.type === 'income' ? (
                      <TrendingUp className="h-4 w-4" style={{ color: '#22c55e' }} />
                    ) : (
                      <TrendingDown className="h-4 w-4" style={{ color: '#ef4444' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {tx.description}
                      </span>
                      <span className="text-[10px] px-1 py-0.5 rounded"
                        style={{ background: tx.type === 'income' ? '#22c55e15' : '#ef444415', color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}>
                        {tx.channel}
                      </span>
                    </div>
                    {tx.roiNote && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        💭 {tx.roiNote}
                      </p>
                    )}
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{tx.date}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: tx.type === 'income' ? '#22c55e' : '#ef4444' }}>
                      {tx.type === 'income' ? '+' : '-'}¥{tx.amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button onClick={() => deleteTransaction(tx.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <Trash2 className="h-3 w-3" style={{ color: '#ef4444' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
