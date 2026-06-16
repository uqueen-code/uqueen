'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  GraduationCap,
  Mic,
  Heart,
  Brain,
  Map,
  Landmark,
  Briefcase,
  Settings,
  Sun,
  Moon,
  Leaf,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Wifi,
  WifiOff,
  Languages,
  Puzzle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { useUIStore } from '@/stores/uiStore';
import { ThemeMode } from '@/types/enums';
import { MODULE_COLORS, getModuleColor } from '@/lib/themes/module-colors';

/**
 * Navigation tab configuration.
 */
const NAV_TABS = [
  { path: '/dashboard', label: '控制台', icon: LayoutDashboard, module: 'dashboard' },
  { path: '/vocab', label: '雅思词汇', icon: Languages, module: 'vocab' },
  { path: '/sudoku', label: '数独', icon: Puzzle, module: 'sudoku' },
  { path: '/fitness', label: '健身', icon: Dumbbell, module: 'fitness' },
  { path: '/reading', label: '阅读', icon: BookOpen, module: 'reading' },
  { path: '/learning', label: '学习', icon: GraduationCap, module: 'learning' },
  { path: '/speaking', label: '口语', icon: Mic, module: 'speaking' },
  { path: '/health', label: '健康', icon: Heart, module: 'health' },
  { path: '/psychology', label: '心理', icon: Brain, module: 'psychology' },
  { path: '/travel', label: '旅行', icon: Map, module: 'travel' },
  { path: '/finance', label: '财务', icon: Landmark, module: 'finance' },
  { path: '/business', label: '商业', icon: Briefcase, module: 'business' },
];

const THEME_ICONS: Record<ThemeMode, React.ReactNode> = {
  [ThemeMode.LIGHT]: <Sun className="h-4 w-4" />,
  [ThemeMode.DARK]: <Moon className="h-4 w-4" />,
  [ThemeMode.GREEN]: <Leaf className="h-4 w-4" />,
};

/**
 * Main top navigation bar with module tabs, auth, and settings.
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { theme, setTheme } = useSettingsStore();
  const { user, isAuthenticated, signOut, isLoading } = useAuthStore();
  const { isOnline, offlineModeEnabled, setOfflineModeEnabled } = useOfflineStore();
  const { setActiveModule } = useUIStore();

  // Detect active module from pathname
  const activeModule = pathname.split('/')[1] || 'dashboard';

  // Open settings
  const { toggleSettings } = useSettingsStore();

  const cycleTheme = () => {
    const themes = [ThemeMode.LIGHT, ThemeMode.DARK, ThemeMode.GREEN];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length]!;
    setTheme(nextTheme);
  };

  return (
    <nav
      className="sticky top-0 z-[100] border-b backdrop-blur-xl w-full overflow-hidden"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--color-border)',
        touchAction: 'manipulation',
      }}
    >
      <div className="w-full px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-lg no-underline"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                G
              </div>
              <span className="hidden sm:inline">向上思考</span>
            </Link>
          </div>

          {/* Desktop Navigation Tabs — scrollable on overflow */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide flex-shrink-1 min-w-0 mx-2">
            {NAV_TABS.map((tab) => {
              const isActive = activeModule === tab.module;
              const color = getModuleColor(tab.module);
              const isBusiness = tab.module === 'business';

              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  onClick={() => setActiveModule(tab.module)}
                  className={cn(
                    'nav-tab flex items-center gap-1.5',
                    isActive && 'active',
                    isBusiness && 'opacity-50'
                  )}
                  style={{
                    '--module-accent': isBusiness ? '#9ca3af' : color,
                  } as React.CSSProperties}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Offline Toggle */}
            <button
              onClick={() => setOfflineModeEnabled(!offlineModeEnabled)}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'var(--color-surface-hover)' }}
              title={offlineModeEnabled ? '离线' : '在线'}
            >
              {isOnline && !offlineModeEnabled ? (
                <Wifi className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
              ) : (
                <WifiOff className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'var(--color-surface-hover)' }}
              title={`Theme: ${theme}`}
            >
              {THEME_ICONS[theme]}
            </button>

            {/* Settings */}
            <button
              onClick={toggleSettings}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'var(--color-surface-hover)' }}
            >
              <Settings className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
            </button>

            {/* Auth */}
            {isLoading ? (
              <div className="h-8 w-20 rounded-lg skeleton" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  style={{
                    background: 'var(--color-surface-hover)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
                  <LogOut className="h-3.5 w-3.5 ml-1" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all btn-primary"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>登录</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg"
              style={{ background: 'var(--color-surface-hover)' }}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t py-2 animate-slide-down"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="grid grid-cols-4 gap-1">
              {NAV_TABS.map((tab) => {
                const isActive = activeModule === tab.module;
                const color = getModuleColor(tab.module);
                const isBusiness = tab.module === 'business';

                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    onClick={() => {
                      setActiveModule(tab.module);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors',
                      isBusiness && 'opacity-50'
                    )}
                    style={{
                      color: isActive ? color : 'var(--color-text-secondary)',
                      background: isActive
                        ? `${color}15`
                        : 'transparent',
                    }}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
