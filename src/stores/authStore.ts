'use client';

import { create } from 'zustand';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/models';

interface AuthState {
  // User state
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;

  // Auth operations
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),
  setProfile: (profile) =>
    set({ profile }),
  setLoading: (isLoading) =>
    set({ isLoading }),

  /**
   * Sign in with email + password.
   * If the user doesn't exist, Supabase returns an error
   * and we prompt them to sign up instead.
   */
  signIn: async (email, password) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    set({ user: data.user, isAuthenticated: true });
    return { error: null };
  },

  /**
   * Sign up with email + password.
   * Supabase sends a confirmation email by default.
   */
  signUp: async (email, password) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // If email confirmation is disabled, user is immediately signed in
    if (data.user && data.session) {
      set({ user: data.user, isAuthenticated: true });
    }

    return { error: null };
  },

  /**
   * Sign out and clear state.
   */
  signOut: async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAuthenticated: false });
  },

  /**
   * Initialize auth state — check existing session on app load.
   */
  initialize: async () => {
    set({ isLoading: true });
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      set({
        user: data.session.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    });
  },
}));
