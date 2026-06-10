import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Use 'class' strategy for theme switching (adds class to <html>)
  darkMode: 'class',
  theme: {
    extend: {
      // Custom colors for each module
      colors: {
        // Dashboard - Indigo
        dashboard: {
          light: '#818cf8',
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        // Fitness - Green/Blue
        fitness: {
          light: '#4ade80',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
          accent: '#3b82f6',
        },
        // Reading - Wood tones
        reading: {
          light: '#d4a574',
          DEFAULT: '#a0724a',
          dark: '#7d5535',
          cream: '#f5e6d3',
        },
        // Learning - Violet/Indigo
        learning: {
          light: '#a78bfa',
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
          accent: '#6366f1',
        },
        // Health - Pink/Rose
        health: {
          light: '#f472b6',
          DEFAULT: '#ec4899',
          dark: '#db2777',
        },
        // Speaking - Amber/Cyan
        speaking: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          accent: '#06b6d4',
        },
        // Finance - Gold/Green
        finance: {
          light: '#facc15',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
          accent: '#22c55e',
        },
        // Business - Gray (placeholder)
        business: {
          light: '#d1d5db',
          DEFAULT: '#9ca3af',
          dark: '#6b7280',
        },
        // Theme surface colors (set via CSS variables)
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
          hover: 'var(--color-surface-hover)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans SC"', '"Noto Sans TC"', '"Noto Sans JP"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
