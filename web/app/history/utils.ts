export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export type WeeklyChartPoint = {
  day: string;
  grams: number;
};

export type HistoryEntry = {
  timestamp: string;
  grams: number;
  type: 'Scheduled' | 'Manual' | 'Top-up' | 'Cat Begging';
  eventType?: 'feeding' | 'begging';
  notes?: string;
  triggered?: boolean;
};

export type WeekData = {
  weekly: WeeklyChartPoint[];
  history: HistoryEntry[];
};

export type WeekOption = {
  key: string;
  label: string;
};

export function toTwoDigits(value: number): string {
  return value.toString().padStart(2, '0');
}

export function shiftDate(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function getWeekStart(date: Date): Date {
  const start = new Date(date);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function formatDateForDisplay(date: Date): string {
  return `${toTwoDigits(date.getDate())}/${toTwoDigits(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateForTooltip(date: Date): string {
  return `${toTwoDigits(date.getDate())}/${toTwoDigits(date.getMonth() + 1)}`;
}

export function formatWeekRange(start: Date): string {
  const end = shiftDate(start, 6);
  return `${formatDateForDisplay(start)} - ${formatDateForDisplay(end)}`;
}

export function getISOWeek(date: Date): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export function getISOWeekYear(date: Date): number {
  const target = new Date(date);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  return target.getFullYear();
}

export function toWeekKey(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${toTwoDigits(week)}`;
}

export function getStartOfIsoWeek(weekString: string): Date {
  const [yearPart, weekPart] = weekString.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  
  // ISO week calculation: Find Thursday of week 1
  // Week 1 is the week with January 4th
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7; // Convert Sunday (0) to 7
  
  // Find the Monday of week 1 (4 days before Thursday, which is 3 days before)
  const firstMonday = new Date(year, 0, 4 - (jan4Day - 1));
  firstMonday.setHours(0, 0, 0, 0);
  
  // Add (week - 1) * 7 days to get to target week
  const result = new Date(firstMonday);
  result.setDate(firstMonday.getDate() + (week - 1) * 7);
  result.setHours(0, 0, 0, 0);
  
  return result;
}

export function createEmptyWeekData(): WeeklyChartPoint[] {
  return DAY_LABELS.map((day) => ({ day, grams: 0 }));
}

export function getDateForDayLabel(weekStart: Date, dayLabel: string): Date | null {
  const index = DAY_LABELS.indexOf(dayLabel);
  if (index < 0) {
    return null;
  }
  return shiftDate(weekStart, index);
}

export function formatTooltipLabel(dayLabel: string, weekStart: Date): string {
  const date = getDateForDayLabel(weekStart, dayLabel);
  if (!date) {
    return dayLabel;
  }
  return `${dayLabel}, ${formatDateForTooltip(date)}`;
}

export function getYAxisMax(points: WeeklyChartPoint[]): number {
  const maxGrams = points.reduce((acc, point) => Math.max(acc, point.grams), 0);
  const buffer = maxGrams === 0 ? 100 : Math.max(50, Math.round(maxGrams * 0.15));
  const capped = maxGrams + buffer;
  return Math.ceil(capped / 50) * 50;
}

export function getYAxisTicks(max: number): number[] {
  const safeMax = Math.max(max, 100);
  let approxStep = safeMax / 4;
  if (approxStep === 0) {
    approxStep = 25;
  }
  const step = Math.max(25, Math.ceil(approxStep / 25) * 25);
  const ticks: number[] = [];

  for (let value = 0; value <= safeMax; value += step) {
    ticks.push(value);
  }

  if (ticks[ticks.length - 1] !== safeMax) {
    ticks.push(safeMax);
  }

  if (ticks.length < 4) {
    const needed = 4 - ticks.length;
    const extraStep = Math.max(step, 25);
    let lastValue = ticks[ticks.length - 1];
    for (let i = 0; i < needed; i += 1) {
      lastValue += extraStep;
      ticks.push(lastValue);
    }
  }

  return ticks;
}

export function formatHistoryTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const day = toTwoDigits(date.getDate());
  const month = toTwoDigits(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = toTwoDigits(date.getHours());
  const minutes = toTwoDigits(date.getMinutes());
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
}
