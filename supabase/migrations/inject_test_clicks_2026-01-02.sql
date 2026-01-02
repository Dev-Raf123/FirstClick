-- Inject randomized double-digit clicks for all projects on 2026-01-02
-- This script generates between 10-99 clicks per project for testing purposes

DO $$
DECLARE
  project_record RECORD;
  click_count INTEGER;
  i INTEGER;
  random_timestamp TIMESTAMPTZ;
  base_date TIMESTAMPTZ;
BEGIN
  -- Set the base date for 2026-01-02 UTC
  base_date := '2026-01-02 00:00:00+00'::TIMESTAMPTZ;
  
  -- Loop through all projects
  FOR project_record IN 
    SELECT id, name FROM projects
  LOOP
    -- Generate a random number of clicks between 10 and 99 (double digits)
    click_count := 10 + floor(random() * 90)::INTEGER;
    
    RAISE NOTICE 'Generating % clicks for project: % (ID: %)', click_count, project_record.name, project_record.id;
    
    -- Insert the random number of clicks for this project
    FOR i IN 1..click_count LOOP
      -- Generate a random timestamp within the day (2026-01-02 00:00:00 to 23:59:59 UTC)
      random_timestamp := base_date + (random() * INTERVAL '23 hours 59 minutes 59 seconds');
      
      INSERT INTO page_visits (
        id,
        project_id,
        timestamp,
        url,
        referrer,
        user_agent
      ) VALUES (
        gen_random_uuid(),
        project_record.id,
        random_timestamp,
        CASE 
          WHEN random() < 0.2 THEN '/'
          WHEN random() < 0.4 THEN '/about'
          WHEN random() < 0.5 THEN '/products'
          WHEN random() < 0.6 THEN '/pricing'
          WHEN random() < 0.7 THEN '/contact'
          WHEN random() < 0.8 THEN '/blog'
          WHEN random() < 0.9 THEN '/features'
          ELSE '/docs'
        END,
        CASE 
          WHEN random() < 0.3 THEN 'https://www.google.com'
          WHEN random() < 0.5 THEN 'https://twitter.com'
          WHEN random() < 0.65 THEN 'https://www.reddit.com'
          WHEN random() < 0.75 THEN 'https://www.linkedin.com'
          WHEN random() < 0.85 THEN 'https://www.facebook.com'
          ELSE NULL
        END,
        CASE 
          WHEN random() < 0.3 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          WHEN random() < 0.5 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          WHEN random() < 0.65 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
          WHEN random() < 0.75 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          WHEN random() < 0.85 THEN 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
          ELSE 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        END
      );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Click injection completed for all projects!';
END $$;

-- Verify the results
SELECT 
  p.name as project_name,
  COUNT(pv.id) as clicks_today
FROM projects p
LEFT JOIN page_visits pv ON p.id = pv.project_id 
  AND pv.timestamp >= '2026-01-02 00:00:00+00'::TIMESTAMPTZ
  AND pv.timestamp < '2026-01-03 00:00:00+00'::TIMESTAMPTZ
GROUP BY p.id, p.name
ORDER BY clicks_today DESC;
