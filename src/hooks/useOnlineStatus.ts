'use client';

import { useOfflineStore } from '@/stores/offlineStore';

/**
 * Hook to access and monitor online/offline status.
 * The actual monitoring is set up in AppProviders.
 */
export function useOnlineStatus() {
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineModeEnabled = useOfflineStore((s) => s.offlineModeEnabled);

  return {
    isOnline,
    offlineModeEnabled,
    // effectiveOnline: true when connected AND offline mode is not forced
    effectiveOnline: isOnline && !offlineModeEnabled,
  };
}
