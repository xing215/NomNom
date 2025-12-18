function getISOWeek(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

function getISOWeekYear(date) {
  const target = new Date(date);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  return target.getFullYear();
}

function toWeekKey(date) {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekStart(date) {
  const start = new Date(date);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfIsoWeek(weekString) {
  const [yearPart, weekPart] = weekString.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  
  // Find the first Thursday of the year (ISO week date system is based on Thursday)
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Convert Sunday (0) to 7
  const firstMonday = new Date(Date.UTC(year, 0, 4 - jan4Day + 1));
  
  // Add weeks to get to the target week
  const targetMonday = new Date(firstMonday);
  targetMonday.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7);
  
  // Convert to local date at midnight
  const result = new Date(targetMonday.getUTCFullYear(), targetMonday.getUTCMonth(), targetMonday.getUTCDate());
  result.setHours(0, 0, 0, 0);
  return result;
}

const today = new Date('2025-12-18');
const monday = new Date('2025-12-15');

console.log('Today:', today.toISOString());
console.log('Monday of this week:', monday.toISOString());
console.log('Week key for Monday:', toWeekKey(monday));
console.log('Week key for today:', toWeekKey(today));

const weekKey = toWeekKey(monday);
console.log('\nReverse calculation:');
console.log('Week key:', weekKey);
const reconstructed = getStartOfIsoWeek(weekKey);
console.log('Reconstructed Monday:', reconstructed.toISOString());
