'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import type { BusinessIdea, BusinessProject, BusinessTransaction } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

export function useBusiness() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [projects, setProjects] = useState<BusinessProject[]>([]);
  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const [ideaL, proj, trans] = await Promise.all([
        db.businessIdeas.where('userId').equals(userId).reverse().toArray(),
        db.businessProjects.where('userId').equals(userId).toArray(),
        db.businessTransactions.where('userId').equals(userId).reverse().limit(50).toArray(),
      ]);
      setIdeas(ideaL.map(i => ({
        id: i.id, userId: i.userId, name: i.name, value: i.value,
        status: i.status, nextAction: i.nextAction, createdAt: i.createdAt, updatedAt: i.updatedAt,
      })));
      setProjects(proj.map(p => ({
        id: p.id, userId: p.userId, title: p.title, description: p.description,
        category: p.category, stage: p.stage, blockerReason: p.blockerReason,
        order: p.order, createdAt: p.createdAt, updatedAt: p.updatedAt,
      })));
      setTransactions(trans.map(t => ({
        id: t.id, userId: t.userId, date: t.date, type: t.type,
        channel: t.channel, amount: t.amount, description: t.description,
        roiNote: t.roiNote, createdAt: t.createdAt,
      })));
    } catch { /* */ }
    finally { setIsLoading(false); }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Ideas
  const addIdea = useCallback(async (data: { name: string; value: string; status: BusinessIdea['status']; nextAction: string }) => {
    const id = crypto.randomUUID?.() ?? `idea_${Date.now()}`;
    const now = new Date().toISOString();
    const idea: BusinessIdea = { id, userId, ...data, createdAt: now, updatedAt: now };
    const db = getDatabase();
    await db.businessIdeas.put({ ...idea, _synced: false, _modifiedAt: Date.now() });
    setIdeas(prev => [idea, ...prev]);
    return idea;
  }, [userId]);

  const updateIdea = useCallback(async (id: string, data: Partial<BusinessIdea>) => {
    const db = getDatabase();
    await db.businessIdeas.update(id, { ...data, _synced: false, _modifiedAt: Date.now() });
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i));
  }, []);

  const deleteIdea = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.businessIdeas.delete(id);
    setIdeas(prev => prev.filter(i => i.id !== id));
  }, []);

  // Projects
  const addProject = useCallback(async (data: { title: string; description?: string; category: BusinessProject['category']; blockerReason?: string }) => {
    const id = crypto.randomUUID?.() ?? `proj_${Date.now()}`;
    const now = new Date().toISOString();
    const maxOrder = Math.max(0, ...projects.filter(p => p.category === data.category).map(p => p.order));
    const project: BusinessProject = {
      id, userId, title: data.title, description: data.description || null,
      category: data.category, stage: 'todo', blockerReason: data.blockerReason || null,
      order: maxOrder + 1, createdAt: now, updatedAt: now,
    };
    const db = getDatabase();
    await db.businessProjects.put({ ...project, _synced: false, _modifiedAt: Date.now() });
    setProjects(prev => [...prev, project]);
    return project;
  }, [userId, projects]);

  const moveProject = useCallback(async (id: string, newStage: BusinessProject['stage']) => {
    const db = getDatabase();
    await db.businessProjects.update(id, { stage: newStage, _synced: false, _modifiedAt: Date.now() });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, stage: newStage } : p));
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.businessProjects.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  // Transactions
  const addTransaction = useCallback(async (data: {
    date: string; type: 'income' | 'expense'; channel: string; amount: number; description: string; roiNote?: string;
  }) => {
    const id = crypto.randomUUID?.() ?? `tx_${Date.now()}`;
    const tx: BusinessTransaction = {
      id, userId, date: data.date, type: data.type, channel: data.channel,
      amount: data.amount, description: data.description,
      roiNote: data.roiNote || null, createdAt: new Date().toISOString(),
    };
    const db = getDatabase();
    await db.businessTransactions.put({ ...tx, _synced: false, _modifiedAt: Date.now() });
    setTransactions(prev => [tx, ...prev]);
    return tx;
  }, [userId]);

  const deleteTransaction = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.businessTransactions.delete(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // This month's transactions
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amount, 0);

  return {
    ideas, projects, transactions,
    totalIncome, totalExpense, netProfit, monthlyIncome, monthlyExpense,
    isLoading,
    addIdea, updateIdea, deleteIdea,
    addProject, moveProject, deleteProject,
    addTransaction, deleteTransaction,
    refresh: loadData,
  };
}
