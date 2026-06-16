import { ModuleCategory } from '@/types/enums';
import type { ModuleColorConfig } from '@/types/models';

/**
 * Per-module color palette.
 * Each module has its own accent color for the heatmap calendar,
 * navigation tabs, cards, and badges.
 */
export const MODULE_COLORS: Record<string, ModuleColorConfig> = {
  [ModuleCategory.FITNESS]: {
    light: '#4ade80',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
    accent: '#3b82f6',
  },
  [ModuleCategory.READING]: {
    light: '#d4a574',
    DEFAULT: '#a0724a',
    dark: '#7d5535',
    cream: '#f5e6d3',
  },
  [ModuleCategory.LEARNING]: {
    light: '#a78bfa',
    DEFAULT: '#8b5cf6',
    dark: '#7c3aed',
    accent: '#6366f1',
  },
  [ModuleCategory.HEALTH]: {
    light: '#f472b6',
    DEFAULT: '#ec4899',
    dark: '#db2777',
  },
  [ModuleCategory.SPEAKING]: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
    accent: '#06b6d4',
  },
  [ModuleCategory.FINANCE]: {
    light: '#facc15',
    DEFAULT: '#eab308',
    dark: '#ca8a04',
    accent: '#22c55e',
  },
  [ModuleCategory.PSYCHOLOGY]: {
    light: '#c084fc',
    DEFAULT: '#a855f7',
    dark: '#9333ea',
  },
  [ModuleCategory.TRAVEL]: {
    light: '#34d399',
    DEFAULT: '#10b981',
    dark: '#059669',
    accent: '#06b6d4',
  },
  [ModuleCategory.BUSINESS]: {
    light: '#d1d5db',
    DEFAULT: '#9ca3af',
    dark: '#6b7280',
  },
  dashboard: {
    light: '#818cf8',
    DEFAULT: '#6366f1',
    dark: '#4f46e5',
  },
  vocab: {
    light: '#818cf8',
    DEFAULT: '#6366f1',
    dark: '#4f46e5',
  },
  sudoku: {
    light: '#fb923c',
    DEFAULT: '#f97316',
    dark: '#ea580c',
    accent: '#8b5cf6',
  },
};

/**
 * Get the primary color for a module.
 */
export function getModuleColor(module: string): string {
  return MODULE_COLORS[module]?.DEFAULT ?? '#6366f1';
}

/**
 * Get the light variant color for a module.
 */
export function getModuleColorLight(module: string): string {
  return MODULE_COLORS[module]?.light ?? '#818cf8';
}

/**
 * Get CSS variable name for module accent color.
 */
export function getModuleCSSVar(module: string): string {
  const color = getModuleColor(module);
  return color;
}

/**
 * Heatmap color scale (5 levels of intensity per module).
 * Returns a color based on the count/strength for a given day.
 */
export function getHeatmapColor(module: string, intensity: number): string {
  const base = MODULE_COLORS[module];
  if (!base) return '#e2e8f0';

  // intensity: 0 = no activity, 1-4 = increasing activity
  const alphaMap: Record<number, number> = {
    0: 0.08, // nearly invisible
    1: 0.25,
    2: 0.45,
    3: 0.7,
    4: 1.0, // full color
  };

  const alpha = alphaMap[Math.min(4, Math.max(0, intensity))] ?? 0.08;
  return hexToRgba(base.DEFAULT, alpha);
}

/**
 * Convert hex color to rgba string.
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Module display names (used in UI).
 */
export const MODULE_DISPLAY_NAMES: Record<string, string> = {
  [ModuleCategory.FITNESS]: '健身',
  [ModuleCategory.READING]: '阅读',
  [ModuleCategory.LEARNING]: '学习',
  [ModuleCategory.HEALTH]: '健康',
  [ModuleCategory.SPEAKING]: '口语',
  [ModuleCategory.PSYCHOLOGY]: '心理',
  [ModuleCategory.TRAVEL]: '旅行',
  [ModuleCategory.FINANCE]: '理财',
  [ModuleCategory.BUSINESS]: '商业',
  dashboard: '仪表盘',
  sudoku: '数独',
};

/**
 * Module icons (lucide icon names).
 */
export const MODULE_ICONS: Record<string, string> = {
  [ModuleCategory.FITNESS]: 'dumbbell',
  [ModuleCategory.READING]: 'book-open',
  [ModuleCategory.LEARNING]: 'graduation-cap',
  [ModuleCategory.HEALTH]: 'heart',
  [ModuleCategory.SPEAKING]: 'mic',
  [ModuleCategory.PSYCHOLOGY]: 'brain',
  [ModuleCategory.TRAVEL]: 'map',
  [ModuleCategory.FINANCE]: 'landmark',
  [ModuleCategory.BUSINESS]: 'briefcase',
  dashboard: 'layout-dashboard',
  sudoku: 'puzzle',
};
