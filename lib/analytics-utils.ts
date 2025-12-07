/**
 * Shared analytics utility functions
 */

/**
 * Calculate percentage change between today's clicks and yesterday's clicks
 * @param clicksToday - Number of clicks today
 * @param clicksYesterday - Number of clicks yesterday
 * @returns Percentage change rounded to 1 decimal place
 */
export function calculateClickPercentageChange(
  clicksToday: number,
  clicksYesterday: number
): number {
  let percent = 0;

  if (clicksYesterday === 0 && clicksToday === 0) {
    // No clicks yesterday or today
    percent = 0;
  } else if (clicksYesterday === 0 && clicksToday > 0) {
    // New activity today with none yesterday
    percent = 100;
  } else if (clicksYesterday > 0) {
    // Normal calculation: (today - yesterday) / yesterday * 100
    percent = ((clicksToday - clicksYesterday) / clicksYesterday) * 100;
  }

  return Math.round(percent * 10) / 10;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Get yesterday's date string in YYYY-MM-DD format
 */
export function getYesterdayDateString(): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}
