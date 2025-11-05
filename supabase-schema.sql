-- Таблица для проектов (CJM, Business Canvas, Lean Canvas)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cjm', 'business_canvas', 'lean_canvas')),
  description TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT, -- для будущей авторизации
  tags TEXT[], -- теги для категоризации
  is_archived BOOLEAN DEFAULT FALSE
);

-- Таблица для версий проектов
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT, -- кто создал версию
  UNIQUE(project_id, version_number)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического создания версии при обновлении проекта
CREATE OR REPLACE FUNCTION create_project_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Получаем следующий номер версии
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM project_versions
  WHERE project_id = NEW.id;

  -- Создаем версию со старыми данными
  IF OLD.data IS DISTINCT FROM NEW.data THEN
    INSERT INTO project_versions (project_id, version_number, title, data, change_description)
    VALUES (OLD.id, next_version - 1, OLD.title, OLD.data, 'Auto-saved version');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания версий
DROP TRIGGER IF EXISTS create_version_on_update ON projects;
CREATE TRIGGER create_version_on_update
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_project_version();

-- RLS (Row Level Security) policies - для будущей авторизации
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- Временно разрешаем всем все операции (потом можно настроить по user_id)
CREATE POLICY "Enable all operations for all users" ON projects
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for all users on versions" ON project_versions
  FOR ALL USING (true);
