-- 1. Create PRENSENTATION table (for Real-time Collaboration)
create table if not exists presentations (
  id uuid default gen_random_uuid() primary key,
  content text, -- Stores Yjs update or markdown
  title text,
  full_document jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for presentations
-- Check if publication exists specifically for this table to avoid errors, or just try adding it
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'presentations') then
    alter publication supabase_realtime add table presentations;
  end if;
end $$;

-- Policies for presentations
alter table presentations enable row level security;

drop policy if exists "Allow anonymous access" on presentations;
create policy "Allow anonymous access"
on presentations for all to public
using (true)
with check (true);


-- 2. Create PROJECTS table (for CJM, Roadmap etc)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cjm', 'business_canvas', 'lean_canvas', 'roadmap')),
  description TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT,
  tags TEXT[],
  is_archived BOOLEAN DEFAULT FALSE
);

-- 3. Create PROJECT_VERSIONS table
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  UNIQUE(project_id, version_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Policies for projects (Public for now)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for all users" ON projects;
CREATE POLICY "Enable all operations for all users" ON projects
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users on versions" ON project_versions;
CREATE POLICY "Enable all operations for all users on versions" ON project_versions
  FOR ALL USING (true);
