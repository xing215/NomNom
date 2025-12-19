import connectToDatabase from '@/lib/mongodb';
import FeedingLog from '@/models/FeedingLog';
import FeedingSettings from '@/models/FeedingSettings';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_DEVICE_ID = 'NomNom-01';

interface UpcomingFeeding {
    time: string;
    amount: number;
    note: string;
}

interface FeedingHistoryItem {
    id: string;
    time: string;
    amount: number;
    note: string;
    type: 'automatic' | 'manual';
    timestamp: Date;
}

/**
 * GET /api/feeding-schedule - Lấy upcoming feedings và feeding history
 */
export async function GET() {
    try {
        await connectToDatabase();

        // Lấy settings để tính toán upcoming feedings
        const dbSettings = await FeedingSettings.findOne({ deviceId: DEFAULT_DEVICE_ID }).lean();

        const settings = dbSettings ?? {
            deviceId: DEFAULT_DEVICE_ID,
            feedingInterval: 360,
            amountPerFeeding: 50,
            isAutoFeedingEnabled: true,
            maxBowlCapacity: 100,
            defaultTreatAmount: 25,
        };

        // Lấy feeding logs gần nhất (trong 24 giờ qua)
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recentLogs = await FeedingLog.find({
            deviceId: DEFAULT_DEVICE_ID,
            feedingTime: { $gte: oneDayAgo },
        })
            .sort({ feedingTime: -1 })
            .limit(20)
            .lean();

        // Tính toán upcoming feedings dựa trên settings
        const upcomingFeedings: UpcomingFeeding[] = [];

        if (settings.isAutoFeedingEnabled) {
            const intervalMs = (settings.feedingInterval ?? 360) * 60 * 1000;

            // Tính từ 0:00 của ngày hôm nay
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);

            // Tìm lần cho ăn tiếp theo từ hiện tại
            // Bắt đầu từ 0:00 và cộng interval cho đến khi vượt qua thời gian hiện tại
            let nextFeedTime = new Date(startOfDay);
            while (nextFeedTime <= now) {
                nextFeedTime = new Date(nextFeedTime.getTime() + intervalMs);
            }

            // Tạo 2 upcoming feedings
            for (let i = 0; i < 2; i++) {
                const feedTime = new Date(nextFeedTime.getTime() + i * intervalMs);
                upcomingFeedings.push({
                    time: formatTime(feedTime),
                    amount: settings.amountPerFeeding ?? 50,
                    note: 'Scheduled',
                });
            }
        }

        // Format feeding history
        const feedingHistory: FeedingHistoryItem[] = recentLogs.map(log => ({
            id: (log._id as { toString(): string }).toString(),
            time: formatTime(new Date(log.feedingTime)),
            amount: log.amount,
            note: log.feedingType === 'automatic' ? 'Auto Feed' : 'Manual Feed',
            type: log.feedingType as 'automatic' | 'manual',
            timestamp: log.feedingTime,
        }));

        return NextResponse.json({
            upcomingFeedings,
            feedingHistory,
            settings: {
                feedingInterval: settings.feedingInterval,
                amountPerFeeding: settings.amountPerFeeding,
                isAutoFeedingEnabled: settings.isAutoFeedingEnabled,
            },
        });
    } catch (error) {
        console.error('[API] Error fetching feeding schedule:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch feeding schedule' },
            { status: 500 }
        );
    }
}

/**
 * Format time to display string (e.g., "7:00 AM")
 */
function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
