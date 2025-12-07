-- Add platform column to projects table
ALTER TABLE projects
ADD COLUMN platform TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_platform ON projects(platform);
