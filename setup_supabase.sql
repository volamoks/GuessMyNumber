-- Create a table for storing presentation documents
create table presentations (
  id uuid default gen_random_uuid() primary key,
  content text, -- This will store the Yjs base64 update or simple text
  title text,
  full_document jsonb, -- Optional: Backup of full state
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime
alter publication supabase_realtime add table presentations;

-- Policies (Allow all for anonymous demo)
alter table presentations enable row level security;

create policy "Allow anonymous access"
on presentations
for all
to anon
using (true)
with check (true);
