'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { getDailyQuote } from '@/lib/motivation/quotes';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { MusicPlayer } from './MusicPlayer';
import { cn } from '@/lib/utils/cn';

/**
 * Daily motivation bar — displays below the navbar.
 * Shows a rotating daily quote + embedded music player.
 * Collapsible via UI store.
 */
export function MotivationBar() {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const { isMotivationBarCollapsed, toggleMotivationBar } = useUIStore();

  // Get deterministic daily quote based on date + language
  const quote = useMemo(() => getDailyQuote(language), [language]);

  if (isMotivationBarCollapsed) {
    return (
      <div
        className="border-b"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <button
            onClick={toggleMotivationBar}
            className="flex items-center gap-2 w-full py-1 text-xs transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Quote className="h-3 w-3" />
            <span>{t('motivation.title')}</span>
            <ChevronDown className="h-3 w-3 ml-auto" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-b animate-slide-down"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-alt)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-start gap-4">
          {/* Quote Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Quote className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              <p
                className="text-sm font-medium italic truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
            </div>
            <p
              className="text-xs ml-6"
              style={{ color: 'var(--color-text-muted)' }}
            >
              — {quote.author}
            </p>
          </div>

          {/* Music Player */}
          <div className="flex-shrink-0">
            <MusicPlayer />
          </div>

          {/* Collapse button */}
          <button
            onClick={toggleMotivationBar}
            className="flex-shrink-0 p-1 rounded transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
