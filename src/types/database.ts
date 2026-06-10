/**
 * Supabase Database Types
 *
 * These types mirror the PostgreSQL schema defined in the plan.
 * In production, regenerate with: npx supabase gen types typescript
 *
 * For Phase 1, this is a manual definition covering all tables.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          priority: string;
          is_recurring: boolean;
          recur_type: string | null;
          recur_config: Json | null;
          due_date: string | null;
          due_time: string | null;
          is_completed: boolean;
          completed_at: string | null;
          is_birthday_reminder: boolean;
          birthday_person: string | null;
          birthday_is_lunar: boolean;
          source: string;
          source_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          priority?: string;
          is_recurring?: boolean;
          recur_type?: string | null;
          recur_config?: Json | null;
          due_date?: string | null;
          due_time?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          is_birthday_reminder?: boolean;
          birthday_person?: string | null;
          birthday_is_lunar?: boolean;
          source?: string;
          source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          priority?: string;
          is_recurring?: boolean;
          recur_type?: string | null;
          recur_config?: Json | null;
          due_date?: string | null;
          due_time?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          is_birthday_reminder?: boolean;
          birthday_person?: string | null;
          birthday_is_lunar?: boolean;
          source?: string;
          source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          category: string;
          completed: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          category: string;
          completed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          category?: string;
          completed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
      };
      // Additional table types will be added in Phase 2
      // when the full schema is implemented:
      // fitness_data, fitness_plans, exercise_logs,
      // reading_logs, daily_book_recommendations,
      // learning_categories, learning_plans, learning_logs,
      // speaking_languages, speaking_materials, speaking_logs,
      // illness_logs, menstrual_logs, daily_wellness,
      // portfolio_items, daily_finance_info,
      // countdowns, goals
    };
    Views: {
      activity_heatmap: {
        Row: {
          user_id: string;
          date: string;
          activity_type: string;
          detail: string;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}
