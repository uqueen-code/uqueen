'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Gauge, Upload, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PLAYBACK_SPEEDS } from '@/types/enums';

interface AudioPlayerProps {
  audioUrl?: string | null;
  label?: string;
  onLocalFile?: (file: File) => void;
}

/**
 * Professional audio player with variable speed control (0.5x - 2.0x).
 * Features:
 * - Play/pause with progress bar
 * - Speed selector (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x)
 * - Local file upload
 * - Audio waveform visualization placeholder
 * - Time display (current / total)
 */
export function AudioPlayer({ audioUrl, label, onLocalFile }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  // Format seconds to mm:ss
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Update time display
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => setIsPlaying(false);
    const onLoad = () => setHasAudio(true);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('loadeddata', onLoad);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('loadeddata', onLoad);
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } else { audio.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const changeSpeed = useCallback((s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
    setShowSpeedMenu(false);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !audioRef.current) return;
    const url = URL.createObjectURL(file);
    audioRef.current.src = url;
    setHasAudio(true);
    onLocalFile?.(file);
  }, [onLocalFile]);

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-surface-alt)' }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl ?? undefined} preload="metadata" />
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />

      {label && (
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
      )}

      {/* Progress bar */}
      <div className="relative mb-3">
        <input
          type="range" min="0" max={duration || 1} step="0.1" value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--color-accent)', background: 'var(--color-surface-hover)' }}
        />
        <div className="flex justify-between text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          disabled={!hasAudio}
          className="h-10 w-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>

        {/* Reset */}
        <button onClick={reset}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}>
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Speed selector */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
          >
            <Gauge className="h-3.5 w-3.5" />
            {speed}x
          </button>
          {showSpeedMenu && (
            <div
              className="absolute bottom-full mb-1 left-0 rounded-lg py-1 shadow-lg z-50 min-w-[70px] animate-slide-up"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              {PLAYBACK_SPEEDS.map(s => (
                <button key={s} onClick={() => changeSpeed(s)}
                  className={cn('block w-full px-3 py-1.5 text-xs text-left transition-colors', s === speed && 'font-bold')}
                  style={{ color: s === speed ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="relative">
          <button onClick={() => setShowVolume(!showVolume)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}>
            <Volume2 className="h-4 w-4" />
          </button>
          {showVolume && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-2 rounded-lg shadow-lg animate-slide-up"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <input type="range" min="0" max="1" step="0.1" value={volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value); }}
                className="w-20 h-1"
                style={{ accentColor: 'var(--color-accent)', writingMode: 'horizontal-tb' }}
                title="Volume"
              />
            </div>
          )}
        </div>

        {/* Upload */}
        <button onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg transition-colors ml-auto"
          style={{ color: 'var(--color-text-muted)' }}
          title={t('music.upload')}>
          <Upload className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
