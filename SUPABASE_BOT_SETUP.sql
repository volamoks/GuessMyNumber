-- Drop table if exists to ensure clean schema update (CAUTION: deletes data!)
-- For MVP this is fine. For prod, use ALTER TABLE.
DROP TABLE IF EXISTS telegram_users;

-- Create table to store Telegram user credentials for the Jira Bot
create table if not exists telegram_users (
  telegram_id bigint primary key,
  jira_host text,
  jira_email text,
  jira_token text, 
  openrouter_key text, -- Renamed from gemini_key
  ai_model text default 'google/gemini-2.0-flash-001', -- New column for model preference
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table telegram_users enable row level security;

-- Create policy to allow the service role (which Vercel will use) to do everything
create policy "Service role can do all"
  on telegram_users
  for all
  using (true)
  with check (true);
