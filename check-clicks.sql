-- Check clicks for today vs yesterday for your project
-- Replace 'YOUR_PROJECT_ID' with your actual project ID (the token you see in dashboard)

-- Get today's and yesterday's counts
SELECT 
  DATE(timestamp) as visit_date,
  COUNT(*) as click_count
FROM page_visits
WHERE project_id = 'f9ead190-5ff8-4d8e-a121-9b1b00564276'  -- Replace with your project ID
  AND DATE(timestamp) IN (
    CURRENT_DATE,           -- Today (2025-11-21)
    CURRENT_DATE - INTERVAL '1 day'  -- Yesterday (2025-11-20)
  )
GROUP BY DATE(timestamp)
ORDER BY visit_date DESC;

-- Also show last 10 timestamps to see the format
SELECT 
  timestamp,
  DATE(timestamp) as date_only,
  TO_CHAR(timestamp, 'YYYY-MM-DD') as formatted_date
FROM page_visits
WHERE project_id = 'f9ead190-5ff8-4d8e-a121-9b1b00564276'  -- Replace with your project ID
ORDER BY timestamp DESC
LIMIT 10;

-- Show all dates with counts
SELECT 
  DATE(timestamp) as visit_date,
  COUNT(*) as click_count
FROM page_visits
WHERE project_id = 'f9ead190-5ff8-4d8e-a121-9b1b00564276'  -- Replace with your project ID
GROUP BY DATE(timestamp)
ORDER BY visit_date DESC
LIMIT 7;
