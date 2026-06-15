'use client';

import { Headphones, Image, Link2, BookText, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SpeakingModule as ModuleType } from '@/types/enums';
import type { SpeakingMaterial } from '@/types/models';
import { AudioPlayer } from './AudioPlayer';

// ---- Shared Module Wrapper ----
interface ModuleWrapperProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  completed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ModuleWrapper({ title, icon, color, completed, onToggle, children }: ModuleWrapperProps) {
  return (
    <div className="module-card" style={{ '--module-accent': color } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title mb-0 text-sm" style={{ '--module-accent': color } as React.CSSProperties}>
          {icon}
          {title}
        </h3>
        <button onClick={onToggle}
          className={cn('p-1.5 rounded-lg transition-all', completed ? '' : '')}
          style={{ color: completed ? color : 'var(--color-text-muted)' }}>
          {completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>
      </div>
      {children}
    </div>
  );
}

// ---- 1. Shadowing Module ----
interface ShadowingProps {
  material: SpeakingMaterial | null;
  completed: boolean;
  onToggle: () => void;
}
export function ShadowingModule({ material, completed, onToggle }: ShadowingProps) {

  return (
    <ModuleWrapper title="影子跟读" icon={<Headphones className="h-4 w-4" style={{ color: '#f59e0b' }} />} color="#f59e0b" completed={completed} onToggle={onToggle}>
      <div className="space-y-3">
        {material?.title && (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#f59e0b18', color: '#d97706' }}>
              {material.title}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>时长约5分钟</span>
          </div>
        )}

        <AudioPlayer label="跟读音频" />

        {material?.subtitleText && (
          <div className="p-3 rounded-lg text-sm leading-relaxed" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>字幕练习</p>
            <p style={{ color: 'var(--color-text-primary)', lineHeight: 1.8 }}>{material.subtitleText}</p>
          </div>
        )}

        {!material?.subtitleText && (
          <div className="text-center py-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            每日5分钟音频跟读 · 支持倍速播放 · 上传本地音频练习
          </div>
        )}
      </div>
    </ModuleWrapper>
  );
}

// ---- 2. Picture Description ----
interface PictureDescProps {
  material: SpeakingMaterial | null;
  completed: boolean;
  onToggle: () => void;
}
export function PictureDescription({ material, completed, onToggle }: PictureDescProps) {

  return (
    <ModuleWrapper title="图片描述" icon={<Image className="h-4 w-4" style={{ color: '#06b6d4' }} />} color="#06b6d4" completed={completed} onToggle={onToggle}>
      <div className="space-y-3">
        <div
          className="h-40 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #06b6d410, #0891b220)', border: '1px dashed #06b6d440' }}
        >
          <div className="text-center">
            <Image className="h-10 w-10 mx-auto mb-2" style={{ color: '#06b6d4', opacity: 0.5 }} />
            <p className="text-sm font-medium" style={{ color: '#0891b2' }}>
              {material?.content ?? '今日图片描述题目'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              用目标语言描述你看到的场景 · 时间、地点、人物、事件
            </p>
          </div>
        </div>
        <textarea
          className="input-field min-h-[60px] text-sm"
          placeholder="用目标语言写下你的描述..."
        />
      </div>
    </ModuleWrapper>
  );
}

// ---- 3. Connected Speech ----
interface ConnectedSpeechProps {
  material: SpeakingMaterial | null;
  completed: boolean;
  onToggle: () => void;
}
export function ConnectedSpeech({ material, completed, onToggle }: ConnectedSpeechProps) {

  return (
    <ModuleWrapper title="连读训练" icon={<Link2 className="h-4 w-4" style={{ color: '#8b5cf6' }} />} color="#8b5cf6" completed={completed} onToggle={onToggle}>
      <div className="space-y-3">
        <div className="p-4 rounded-lg text-center" style={{ background: 'var(--color-surface)' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#7c3aed' }}>今日练习</p>
          <p className="text-base leading-relaxed font-mono" style={{ color: 'var(--color-text-primary)' }}>
            {material?.content ?? 'What are you → Whacha'}
          </p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          连读是口语流利的关键。先慢速读清每个词，再逐渐加速，感受音节的自然连接。
          重复练习直到能自然流畅地说出来。
        </p>
        <AudioPlayer />
      </div>
    </ModuleWrapper>
  );
}

// ---- 4. Topic Reading ----
interface TopicReadingProps {
  material: SpeakingMaterial | null;
  completed: boolean;
  onToggle: () => void;
}
export function TopicReading({ material, completed, onToggle }: TopicReadingProps) {

  return (
    <ModuleWrapper title="话题朗读" icon={<BookText className="h-4 w-4" style={{ color: '#ec4899' }} />} color="#ec4899" completed={completed} onToggle={onToggle}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#ec489918', color: '#db2777' }}>
            今日话题
          </span>
        </div>
        <div className="p-4 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {material?.content ?? '今日话题'}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            围绕以上话题，用目标语言进行3-5分钟的朗读和自由表达。
            可以先准备1分钟的关键词提纲，然后开始练习。
          </p>
        </div>
        <AudioPlayer label="录音回放" />
      </div>
    </ModuleWrapper>
  );
}
