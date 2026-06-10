'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { isSupabaseConfigured } from './config';

/**
 * Supabase browser client — used in Client Components.
 * Returns null if Supabase is not configured (graceful offline mode).
 */
export function createClient() {
  if (!isSupabaseConfigured()) return null;

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Singleton browser client instance.
 * Returns null when Supabase is not configured → app works fully offline.
 */
let _browserClient: ReturnType<typeof createClient> | null = undefined as unknown as null;

export function getSupabaseBrowserClient() {
  if (_browserClient === undefined) {
    _browserClient = createClient();
  }
  return _browserClient;
}
