-- Add text_color column to background_presets table
-- This allows presets to remember the text color preference

ALTER TABLE background_presets
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'white';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_background_presets_text_color ON background_presets(text_color);
