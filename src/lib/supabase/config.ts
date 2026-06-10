/**
 * Supabase Configuration Checker
 *
 * Shared between client and server — checks if Supabase env vars are set.
 * No 'use client' or 'use server' directive — works everywhere.
 */

/**
 * Check if Supabase is configured with real credentials.
 * When false, the app works in pure offline mode (IndexedDB only).
 */
export function isSupabaseConfigured(): boolean {
  if (typeof window !== 'undefined') {
    // Client-side
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'
    );
  }
  // Server-side — also checks NEXT_PUBLIC_ vars (available in Next.js server)
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'
  );
}
