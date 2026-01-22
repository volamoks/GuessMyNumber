-- Create table to store Telegram user credentials for the Jira Bot
create table if not exists telegram_users (
  telegram_id bigint primary key,
  jira_host text,
  jira_email text,
  jira_token text, -- Note: In production, encryption is recommended. stored plain for MVP as requested.
  gemini_key text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table telegram_users enable row level security;

-- Create policy to allow the service role (which Vercel will use) to do everything
-- Note: Vercel functions using the service_role key bypass RLS, but it's good practice to have policies.
-- For simple bot access where the bot server is the only client:
create policy "Service role can do all"
  on telegram_users
  for all
  using (true)
  with check (true);
