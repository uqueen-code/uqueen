'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { SUPPORTED_LANGUAGES, Language } from '@/types/enums';

/**
 * Initialize i18next with:
 * - Language detection (browser preference → localStorage → fallback)
 * - Lazy-loaded translation files from /public/locales/
 * - Chinese Simplified as default fallback
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        fetch(`/locales/${language}/${namespace}.json`).then((res) => res.json())
    )
  )
  .init({
    // Default namespace
    defaultNS: 'common',
    // Fallback language
    fallbackLng: Language.ZH_CN,
    // Supported languages
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // Don't load 'dev' locale in non-dev envs
    load: 'languageOnly',
    // Enable debug in development
    debug: process.env.NODE_ENV === 'development',
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes
    },
    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    // React options
    react: {
      useSuspense: false, // Prevent SSR hydration issues
    },
  });

export default i18n;

/**
 * Change language and persist to localStorage.
 */
export function changeLanguage(lang: string): void {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('i18nextLng', lang);
    } catch {
      // localStorage not available
    }
  }
}

/**
 * Get current language.
 */
export function getCurrentLanguage(): string {
  return i18n.language || Language.ZH_CN;
}

export { i18n };
