'use client';

import { useTranslation } from 'react-i18next';
import { X, Sun, Moon, Leaf, Globe, Type, Wifi, WifiOff, Database, Download, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSettingsStore, FONT_SIZE_MAP } from '@/stores/settingsStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { useSync } from '@/hooks/useSync';
import { getDatabase } from '@/lib/db/indexeddb';
import { ThemeMode, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/types/enums';
import { THEMES } from '@/lib/themes/config';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

/**
 * Settings Dashboard — slide-out panel.
 * Controls: Language, Theme, Font Size, Offline Mode, Data Management.
 */
export function SettingsPanel() {
  const { t } = useTranslation();
  const {
    isSettingsOpen,
    closeSettings,
    theme,
    setTheme,
    language,
    setLanguage,
    fontSize,
    setGlobalFontSize,
  } = useSettingsStore();
  const { offlineModeEnabled, setOfflineModeEnabled } = useOfflineStore();
  const { syncNow, pendingCount, syncStatus, isOnline } = useSync();

  // Export all IndexedDB data as JSON download
  const handleExportData = async () => {
    try {
      const db = getDatabase();
      const data: Record<string, unknown> = {};
      const tables = ['todos','habitLogs','goals','countdowns','fitnessData','fitnessPlans','exerciseLogs','readingLogs','learningCategories','learningPlans','learningLogs','speakingLanguages','speakingLogs','illnessLogs','menstrualLogs','portfolioItems'];
      for (const t of tables) {
        try { data[t] = await (db as any)[t]?.toArray?.() ?? []; } catch { data[t] = []; }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `personal-growth-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('数据导出成功');
    } catch { toast.error('导出失败'); }
  };

  // Clear all IndexedDB data
  const handleClearData = async () => {
    if (!confirm('确定要清除所有本地数据吗？此操作不可恢复。云端数据不受影响。')) return;
    try {
      const db = getDatabase();
      const tables = ['todos','habitLogs','goals','countdowns','fitnessData','fitnessPlans','exerciseLogs','readingLogs','learningCategories','learningPlans','learningLogs','speakingLanguages','speakingLogs','illnessLogs','menstrualLogs','portfolioItems','syncQueue'];
      for (const t of tables) { try { await (db as any)[t]?.clear?.(); } catch { /* */ } }
      toast.success('本地数据已清除');
    } catch { toast.error('清除失败'); }
  };

  if (!isSettingsOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={closeSettings}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md z-[70] animate-slide-up shadow-2xl overflow-y-auto"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {t('settings.title')}
          </h2>
          <button
            onClick={closeSettings}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--color-surface-hover)' }}
          >
            <X className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              <Sun className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              {t('settings.theme')}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((tConfig) => {
                const IconComp = tConfig.icon === 'sun' ? Sun : tConfig.icon === 'moon' ? Moon : Leaf;
                return (
                  <button
                    key={tConfig.id}
                    onClick={() => setTheme(tConfig.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2',
                      theme === tConfig.id ? 'shadow-md' : ''
                    )}
                    style={{
                      background: 'var(--color-surface-alt)',
                      borderColor:
                        theme === tConfig.id
                          ? 'var(--color-accent)'
                          : 'var(--color-border)',
                    }}
                  >
                    <IconComp
                      className="h-6 w-6"
                      style={{
                        color:
                          theme === tConfig.id
                            ? 'var(--color-accent)'
                            : 'var(--color-text-muted)',
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          theme === tConfig.id
                            ? 'var(--color-accent)'
                            : 'var(--color-text-secondary)',
                      }}
                    >
                      {tConfig.nameZh}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Font Size */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              <Type className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              {t('settings.fontSize')}
            </h3>
            <div className="flex items-center gap-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setGlobalFontSize(size)}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-lg text-sm transition-all border-2',
                    fontSize.global === size ? 'shadow-md' : ''
                  )}
                  style={{
                    background: 'var(--color-surface-alt)',
                    borderColor:
                      fontSize.global === size
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                    color:
                      fontSize.global === size
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                    fontSize:
                      size === 'small' ? '0.75rem' : size === 'medium' ? '0.875rem' : '1rem',
                  }}
                >
                  {FONT_SIZE_MAP[size]?.label} ({size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'})
                </button>
              ))}
            </div>
          </section>

          {/* Offline Mode */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {offlineModeEnabled ? (
                <WifiOff className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              ) : (
                <Wifi className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
              )}
              {t('settings.offlineMode')}
            </h3>
            <label className="flex items-center justify-between p-4 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface-alt)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {t('settings.offlineMode')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {t('settings.offlineModeDesc')}
                </p>
              </div>
              <div
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
                  offlineModeEnabled ? '' : ''
                )}
                style={{
                  background: offlineModeEnabled
                    ? 'var(--color-accent)'
                    : 'var(--color-border)',
                }}
                onClick={() => setOfflineModeEnabled(!offlineModeEnabled)}
              >
                <div
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    offlineModeEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </div>
            </label>
          </section>

          {/* Sync Status */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              <RefreshCw className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              数据同步
            </h3>
            <SyncSection />
          </section>

          {/* Data Management */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              <Database className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              {t('settings.dataManagement')}
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleExportData}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm transition-colors hover:opacity-80"
                style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' }}
              >
                <Download className="h-4 w-4" />
                {t('settings.exportData')} (JSON)
              </button>
              <button
                onClick={handleClearData}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm transition-colors hover:opacity-80"
                style={{ background: 'var(--color-surface-alt)', color: 'var(--color-danger)' }}
              >
                <Trash2 className="h-4 w-4" />
                {t('settings.clearLocalData')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/** Sync status display within settings panel */
function SyncSection() {
  const { syncNow, pendingCount, syncStatus, isOnline: effectiveOnline } = useSync();
  const lastSyncAt = useOfflineStore((s) => s.lastSyncAt);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
        <div>
          <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            {effectiveOnline ? (
              <CheckCircle2 className="h-4 w-4" style={{ color: '#22c55e' }} />
            ) : (
              <WifiOff className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            )}
            状态: {effectiveOnline ? '在线' : '离线'}
          </p>
          {lastSyncAt && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              上次同步: {new Date(lastSyncAt).toLocaleString('zh-CN')}
            </p>
          )}
          {pendingCount > 0 && (
            <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>
              {pendingCount} 条待同步
            </p>
          )}
        </div>
        <button
          onClick={syncNow}
          disabled={syncStatus === 'syncing' || !effectiveOnline}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
          style={{ background: '#6366f1', color: '#fff' }}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', syncStatus === 'syncing' && 'animate-spin')} />
          立即同步
        </button>
      </div>
    </div>
  );
}
