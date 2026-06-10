'use client';

import { useTranslation } from 'react-i18next';
import { Mic, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useSpeaking } from '@/hooks/useSpeaking';
import { useHabits } from '@/hooks/useHabits';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ShadowingModule, PictureDescription, ConnectedSpeech, TopicReading } from '@/components/speaking/SpeakingModules';
import { SPEAKING_LANGUAGES, SpeakingModule, ModuleCategory } from '@/types/enums';
import { cn } from '@/lib/utils/cn';
import { getModuleColor } from '@/lib/themes/module-colors';
import toast from 'react-hot-toast';

const LANG_COLORS: Record<string, string> = {
  '粤语': '#f59e0b', '英语': '#3b82f6', '法语': '#6366f1', '德语': '#ef4444',
  '意大利语': '#22c55e', '西班牙语': '#ec4899', '日语': '#8b5cf6', '韩语': '#06b6d4',
};

export default function SpeakingPage() {
  const { t } = useTranslation();
  const {
    languages, activeLanguages, isLoading,
    toggleLanguage, logModule, getMaterial, isModuleCompleted,
  } = useSpeaking();
  const { habits, toggleHabit } = useHabits();

  const [expandedLang, setExpandedLang] = useState<string | null>(null);

  const handleModuleToggle = async (language: string, module: SpeakingModule) => {
    await logModule(language, module);
    if (!habits[ModuleCategory.SPEAKING]) await toggleHabit(ModuleCategory.SPEAKING);
    toast.success(`${language} ${t(`speaking.${module}`)} 打卡成功 ✅`);
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载口语数据..." /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f59e0b' }}>
          <Mic className="h-7 w-7" />
          {t('speaking.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          勾选语言后显示四大练习模块 · 每日自动更新素材 · 支持倍速播放
        </p>
      </div>

      {/* Language Selector */}
      <div className="module-card mb-6" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
        <h2 className="section-title" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
          {t('speaking.selectLanguage')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {SPEAKING_LANGUAGES.map(lang => {
            const langData = languages.find(l => l.language === lang);
            const isActive = langData?.isActive ?? false;
            const color = LANG_COLORS[lang] ?? '#f59e0b';
            return (
              <button key={lang} onClick={() => toggleLanguage(lang)}
                className={cn('flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition-all border-2 text-sm font-medium', isActive ? 'shadow-sm' : '')}
                style={{
                  background: isActive ? color + '15' : 'var(--color-surface-alt)',
                  borderColor: isActive ? color : 'var(--color-border)',
                  color: isActive ? color : 'var(--color-text-secondary)',
                }}>
                <span className="text-base">{getLangEmoji(lang)}</span>
                <span>{lang}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active languages with modules */}
      {activeLanguages.length === 0 ? (
        <div className="module-card text-center py-16" style={{ '--module-accent': '#f59e0b' } as React.CSSProperties}>
          <Mic className="h-14 w-14 mx-auto mb-4" style={{ color: 'var(--color-text-muted)', opacity: 0.25 }} />
          <p className="text-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>请先选择要练习的语言</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            支持 粤语 · 英语 · 法语 · 德语 · 意大利语 · 西班牙语 · 日语 · 韩语
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeLanguages.map(lang => {
            const color = LANG_COLORS[lang] ?? '#f59e0b';
            const isExpanded = expandedLang === lang;

            return (
              <div key={lang}>
                {/* Language header */}
                <button onClick={() => setExpandedLang(isExpanded ? null : lang)}
                  className="w-full flex items-center gap-3 px-5 py-3 rounded-xl mb-3 transition-all"
                  style={{ background: color + '12', borderLeft: `4px solid ${color}` }}>
                  <span className="text-2xl">{getLangEmoji(lang)}</span>
                  <h3 className="text-lg font-bold flex-1 text-left" style={{ color }}>{lang}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
                    {['shadowing', 'picture_description', 'connected_speech', 'topic_reading'].filter(m =>
                      isModuleCompleted(lang, m as SpeakingModule)
                    ).length}/4
                  </span>
                  {isExpanded ? <ChevronUp className="h-5 w-5" style={{ color }} /> : <ChevronDown className="h-5 w-5" style={{ color }} />}
                </button>

                {/* Modules grid */}
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-down pl-2">
                    <ShadowingModule
                      material={getMaterial(lang, SpeakingModule.SHADOWING)}
                      completed={isModuleCompleted(lang, SpeakingModule.SHADOWING)}
                      onToggle={() => handleModuleToggle(lang, SpeakingModule.SHADOWING)}
                    />
                    <PictureDescription
                      material={getMaterial(lang, SpeakingModule.PICTURE_DESCRIPTION)}
                      completed={isModuleCompleted(lang, SpeakingModule.PICTURE_DESCRIPTION)}
                      onToggle={() => handleModuleToggle(lang, SpeakingModule.PICTURE_DESCRIPTION)}
                    />
                    <ConnectedSpeech
                      material={getMaterial(lang, SpeakingModule.CONNECTED_SPEECH)}
                      completed={isModuleCompleted(lang, SpeakingModule.CONNECTED_SPEECH)}
                      onToggle={() => handleModuleToggle(lang, SpeakingModule.CONNECTED_SPEECH)}
                    />
                    <TopicReading
                      material={getMaterial(lang, SpeakingModule.TOPIC_READING)}
                      completed={isModuleCompleted(lang, SpeakingModule.TOPIC_READING)}
                      onToggle={() => handleModuleToggle(lang, SpeakingModule.TOPIC_READING)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getLangEmoji(lang: string): string {
  const map: Record<string, string> = {
    '粤语': '🇭🇰', '英语': '🇬🇧', '法语': '🇫🇷', '德语': '🇩🇪',
    '意大利语': '🇮🇹', '西班牙语': '🇪🇸', '日语': '🇯🇵', '韩语': '🇰🇷',
  };
  return map[lang] ?? '🌐';
}
