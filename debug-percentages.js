// Debug script to check percentage calculations
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckhoremindgjrtmjoanw.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraG9yZW1pbmRnanJ0bWpvYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY1NDksImV4cCI6MjA2NjUxMjU0OX0.aDJaxW_C3CfyU9nBu0JG5NaHIymO0c0GVsDywXNOqfE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getYesterdayDateString() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

function calculateClickPercentageChange(clicksToday, clicksYesterday) {
  let percent = 0;

  if (clicksYesterday === 0 && clicksToday === 0) {
    percent = 0;
  } else if (clicksYesterday === 0 && clicksToday > 0) {
    percent = 100;
  } else if (clicksYesterday > 0) {
    percent = ((clicksToday - clicksYesterday) / clicksYesterday) * 100;
  }

  return Math.round(percent * 10) / 10;
}

async function debugPercentages() {
  console.log('=== DEBUGGING PERCENTAGE CALCULATIONS ===\n');
  
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  
  console.log('Current Date Info:');
  console.log(`Today: ${todayStr} (${new Date().toISOString()})`);
  console.log(`Yesterday: ${yesterdayStr}\n`);

  // Fetch all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }

  console.log(`Found ${projects.length} projects\n`);

  // For each project, analyze the visits
  for (const project of projects) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`PROJECT: ${project.name} (ID: ${project.id})`);
    console.log('='.repeat(80));

    const { data: allVisits, error: visitsError } = await supabase
      .from('page_visits')
      .select('id, timestamp, url')
      .eq('project_id', project.id)
      .order('timestamp', { ascending: false });

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
      continue;
    }

    console.log(`\nTotal visits: ${allVisits.length}`);

    // Group by date
    const visitsByDate = {};
    allVisits.forEach(visit => {
      const date = visit.timestamp?.slice(0, 10);
      if (date) {
        if (!visitsByDate[date]) {
          visitsByDate[date] = [];
        }
        visitsByDate[date].push(visit);
      }
    });

    console.log('\nVisits by date:');
    const sortedDates = Object.keys(visitsByDate).sort().reverse();
    sortedDates.slice(0, 5).forEach(date => {
      const isToday = date === todayStr;
      const isYesterday = date === yesterdayStr;
      const marker = isToday ? ' ← TODAY' : isYesterday ? ' ← YESTERDAY' : '';
      console.log(`  ${date}: ${visitsByDate[date].length} visits${marker}`);
    });

    const clicksToday = allVisits.filter(v => v.timestamp?.startsWith(todayStr)).length;
    const clicksYesterday = allVisits.filter(v => v.timestamp?.startsWith(yesterdayStr)).length;

    console.log(`\nFiltered counts:`);
    console.log(`  Today (${todayStr}): ${clicksToday}`);
    console.log(`  Yesterday (${yesterdayStr}): ${clicksYesterday}`);

    const percentage = calculateClickPercentageChange(clicksToday, clicksYesterday);
    
    console.log(`\nCalculation:`);
    if (clicksYesterday === 0) {
      console.log(`  Yesterday = 0, Today = ${clicksToday}`);
      console.log(`  Result: ${percentage}% (100% if today > 0, else 0%)`);
    } else {
      console.log(`  Formula: ((${clicksToday} - ${clicksYesterday}) / ${clicksYesterday}) * 100`);
      console.log(`  = (${clicksToday - clicksYesterday} / ${clicksYesterday}) * 100`);
      console.log(`  = ${percentage}%`);
    }
    
    console.log(`\n✓ FINAL PERCENTAGE: ${percentage}%`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('DEBUG COMPLETE');
  console.log('='.repeat(80));
}

debugPercentages().catch(console.error);
