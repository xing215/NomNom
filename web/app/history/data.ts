import { WeekData, WeekOption } from './utils';
import { formatWeekRange, getStartOfIsoWeek } from './utils';

export const WEEKLY_HISTORY_DATA: Record<string, WeekData> = {
  '2025-W46': {
    weekly: [
      { day: 'Mon', grams: 450 },
      { day: 'Tue', grams: 320 },
      { day: 'Wed', grams: 380 },
      { day: 'Thu', grams: 340 },
      { day: 'Fri', grams: 310 },
      { day: 'Sat', grams: 420 },
      { day: 'Sun', grams: 360 },
    ],
    history: [
      { timestamp: '2025-11-10T12:00:00', grams: 500, type: 'Scheduled' },
      { timestamp: '2025-11-11T07:30:00', grams: 320, type: 'Manual' },
      { timestamp: '2025-11-13T18:10:00', grams: 280, type: 'Scheduled' },
      { timestamp: '2025-11-15T08:45:00', grams: 360, type: 'Manual' },
    ],
  },
  '2025-W47': {
    weekly: [
      { day: 'Mon', grams: 300 },
      { day: 'Tue', grams: 280 },
      { day: 'Wed', grams: 360 },
      { day: 'Thu', grams: 420 },
      { day: 'Fri', grams: 390 },
      { day: 'Sat', grams: 410 },
      { day: 'Sun', grams: 370 },
    ],
    history: [
      { timestamp: '2025-11-17T07:15:00', grams: 280, type: 'Scheduled' },
      { timestamp: '2025-11-18T19:20:00', grams: 340, type: 'Manual' },
      { timestamp: '2025-11-20T06:50:00', grams: 390, type: 'Scheduled' },
      { timestamp: '2025-11-21T21:05:00', grams: 250, type: 'Manual' },
    ],
  },
};

export const DEFAULT_WEEK_KEY = '2025-W46';
export const DEFAULT_WEEK_START = getStartOfIsoWeek(DEFAULT_WEEK_KEY);

export function buildAvailableWeeks(): WeekOption[] {
  return Object.keys(WEEKLY_HISTORY_DATA)
    .map((key) => {
      const start = getStartOfIsoWeek(key);
      return { key, start };
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .map(({ key, start }) => ({ key, label: formatWeekRange(start) }));
}
