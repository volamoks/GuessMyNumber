-- Create prompt_logs table for tracking AI prompts and responses
CREATE TABLE IF NOT EXISTS prompt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Operation details
  operation_type TEXT NOT NULL, -- 'generate_cjm', 'analyze_cjm', 'generate_business_canvas', etc.

  -- AI Model info
  model_name TEXT,
  model_provider TEXT, -- 'claude', 'openai', 'openrouter', etc.

  -- Prompt and response
  prompt TEXT NOT NULL,
  response TEXT,

  -- Metadata
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID,

  -- Token usage (if available from API)
  tokens_used INTEGER,

  -- Status
  status TEXT DEFAULT 'success', -- 'success', 'error'
  error_message TEXT,

  -- Performance
  duration_ms INTEGER
);

-- Create index for faster queries
CREATE INDEX idx_prompt_logs_created_at ON prompt_logs(created_at DESC);
CREATE INDEX idx_prompt_logs_operation_type ON prompt_logs(operation_type);
CREATE INDEX idx_prompt_logs_project_id ON prompt_logs(project_id);
CREATE INDEX idx_prompt_logs_user_id ON prompt_logs(user_id);

-- Enable Row Level Security (optional, for multi-user support)
ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own logs (optional)
-- CREATE POLICY "Users can view own prompt logs" ON prompt_logs
--   FOR SELECT USING (auth.uid() = user_id);
