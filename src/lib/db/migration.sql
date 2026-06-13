-- ============================================
-- Personal Growth Platform — Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme":"light","language":"zh-CN","fontSize":"medium","offlineMode":false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. TODOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal','important','urgent')),
  is_recurring BOOLEAN DEFAULT false,
  recur_type TEXT CHECK (recur_type IN ('daily','weekly','monthly','yearly','lunar_yearly')),
  recur_config JSONB,
  due_date DATE,
  due_time TIME,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  is_birthday_reminder BOOLEAN DEFAULT false,
  birthday_person TEXT,
  birthday_is_lunar BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual','fitness_plan','learning_plan')),
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_todos_user ON public.todos(user_id);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);
CREATE INDEX idx_todos_category ON public.todos(category);
CREATE INDEX idx_todos_completed ON public.todos(is_completed);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own todos" ON public.todos FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 3. HABIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, category)
);

CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, date);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 4. COUNTDOWNS
-- ============================================
CREATE TABLE IF NOT EXISTS public.countdowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recur_type TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_countdowns_user ON public.countdowns(user_id);
CREATE INDEX idx_countdowns_target ON public.countdowns(target_date);

ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own countdowns" ON public.countdowns FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. GOALS
-- ============================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'yearly' CHECK (type IN ('yearly','quarterly','monthly','custom')),
  year INTEGER DEFAULT 2026,
  deadline DATE,
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user ON public.goals(user_id);
CREATE INDEX idx_goals_deadline ON public.goals(deadline);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. FITNESS DATA
-- ============================================
CREATE TABLE IF NOT EXISTS public.fitness_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  focus_area TEXT,
  body_parts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.fitness_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own fitness_data" ON public.fitness_data FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. FITNESS PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS public.fitness_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fitness_data_id UUID REFERENCES public.fitness_data(id),
  name TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_fitness_plans_user ON public.fitness_plans(user_id);
ALTER TABLE public.fitness_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own fitness_plans" ON public.fitness_plans FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 8. EXERCISE LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER,
  intensity TEXT,
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_exercise_logs_user_date ON public.exercise_logs(user_id, date);
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own exercise_logs" ON public.exercise_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 9. READING LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.reading_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  book_title TEXT NOT NULL,
  author TEXT,
  chapter TEXT,
  pages_read INTEGER,
  notes TEXT,
  is_daily_recommendation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reading_logs_user_date ON public.reading_logs(user_id, date);
ALTER TABLE public.reading_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own reading_logs" ON public.reading_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 10. DAILY BOOK RECOMMENDATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_book_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  summary TEXT,
  cover_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. ACTIVITY HEATMAP VIEW (updated)
-- ============================================
CREATE OR REPLACE VIEW public.activity_heatmap AS
SELECT user_id, date, 'habit' AS activity_type, category AS detail FROM public.habit_logs WHERE completed = true
UNION ALL
SELECT user_id, date, 'todo' AS activity_type, category AS detail FROM public.todos WHERE is_completed = true AND category IS NOT NULL
UNION ALL
SELECT user_id, date, 'fitness' AS activity_type, exercise_type AS detail FROM public.exercise_logs
UNION ALL
SELECT user_id, date, 'reading' AS activity_type, book_title AS detail FROM public.reading_logs
UNION ALL
SELECT user_id, date, 'learning' AS activity_type, category AS detail FROM public.learning_logs WHERE completed = true
UNION ALL
SELECT user_id, date, 'speaking' AS activity_type, language AS detail FROM public.speaking_logs WHERE completed = true;

-- ============================================
-- 13. LEARNING CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, category)
);
ALTER TABLE public.learning_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own learning_categories" ON public.learning_categories FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 14. LEARNING PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  method_description TEXT,
  file_path TEXT,
  plan_data JSONB,
  is_accepted BOOLEAN DEFAULT false,
  local_resource_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_learning_plans_user ON public.learning_plans(user_id);
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own learning_plans" ON public.learning_plans FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 15. LEARNING LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  plan_id UUID REFERENCES public.learning_plans(id),
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_learning_logs_user_date ON public.learning_logs(user_id, date);
ALTER TABLE public.learning_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own learning_logs" ON public.learning_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 16. SPEAKING LANGUAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.speaking_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, language)
);
ALTER TABLE public.speaking_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own speaking_languages" ON public.speaking_languages FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 17. SPEAKING MATERIALS (system-level)
-- ============================================
CREATE TABLE IF NOT EXISTS public.speaking_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  language TEXT NOT NULL,
  module TEXT NOT NULL,
  title TEXT,
  audio_url TEXT,
  subtitle_text TEXT,
  image_url TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, language, module)
);

-- ============================================
-- 18. SPEAKING LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.speaking_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  language TEXT NOT NULL,
  module TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, language, module)
);
CREATE INDEX idx_speaking_logs_user_date ON public.speaking_logs(user_id, date);
ALTER TABLE public.speaking_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own speaking_logs" ON public.speaking_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 19. ILLNESS LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.illness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  illness_type TEXT NOT NULL,
  severity TEXT,
  symptoms TEXT,
  medication TEXT,
  recovery_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_illness_logs_user ON public.illness_logs(user_id);
ALTER TABLE public.illness_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own illness_logs" ON public.illness_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 20. MENSTRUAL LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.menstrual_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  symptoms TEXT,
  flow_intensity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_menstrual_logs_user ON public.menstrual_logs(user_id);
ALTER TABLE public.menstrual_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own menstrual_logs" ON public.menstrual_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 21. DAILY WELLNESS (system-level)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_wellness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  diet_recommendation TEXT,
  exercise_recommendation TEXT,
  wellness_tips TEXT,
  suitable_for TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 22. PORTFOLIO ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  shares DECIMAL(15,4),
  buy_price DECIMAL(15,4),
  buy_date DATE,
  current_price DECIMAL(15,4),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_portfolio_items_user ON public.portfolio_items(user_id);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own portfolio_items" ON public.portfolio_items FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 23. DAILY FINANCE INFO (system-level)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_finance_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  stock_pick JSONB,
  fund_pick JSONB,
  knowledge_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_todos_updated_at ON public.todos;
CREATE TRIGGER trg_todos_updated_at BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_goals_updated_at ON public.goals;
CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_fitness_data_updated_at ON public.fitness_data;
CREATE TRIGGER trg_fitness_data_updated_at BEFORE UPDATE ON public.fitness_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER trg_portfolio_items_updated_at BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_learning_plans_updated_at ON public.learning_plans;
CREATE TRIGGER trg_learning_plans_updated_at BEFORE UPDATE ON public.learning_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 24. MOOD LOGS (psychology — daily mood rating)
-- ============================================
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  rating DECIMAL(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_mood_logs_user_date ON public.mood_logs(user_id, date);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own mood_logs" ON public.mood_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 25. EMOTION ENTRIES (psychology — monster feeding)
-- ============================================
CREATE TABLE IF NOT EXISTS public.emotion_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emotion TEXT NOT NULL,
  eaten BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emotion_entries_user_date ON public.emotion_entries(user_id, date);

ALTER TABLE public.emotion_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own emotion_entries" ON public.emotion_entries FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 26. TRAVEL CITIES (travel — visited cities footprint)
-- ============================================
CREATE TABLE IF NOT EXISTS public.travel_cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  visit_date DATE,
  feeling TEXT,
  is_visited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_travel_cities_user ON public.travel_cities(user_id);
CREATE INDEX idx_travel_cities_country ON public.travel_cities(country);

ALTER TABLE public.travel_cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own travel_cities" ON public.travel_cities FOR ALL USING (auth.uid() = user_id);
