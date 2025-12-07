-- Create user_designs table to track purchased flex card designs
CREATE TABLE IF NOT EXISTS user_designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_id TEXT NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_id TEXT,
  price_paid DECIMAL(10, 2),
  UNIQUE(user_id, design_id)
);

-- Add RLS policies
ALTER TABLE user_designs ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchased designs
CREATE POLICY "Users can view their own designs"
  ON user_designs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert (via API with proper validation)
CREATE POLICY "Authenticated users can insert designs"
  ON user_designs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_designs_user_id ON user_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_designs_design_id ON user_designs(design_id);
