-- Create prompt_logs table
CREATE TABLE IF NOT EXISTS prompt_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  operation_type TEXT NOT NULL,
  model_name TEXT,
  model_provider TEXT,
  prompt TEXT,
  response TEXT,
  project_id TEXT,
  user_id TEXT,
  tokens_used INTEGER,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  duration_ms INTEGER
);

-- Enable RLS
ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can be restricted later)
CREATE POLICY "Enable all operations for all users" ON prompt_logs
  FOR ALL USING (true);
