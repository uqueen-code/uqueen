'use client';

import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

/**
 * Animated loading spinner with optional text.
 */
export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          SIZE_CLASSES[size]
        )}
        style={{ color: 'var(--color-accent)' }}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );
}
