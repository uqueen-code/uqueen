'use client';

import { useTranslation } from 'react-i18next';
import { Briefcase, Clock, Lightbulb, BarChart3, Users, Globe } from 'lucide-react';

const FEATURE_PREVIEWS = [
  { icon: BarChart3, title: '商业数据分析', desc: '多维度商业数据可视化与趋势分析' },
  { icon: Lightbulb, title: '创业计划管理', desc: '从0到1的创业项目跟踪与里程碑管理' },
  { icon: Users, title: '人脉网络', desc: '商务联系人管理与关系维护' },
  { icon: Globe, title: '市场洞察', desc: '行业动态追踪与竞品分析' },
];

export default function BusinessPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div
          className="h-28 w-28 rounded-3xl flex items-center justify-center mb-8 relative"
          style={{ background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)' }}
        >
          <Briefcase className="h-14 w-14" style={{ color: '#9ca3af' }} />
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: '#9ca3af' }}>
            SOON
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3" style={{ color: '#9ca3af' }}>
          {t('business.title')}
        </h1>

        {/* Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: '#f3f4f6' }}>
          <Clock className="h-4 w-4" style={{ color: '#9ca3af' }} />
          <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>
            {t('business.comingSoon')}
          </span>
        </div>

        <p className="text-base leading-relaxed mb-10" style={{ color: '#9ca3af' }}>
          {t('business.description')}
        </p>

        {/* Feature previews */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {FEATURE_PREVIEWS.map((f, i) => (
            <div key={i}
              className="p-4 rounded-xl text-left transition-all"
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <f.icon className="h-5 w-5 mb-2" style={{ color: '#d1d5db' }} />
              <h4 className="text-sm font-semibold mb-0.5" style={{ color: '#9ca3af' }}>{f.title}</h4>
              <p className="text-xs" style={{ color: '#d1d5db' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Decorative dots */}
        <div className="flex gap-2 mt-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: '#d1d5db', animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
