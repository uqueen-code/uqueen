import { ThemeMode } from '@/types/enums';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  nameZh: string;
  icon: string; // lucide icon name
  description: string;
}

/**
 * Available themes configuration.
 */
export const THEMES: ThemeConfig[] = [
  {
    id: ThemeMode.LIGHT,
    name: 'Light Mode',
    nameZh: '白色日常模式',
    icon: 'sun',
    description: '明亮清晰的日常使用主题',
  },
  {
    id: ThemeMode.DARK,
    name: 'Dark Mode',
    nameZh: '深色夜间模式',
    icon: 'moon',
    description: '柔和护眼的深色主题，适合夜间使用',
  },
  {
    id: ThemeMode.GREEN,
    name: 'Eye Care',
    nameZh: '绿色护眼模式',
    icon: 'leaf',
    description: '自然柔和的绿色主题，长时间使用更舒适',
  },
];

/**
 * Apply theme to document by setting data-theme attribute.
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', theme);

  // Also handle dark class for Tailwind's darkMode: 'class'
  root.classList.remove('dark');
  if (theme === ThemeMode.DARK) {
    root.classList.add('dark');
  }

  // Store preference
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // localStorage not available
  }
}

/**
 * Get the saved theme from localStorage, or default to 'light'.
 */
export function getSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return ThemeMode.LIGHT;

  try {
    const saved = localStorage.getItem('theme');
    if (saved && Object.values(ThemeMode).includes(saved as ThemeMode)) {
      return saved as ThemeMode;
    }
  } catch {
    // localStorage not available
  }

  // Check system preference for dark mode
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return ThemeMode.DARK;
  }

  return ThemeMode.LIGHT;
}
