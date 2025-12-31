-- Create click_challenges table for tracking user competitions
CREATE TABLE IF NOT EXISTS click_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  target_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  target_project_name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  duration_hours INTEGER NOT NULL CHECK (duration_hours IN (3, 12, 24)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  won BOOLEAN
);

-- Add indexes for performance
CREATE INDEX idx_click_challenges_user_id ON click_challenges(user_id);
CREATE INDEX idx_click_challenges_active ON click_challenges(active);
CREATE INDEX idx_click_challenges_target ON click_challenges(target_project_id);

-- Enable RLS
ALTER TABLE click_challenges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own challenges
CREATE POLICY "Users can view own challenges" ON click_challenges
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own challenges
CREATE POLICY "Users can create own challenges" ON click_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own challenges
CREATE POLICY "Users can update own challenges" ON click_challenges
  FOR UPDATE USING (auth.uid() = user_id);
