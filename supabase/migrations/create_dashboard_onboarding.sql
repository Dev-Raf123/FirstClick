-- Create dashboard_onboarding table
CREATE TABLE IF NOT EXISTS dashboard_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_onboarding_user_id ON dashboard_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_onboarding_completed ON dashboard_onboarding(completed);

-- Enable RLS
ALTER TABLE dashboard_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own onboarding status
CREATE POLICY "Users can view their own onboarding status"
  ON dashboard_onboarding
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own onboarding record
CREATE POLICY "Users can insert their own onboarding record"
  ON dashboard_onboarding
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding status
CREATE POLICY "Users can update their own onboarding status"
  ON dashboard_onboarding
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
