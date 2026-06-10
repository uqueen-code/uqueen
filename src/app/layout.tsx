import type { Metadata } from 'next';
import { AppProviders } from '@/components/layout/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: '全能个人成长管理平台',
  description: '掌控人生，成就更好的自己 — All-in-One Personal Growth Management Platform',
  keywords: ['个人成长', '目标管理', '健身', '阅读', '学习', '健康', '理财', '口语'],
  authors: [{ name: 'Personal Growth Platform' }],
};

/**
 * Root HTML layout.
 * - Sets data-theme attribute for theme system
 * - AppProviders wraps the entire app for i18n, auth, react-query
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Preconnect to Supabase for faster API calls */}
        <link rel="preconnect" href="https://api.supabase.com" />
        {/* Google Fonts: Inter + Noto Sans (CJK) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
