'use client';

import { cn } from '@/lib/utils/cn';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state placeholder — shown when a list/table has no data.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div
        className="mb-4 rounded-full p-3"
        style={{ background: 'var(--color-surface-hover)' }}
      >
        {icon ?? (
          <Inbox
            className="h-8 w-8"
            style={{ color: 'var(--color-text-muted)' }}
          />
        )}
      </div>
      <h3
        className="text-lg font-medium mb-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-sm mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
