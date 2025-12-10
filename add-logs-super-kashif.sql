-- Add 400 page visit logs for today for "Super Kashif" project
-- Run this in Supabase SQL Editor

-- Step 1: Find the project_id (run this first)
SELECT id, name FROM projects WHERE name = 'Super Kashif';

-- Step 2: Copy the project_id from above and replace in the INSERT below
-- Then run the rest of the script

WITH 
  project_data AS (
    SELECT id FROM projects WHERE name = 'Super Kashif' LIMIT 1
  ),
  random_data AS (
    SELECT 
      generate_series(1, 400) as n,
      (SELECT id FROM project_data) as project_id,
      (ARRAY['/home', '/about', '/products', '/contact', '/pricing', '/features', '/blog', '/docs'])[floor(random() * 8 + 1)::int] as url,
      (ARRAY['https://www.google.com', 'https://twitter.com', 'https://www.facebook.com', 'https://www.linkedin.com', 'Direct', NULL])[floor(random() * 6 + 1)::int] as referrer,
      (ARRAY[
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
      ])[floor(random() * 6 + 1)::int] as user_agent,
      (CURRENT_DATE + (random() * interval '24 hours'))::timestamp as timestamp
  )
INSERT INTO page_visits (project_id, url, referrer, user_agent, timestamp)
SELECT project_id, url, referrer, user_agent, timestamp
FROM random_data;

-- Step 3: Verify the inserts
SELECT 
  DATE(timestamp) as visit_date,
  COUNT(*) as click_count
FROM page_visits
WHERE project_id = (SELECT id FROM projects WHERE name = 'Super Kashif' LIMIT 1)
  AND DATE(timestamp) = CURRENT_DATE
GROUP BY DATE(timestamp);

-- Step 4: Show hourly breakdown for today
SELECT 
  EXTRACT(HOUR FROM timestamp) as hour,
  COUNT(*) as visits
FROM page_visits
WHERE project_id = (SELECT id FROM projects WHERE name = 'Super Kashif' LIMIT 1)
  AND DATE(timestamp) = CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM timestamp)
ORDER BY hour;
