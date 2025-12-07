// Debug script to check timestamp formats in database
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ckhoremindgjrtmjoanw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraG9yZW1pbmRnanJ0bWpvYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY1NDksImV4cCI6MjA2NjUxMjU0OX0.aDJaxW_C3CfyU9nBu0JG5NaHIymO0c0GVsDywXNOqfE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function analyzeTimestamps() {
  console.log('=== ANALYZING DATABASE TIMESTAMPS ===\n');
  
  // Fetch recent visits
  const { data: visits, error } = await supabase
    .from('page_visits')
    .select('id, timestamp, project_id')
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${visits.length} recent visits\n`);

  // Show first 20 timestamps
  console.log('Sample timestamps (first 20):');
  visits.slice(0, 20).forEach((visit, idx) => {
    console.log(`${idx + 1}. ${visit.timestamp} (Project: ${visit.project_id?.substring(0, 8)}...)`);
  });

  // Analyze date patterns
  const dateMap = {};
  visits.forEach(visit => {
    const fullTimestamp = visit.timestamp;
    const dateOnly = visit.timestamp?.slice(0, 10);
    
    if (dateOnly) {
      if (!dateMap[dateOnly]) {
        dateMap[dateOnly] = {
          count: 0,
          sampleTimestamp: fullTimestamp
        };
      }
      dateMap[dateOnly].count++;
    }
  });

  console.log('\n\nVisits grouped by date:');
  Object.keys(dateMap).sort().reverse().forEach(date => {
    console.log(`  ${date}: ${dateMap[date].count} visits`);
    console.log(`    Sample: ${dateMap[date].sampleTimestamp}`);
  });

  // Test date filtering
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  console.log('\n\nDate filter test:');
  console.log(`Today string: ${todayStr}`);
  console.log(`Yesterday string: ${yesterdayStr}`);
  console.log(`Visits starting with today (${todayStr}): ${visits.filter(v => v.timestamp?.startsWith(todayStr)).length}`);
  console.log(`Visits starting with yesterday (${yesterdayStr}): ${visits.filter(v => v.timestamp?.startsWith(yesterdayStr)).length}`);

  // Group by project
  const projectMap = {};
  visits.forEach(visit => {
    if (!projectMap[visit.project_id]) {
      projectMap[visit.project_id] = [];
    }
    projectMap[visit.project_id].push(visit);
  });

  console.log('\n\nVisits by project:');
  Object.keys(projectMap).forEach(projectId => {
    const projectVisits = projectMap[projectId];
    const todayCount = projectVisits.filter(v => v.timestamp?.startsWith(todayStr)).length;
    const yesterdayCount = projectVisits.filter(v => v.timestamp?.startsWith(yesterdayStr)).length;
    
    let percent = 0;
    if (yesterdayCount === 0 && todayCount === 0) {
      percent = 0;
    } else if (yesterdayCount === 0 && todayCount > 0) {
      percent = 100;
    } else if (yesterdayCount > 0) {
      percent = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    }
    percent = Math.round(percent * 10) / 10;

    console.log(`\nProject: ${projectId?.substring(0, 12)}...`);
    console.log(`  Total visits in sample: ${projectVisits.length}`);
    console.log(`  Today (${todayStr}): ${todayCount}`);
    console.log(`  Yesterday (${yesterdayStr}): ${yesterdayCount}`);
    console.log(`  Calculated %: ${percent}%`);
  });
}

analyzeTimestamps().catch(console.error);
