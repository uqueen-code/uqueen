import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { isSupabaseConfigured } from './config';

/**
 * Supabase server client — used in Server Components and Route Handlers.
 * Returns null if Supabase is not configured.
 */
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    isSupabaseConfigured() ? process.env.NEXT_PUBLIC_SUPABASE_URL! : PLACEHOLDER_URL,
    isSupabaseConfigured() ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : PLACEHOLDER_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookies can only be modified in Server Actions or Route Handlers
          }
        },
      },
    }
  );
}

/**
 * Supabase admin client — uses service role key for privileged operations.
 * ONLY use on the server side. Returns null if not configured.
 */
export async function createAdminClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co'
  ) {
    return null;
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
