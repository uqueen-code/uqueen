'use client';

import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, SkipForward, SkipBack, Upload, ExternalLink, Music } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PLAYBACK_SPEEDS } from '@/types/enums';

/**
 * Compact music player component.
 *
 * Features:
 * - Online: plays a daily recommended track (mock for Phase 1)
 * - Supports local file upload via FileReader
 * - Playback speed control (0.5x - 2.0x)
 * - One-click external player link
 */
export function MusicPlayer() {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  /**
   * Toggle play/pause.
   */
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Browser may block autoplay
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  /**
   * Handle local file upload.
   */
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCurrentTrack(url);
    setTrackName(file.name);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, []);

  /**
   * Change playback speed.
   */
  const changeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  }, []);

  /**
   * Open system default music player.
   * Uses a protocol handler or simply opens the file dialog.
   */
  const openExternalPlayer = useCallback(() => {
    // Attempt to open via Windows protocol
    // In a real app, this could use a custom protocol or Electron integration
    if (currentTrack) {
      window.open(currentTrack, '_blank');
    }
    // Fallback: trigger file upload
    fileInputRef.current?.click();
  }, [currentTrack]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="none"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Track info */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Music className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
        <span
          className="truncate max-w-[100px]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {trackName || t('music.dailyRecommendation')}
        </span>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={togglePlay}
          disabled={!currentTrack}
          className="p-1 rounded-full transition-colors hover:opacity-80 disabled:opacity-30"
          style={{ color: 'var(--color-accent)' }}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>

        {/* Speed selector */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors"
            style={{
              background: 'var(--color-surface-hover)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {playbackSpeed}x
          </button>
          {showSpeedMenu && (
            <div
              className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 rounded-lg py-1 shadow-lg z-50 animate-slide-up"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              {PLAYBACK_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => changeSpeed(speed)}
                  className={cn(
                    'block w-full px-3 py-1 text-xs text-left transition-colors hover:opacity-80',
                    speed === playbackSpeed && 'font-bold'
                  )}
                  style={{
                    color:
                      speed === playbackSpeed
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upload local file */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1 rounded-full transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          title={t('music.upload')}
        >
          <Upload className="h-3 w-3" />
        </button>

        {/* Open external player */}
        <button
          onClick={openExternalPlayer}
          className="p-1 rounded-full transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          title={t('music.openPlayer')}
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
