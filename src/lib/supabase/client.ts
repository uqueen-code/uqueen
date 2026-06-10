'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder';

/**
 * Check if real Supabase credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'
  );
}

function createClient() {
  return createBrowserClient<Database>(
    isSupabaseConfigured() ? process.env.NEXT_PUBLIC_SUPABASE_URL! : PLACEHOLDER_URL,
    isSupabaseConfigured() ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : PLACEHOLDER_KEY
  );
}

/**
 * Always returns a client instance (with placeholders if not configured).
 * Actual API calls fail gracefully via try/catch in hooks.
 * Use isSupabaseConfigured() to check before making calls.
 */
let _browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!_browserClient) {
    _browserClient = createClient();
  }
  return _browserClient;
}
