'use client';

import { create } from 'zustand';
import type { SyncQueueItem, SyncStatus } from '@/types/models';

interface OfflineState {
  // Online status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Offline mode toggle (user preference)
  offlineModeEnabled: boolean;
  setOfflineModeEnabled: (enabled: boolean) => void;

  // Sync status
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;

  // Sync queue (pending changes to push when online)
  syncQueue: SyncQueueItem[];
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromSyncQueue: (id: string) => void;
  clearSyncQueue: () => void;

  // Last sync timestamp
  lastSyncAt: string | null;
  setLastSyncAt: (timestamp: string) => void;
}

let queueIdCounter = 0;

export const useOfflineStore = create<OfflineState>((set, get) => ({
  // Default to online (will be updated by event listener)
  isOnline: true,
  setIsOnline: (isOnline) => {
    set({ isOnline });
    // Auto-trigger sync when coming back online
    if (isOnline) {
      const { syncQueue } = get();
      if (syncQueue.length > 0) {
        set({ syncStatus: 'syncing' });
        // Sync will be handled by the sync engine
      }
    } else {
      set({ syncStatus: 'offline' });
    }
  },

  offlineModeEnabled: false,
  setOfflineModeEnabled: (enabled) => {
    set({ offlineModeEnabled: enabled });
    try {
      localStorage.setItem('offlineMode', String(enabled));
    } catch { /* noop */ }
  },

  syncStatus: 'idle',
  setSyncStatus: (syncStatus) => set({ syncStatus }),

  syncQueue: [],
  addToSyncQueue: (item) => {
    const newItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${++queueIdCounter}`,
      timestamp: Date.now(),
      retryCount: 0,
      ...item,
    };
    set((state) => ({
      syncQueue: [...state.syncQueue, newItem],
      syncStatus: state.isOnline ? 'syncing' : 'offline',
    }));
  },
  removeFromSyncQueue: (id) => {
    set((state) => ({
      syncQueue: state.syncQueue.filter((item) => item.id !== id),
    }));
  },
  clearSyncQueue: () => set({ syncQueue: [], syncStatus: 'idle' }),

  lastSyncAt: null,
  setLastSyncAt: (timestamp) => set({ lastSyncAt: timestamp }),
}));
