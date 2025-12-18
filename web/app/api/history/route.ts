import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FeedingLog from '@/models/FeedingLog';
import CatBeggingLog from '@/models/CatBeggingLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Get feeding history data
 * Query params:
 * - weekStart: ISO date string for start of week (e.g., "2025-11-11")
 * - weeks: number of weeks to fetch (default: 4)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get('weekStart');
    const weeksParam = searchParams.get('weeks');
    
    const weeks = weeksParam ? parseInt(weeksParam, 10) : 4;
    
    // Default to current week if not specified
    const now = new Date();
    const defaultWeekStart = getStartOfIsoWeek(now);
    const weekStart = weekStartParam ? new Date(weekStartParam) : defaultWeekStart;
    
    // Calculate date range for the requested weeks
    const startDate = new Date(weekStart);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (weeks * 7));
    endDate.setHours(23, 59, 59, 999);

    // Fetch feeding logs from MongoDB
    const feedingLogs = await FeedingLog.find({
      deviceId: 'NomNom-01',
      feedingTime: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ feedingTime: -1 })
      .lean()
      .exec();

    // Fetch cat begging logs from MongoDB
    const catBeggingLogs = await CatBeggingLog.find({
      deviceId: 'NomNom-01',
      detectedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ detectedAt: -1 })
      .lean()
      .exec();

    // Group data by week
    const weeklyData: Record<string, any> = {};

    feedingLogs.forEach((log) => {
      const feedingDate = new Date(log.feedingTime);
      const logWeekStart = getStartOfIsoWeek(feedingDate);
      const weekKey = toWeekKey(logWeekStart);

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: logWeekStart.toISOString(),
          weekly: initializeWeeklyChart(),
          history: [],
        };
      }

      // Add to daily totals
      const dayIndex = (feedingDate.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
      weeklyData[weekKey].weekly[dayIndex].grams += log.amount;

      // Add to history entries
      weeklyData[weekKey].history.push({
        timestamp: log.feedingTime.toISOString(),
        grams: log.amount,
        type: log.feedingType === 'automatic' ? 'Scheduled' : 'Manual',
        eventType: 'feeding',
        notes: log.notes,
      });
    });

    // Add cat begging logs to history
    catBeggingLogs.forEach((log) => {
      const beggingDate = new Date(log.detectedAt);
      const logWeekStart = getStartOfIsoWeek(beggingDate);
      const weekKey = toWeekKey(logWeekStart);

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: logWeekStart.toISOString(),
          weekly: initializeWeeklyChart(),
          history: [],
        };
      }

      // Add cat begging to history entries
      weeklyData[weekKey].history.push({
        timestamp: log.detectedAt.toISOString(),
        grams: 0,
        type: 'Cat Begging',
        eventType: 'begging',
        triggered: log.triggered,
      });
    });

    // Sort history entries by timestamp descending
    Object.values(weeklyData).forEach((week: any) => {
      week.history.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    return NextResponse.json({
      weeklyData,
      totalLogs: feedingLogs.length,
    });
  } catch (error) {
    console.error('[API] Error fetching feeding history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch feeding history' },
      { status: 500 }
    );
  }
}

/**
 * Get start of ISO week (Monday) for a given date
 */
function getStartOfIsoWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday = 1, Sunday = 0
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Convert date to week key format (e.g., "2025-W46")
 * Uses ISO 8601 week numbering
 */
function toWeekKey(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Get ISO week number for a date
 */
function getISOWeek(date: Date): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Get ISO week year for a date
 */
function getISOWeekYear(date: Date): number {
  const target = new Date(date);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  return target.getFullYear();
}

/**
 * Initialize empty weekly chart data
 */
function initializeWeeklyChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({ day, grams: 0 }));
}
