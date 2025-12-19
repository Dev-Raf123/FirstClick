-- Create table for custom background presets
CREATE TABLE IF NOT EXISTS background_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  background_url TEXT NOT NULL,
  background_position TEXT DEFAULT '50% 50%',
  background_size TEXT DEFAULT '100%',
  background_repeat TEXT DEFAULT 'no-repeat',
  is_equipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE background_presets ENABLE ROW LEVEL SECURITY;

-- Users can view their own presets
CREATE POLICY "Users can view own presets"
ON background_presets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own presets
CREATE POLICY "Users can insert own presets"
ON background_presets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own presets
CREATE POLICY "Users can update own presets"
ON background_presets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own presets
CREATE POLICY "Users can delete own presets"
ON background_presets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_background_presets_user_id ON background_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_background_presets_equipped ON background_presets(user_id, is_equipped);

-- Add equipped_background_preset_id to projects table (optional - for direct linking)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS equipped_background_preset_id UUID REFERENCES background_presets(id) ON DELETE SET NULL;
