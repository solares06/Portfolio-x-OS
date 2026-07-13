-- 027_finance_categories.sql

CREATE TABLE IF NOT EXISTS public.finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own finance categories"
  ON public.finance_categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a trigger function to automatically add default categories for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_finance_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.finance_categories (user_id, name, type)
  VALUES
    (NEW.id, 'Food', 'expense'),
    (NEW.id, 'Transport', 'expense'),
    (NEW.id, 'Utilities', 'expense'),
    (NEW.id, 'Entertainment', 'expense'),
    (NEW.id, 'Rent', 'expense'),
    (NEW.id, 'Groceries', 'expense'),
    (NEW.id, 'Salary', 'income'),
    (NEW.id, 'Investments', 'income'),
    (NEW.id, 'Freelance', 'income');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_finance_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_finance_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_finance_categories();
