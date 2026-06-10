'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Settings page — simply opens the settings slide-out panel
 * and redirects back to dashboard.
 *
 * Most settings are accessed via the slide-out SettingsPanel
 * triggered by the settings icon in the Navbar.
 */
export default function SettingsPage() {
  const toggleSettings = useSettingsStore((s) => s.toggleSettings);
  const isSettingsOpen = useSettingsStore((s) => s.isSettingsOpen);

  useEffect(() => {
    if (!isSettingsOpen) {
      toggleSettings();
    }
    // Redirect to dashboard after opening settings
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  }, [isSettingsOpen, toggleSettings]);

  return null;
}
