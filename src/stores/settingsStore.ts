'use client';

import { create } from 'zustand';
import { ThemeMode, Language } from '@/types/enums';
import { applyTheme, getSavedTheme } from '@/lib/themes/config';
import { changeLanguage, getCurrentLanguage } from '@/lib/i18n/config';

interface FontSizeConfig {
  global: 'small' | 'medium' | 'large';
  modules: Record<string, 'small' | 'medium' | 'large'>;
}

interface SettingsState {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Language
  language: string;
  setLanguage: (language: string) => void;

  // Font size
  fontSize: FontSizeConfig;
  setGlobalFontSize: (size: 'small' | 'medium' | 'large') => void;
  setModuleFontSize: (module: string, size: 'small' | 'medium' | 'large') => void;

  // Settings panel
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  closeSettings: () => void;

  // Initialize from localStorage
  initialize: () => void;
}

/**
 * Maps font size to Tailwind text class and actual size.
 */
export const FONT_SIZE_MAP: Record<string, { label: string; baseClass: string }> = {
  small: { label: '小', baseClass: 'text-sm' },
  medium: { label: '中', baseClass: 'text-base' },
  large: { label: '大', baseClass: 'text-lg' },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: ThemeMode.LIGHT,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },

  language: Language.ZH_CN,
  setLanguage: (language) => {
    changeLanguage(language);
    set({ language });
  },

  fontSize: {
    global: 'medium',
    modules: {},
  },
  setGlobalFontSize: (size) => {
    set((state) => ({
      fontSize: { ...state.fontSize, global: size },
    }));
    try {
      const config = get().fontSize;
      localStorage.setItem('fontSize', JSON.stringify(config));
    } catch { /* noop */ }
  },
  setModuleFontSize: (module, size) => {
    set((state) => ({
      fontSize: {
        ...state.fontSize,
        modules: { ...state.fontSize.modules, [module]: size },
      },
    }));
    try {
      const config = get().fontSize;
      localStorage.setItem('fontSize', JSON.stringify(config));
    } catch { /* noop */ }
  },

  isSettingsOpen: false,
  toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
  closeSettings: () => set({ isSettingsOpen: false }),

  initialize: () => {
    // Restore theme
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    set({ theme: savedTheme });

    // Restore language
    const savedLanguage = getCurrentLanguage();
    set({ language: savedLanguage });

    // Restore font size
    try {
      const savedFontSize = localStorage.getItem('fontSize');
      if (savedFontSize) {
        set({ fontSize: JSON.parse(savedFontSize) });
      }
    } catch { /* noop */ }
  },
}));
