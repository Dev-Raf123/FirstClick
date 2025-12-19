-- Add text_color column to projects table for custom text color on cards
-- This allows users to adjust text color (white/black) for better contrast with their backgrounds

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'white';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_text_color ON projects(text_color);
