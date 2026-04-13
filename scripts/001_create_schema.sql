-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount BIGINT NOT NULL,
  platform TEXT NOT NULL,
  due_date INTEGER NOT NULL,
  recurrence JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create platforms table
CREATE TABLE IF NOT EXISTS public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create monthly expense state table
CREATE TABLE IF NOT EXISTS public.monthly_expense_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  skipped BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, expense_id, month)
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_expense_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
CREATE POLICY "users_select_own_expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for platforms
CREATE POLICY "users_select_own_platforms" ON public.platforms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_platforms" ON public.platforms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_platforms" ON public.platforms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_platforms" ON public.platforms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for monthly_expense_states
CREATE POLICY "users_select_own_monthly_states" ON public.monthly_expense_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_monthly_states" ON public.monthly_expense_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_monthly_states" ON public.monthly_expense_states FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_monthly_states" ON public.monthly_expense_states FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_platforms_user_id ON public.platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_expense_states_user_id ON public.monthly_expense_states(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_expense_states_expense_id ON public.monthly_expense_states(expense_id);
