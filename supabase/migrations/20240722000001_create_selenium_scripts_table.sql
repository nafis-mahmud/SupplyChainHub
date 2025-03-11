-- Create selenium_scripts table if it doesn't exist
CREATE TABLE IF NOT EXISTS selenium_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  script_content TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE selenium_scripts ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own selenium scripts";
CREATE POLICY "Users can view their own selenium scripts"
ON selenium_scripts FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own selenium scripts";
CREATE POLICY "Users can insert their own selenium scripts"
ON selenium_scripts FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own selenium scripts";
CREATE POLICY "Users can update their own selenium scripts"
ON selenium_scripts FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own selenium scripts";
CREATE POLICY "Users can delete their own selenium scripts"
ON selenium_scripts FOR DELETE
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);

-- Enable realtime
alter publication supabase_realtime add table selenium_scripts;