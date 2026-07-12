-- Google Fit Token Storage
create table if not exists google_fit_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz not null,
  scope text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table google_fit_tokens enable row level security;

create policy "Users can manage own tokens" on google_fit_tokens
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Google Fit synced data
create table if not exists google_fit_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  steps integer,
  calories_burned real,
  heart_rate_avg real,
  heart_rate_max real,
  weight real,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table google_fit_data enable row level security;

create policy "Users can manage own fit data" on google_fit_data
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
