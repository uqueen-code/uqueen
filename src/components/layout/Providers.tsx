'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/config';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';

/**
 * Create a QueryClient with defaults optimized for offline-first.
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let queryClientInstance: QueryClient | null = null;

function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
}

/**
 * AppProviders — wraps the entire app with:
 * - React Query (server state)
 * - i18next (internationalization)
 * - Toast notifications
 * - Online/offline detection
 * - Auth initialization
 * - Settings initialization
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const [i18nReady, setI18nReady] = useState(false);

  const initializeSettings = useSettingsStore((s) => s.initialize);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const setIsOnline = useOfflineStore((s) => s.setIsOnline);

  // Initialize i18n
  useEffect(() => {
    if (i18n.isInitialized) {
      setI18nReady(true);
    } else {
      i18n.on('initialized', () => setI18nReady(true));
    }
  }, []);

  // Initialize settings from localStorage
  useEffect(() => {
    initializeSettings();
    initializeAuth();
  }, [initializeSettings, initializeAuth]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  if (!i18nReady) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontSize: '14px',
            },
            duration: 3000,
          }}
        />
      </I18nextProvider>
    </QueryClientProvider>
  );
}
