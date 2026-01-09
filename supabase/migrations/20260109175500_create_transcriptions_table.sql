-- Create transcriptions table
create table if not exists public.transcriptions (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  file_size bigint null,
  transcription_data jsonb null, -- Full transcription object
  summary_data jsonb null,       -- Summary object
  
  constraint transcriptions_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.transcriptions enable row level security;

-- Create Policy: Users can only see their own transcriptions
create policy "Users can view their own transcriptions"
on public.transcriptions
for select
using (auth.uid() = user_id);

-- Create Policy: Users can insert their own transcriptions
create policy "Users can insert their own transcriptions"
on public.transcriptions
for insert
with check (auth.uid() = user_id);

-- Create Policy: Users can update their own transcriptions
create policy "Users can update their own transcriptions"
on public.transcriptions
for update
using (auth.uid() = user_id);

-- Create Policy: Users can delete their own transcriptions
create policy "Users can delete their own transcriptions"
on public.transcriptions
for delete
using (auth.uid() = user_id);
