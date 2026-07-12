-- 021_finance_extensions.sql

-- 1. finance_budgets
CREATE TABLE IF NOT EXISTS public.finance_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budgets"
  ON public.finance_budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. finance_recurring
CREATE TABLE IF NOT EXISTS public.finance_recurring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  recurrence TEXT NOT NULL CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly')),
  notes TEXT,
  next_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_recurring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurring transactions"
  ON public.finance_recurring FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

