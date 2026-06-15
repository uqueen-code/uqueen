'use client';

import { WifiOff, CloudOff, RefreshCw, Wifi } from 'lucide-react';
import { useOfflineStore } from '@/stores/offlineStore';
import { useSync } from '@/hooks/useSync';

/**
 * Offline/sync status banner — shows at the top when offline or syncing.
 */
export function OfflineBanner() {
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const { syncStatus, pendingCount, syncNow } = useSync();

  // Don't show anything when online and no pending changes
  if (isOnline && !offlineMode && syncStatus === 'idle' && pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* Offline indicator */}
      {(!isOnline || offlineMode) && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium animate-slide-down"
          style={{ background: '#f59e0b', color: '#fff' }}
        >
          <WifiOff className="h-3 w-3" />
          {offlineMode ? t('common.offline') : t('common.offline') + ' — 数据将保存到本地'}
        </div>
      )}

      {/* Syncing indicator */}
      {syncStatus === 'syncing' && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium animate-slide-down"
          style={{ background: '#3b82f6', color: '#fff' }}
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          {t('common.syncing')} {pendingCount > 0 && `(${pendingCount})`}
        </div>
      )}

      {/* Pending changes banner */}
      {isOnline && !offlineMode && pendingCount > 0 && syncStatus === 'idle' && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs animate-slide-down cursor-pointer"
          style={{ background: '#6366f118', color: '#6366f1', borderBottom: '1px solid #6366f130' }}
          onClick={syncNow}
        >
          <CloudOff className="h-3 w-3" />
          {pendingCount} 条离线更改待同步 — 点击立即同步
          <RefreshCw className="h-3 w-3" />
        </div>
      )}

      {/* Error banner */}
      {syncStatus === 'error' && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium animate-slide-down cursor-pointer"
          style={{ background: '#ef4444', color: '#fff' }}
          onClick={syncNow}
        >
          同步失败 — 点击重试
          <RefreshCw className="h-3 w-3" />
        </div>
      )}
    </>
  );
}
