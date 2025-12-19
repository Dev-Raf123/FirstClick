-- Move equipped_design_id from user_settings to projects table
-- This consolidates design tracking with the project, eliminating dual-tracking issues

-- Add equipped_design_id column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS equipped_design_id TEXT DEFAULT 'classic';

-- Migrate existing equipped_design_id values from user_settings to projects
UPDATE projects p
SET equipped_design_id = us.equipped_design_id
FROM user_settings us
WHERE p.user_id = us.user_id
  AND us.equipped_design_id IS NOT NULL;

-- Remove equipped_design_id from user_settings (keep table for onboarding tracking)
ALTER TABLE user_settings
DROP COLUMN IF EXISTS equipped_design_id;

-- Drop the old index on equipped_design_id
DROP INDEX IF EXISTS idx_user_settings_equipped_design;

-- Create index on projects.equipped_design_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_equipped_design ON projects(equipped_design_id);
