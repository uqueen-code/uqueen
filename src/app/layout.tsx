import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/components/layout/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: '我想活出怎样的人生',
  description: '我想活出怎样的人生 — 记录成长，不负时光',
  keywords: ['个人成长', '目标管理', '健身', '阅读', '学习', '健康', '理财', '口语'],
  authors: [{ name: '我想活出怎样的人生' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '向上思考',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
};

/**
 * Root HTML layout.
 * - PWA manifest and meta tags force-included in <head>
 * - Service Worker registered via inline script
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* === PWA 强制性标签 === */}
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="向上思考" />
        <link rel="apple-touch-icon" href="/assets/icon-192x192.png" />

        {/* Preconnect */}
        <link rel="preconnect" href="https://api.supabase.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />

        {/* Service Worker */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
                  function(reg) { console.log('SW registered:', reg.scope); },
                  function(err) { console.log('SW failed:', err); }
                );
              });
            }
          `
        }} />
      </head>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
