-- 019_dashboard_productivity.sql

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;
