-- Secure page_visits table by removing public INSERT access
-- Now all inserts must go through the /api/track endpoint

-- Drop the old public INSERT policies
DROP POLICY IF EXISTS "Allow insert for anon" ON "public"."page_visits";
DROP POLICY IF EXISTS "Allow public insert on page_visits" ON "public"."page_visits";

-- Keep SELECT policies for authenticated users (needed for analytics)
-- No new INSERT policy needed - only server-side (service role) can insert now

-- Optional: Add a policy comment for documentation
COMMENT ON TABLE page_visits IS 'Inserts are now handled via /api/track endpoint with validation and rate limiting';
