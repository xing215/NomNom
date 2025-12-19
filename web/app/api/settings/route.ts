import connectToDatabase from '@/lib/mongodb';
import { sendAutoFeedConfig } from '@/lib/server/mqttClient';
import FeedingSettings from '@/models/FeedingSettings';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_DEVICE_ID = 'NomNom-01';

/**
 * GET /api/settings - Lấy settings hiện tại
 * Sử dụng findOneAndUpdate với upsert để đảm bảo chỉ có 1 document per deviceId
 */
export async function GET() {
    try {
        await connectToDatabase();

        // Sử dụng findOneAndUpdate với upsert để tránh race condition
        // Nếu chưa có document thì tạo mới, nếu có rồi thì trả về document hiện tại
        const settings = await FeedingSettings.findOneAndUpdate(
            { deviceId: DEFAULT_DEVICE_ID },
            {
                $setOnInsert: {
                    deviceId: DEFAULT_DEVICE_ID,
                    feedingInterval: 360, // 6 hours
                    amountPerFeeding: 50,
                    maxBowlCapacity: 500,
                    isAutoFeedingEnabled: true,
                    defaultTreatAmount: 100,
                }
            },
            { new: true, upsert: true, runValidators: true }
        ).lean();

        return NextResponse.json({
            deviceId: settings.deviceId,
            feedingInterval: settings.feedingInterval,
            amountPerFeeding: settings.amountPerFeeding,
            maxBowlCapacity: settings.maxBowlCapacity,
            isAutoFeedingEnabled: settings.isAutoFeedingEnabled,
            defaultTreatAmount: settings.defaultTreatAmount,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error('[API] Error fetching settings:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/settings - Cập nhật settings
 */
export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();

        const updateData: Partial<{
            feedingInterval: number;
            amountPerFeeding: number;
            maxBowlCapacity: number;
            isAutoFeedingEnabled: boolean;
            defaultTreatAmount: number;
        }> = {};

        // Validate và thêm các fields được gửi lên
        if (typeof body.feedingInterval === 'number' && body.feedingInterval > 0) {
            updateData.feedingInterval = body.feedingInterval;
        }
        if (typeof body.amountPerFeeding === 'number' && body.amountPerFeeding > 0) {
            updateData.amountPerFeeding = body.amountPerFeeding;
        }
        if (typeof body.maxBowlCapacity === 'number' && body.maxBowlCapacity > 0) {
            updateData.maxBowlCapacity = body.maxBowlCapacity;
        }
        if (typeof body.isAutoFeedingEnabled === 'boolean') {
            updateData.isAutoFeedingEnabled = body.isAutoFeedingEnabled;
        }
        if (typeof body.defaultTreatAmount === 'number' && body.defaultTreatAmount > 0) {
            updateData.defaultTreatAmount = body.defaultTreatAmount;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const settings = await FeedingSettings.findOneAndUpdate(
            { deviceId: DEFAULT_DEVICE_ID },
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        ).lean();

        if (settings && (
            updateData.isAutoFeedingEnabled !== undefined ||
            updateData.feedingInterval !== undefined ||
            updateData.amountPerFeeding !== undefined
        )) {
            try {
                await sendAutoFeedConfig({
                    enabled: settings.isAutoFeedingEnabled ?? false,
                    grams: settings.amountPerFeeding ?? 50,
                    intervalMinutes: settings.feedingInterval ?? 360,
                });
                console.log('[API] Auto-feed config published to MQTT');
            } catch (mqttError) {
                console.error('[API] Failed to publish auto-feed config to MQTT:', mqttError);
            }
        }

        return NextResponse.json({
            message: 'Settings updated successfully',
            deviceId: settings?.deviceId,
            feedingInterval: settings?.feedingInterval,
            amountPerFeeding: settings?.amountPerFeeding,
            maxBowlCapacity: settings?.maxBowlCapacity,
            isAutoFeedingEnabled: settings?.isAutoFeedingEnabled,
            defaultTreatAmount: settings?.defaultTreatAmount,
            updatedAt: settings?.updatedAt,
        });
    } catch (error) {
        console.error('[API] Error updating settings:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update settings' },
            { status: 500 }
        );
    }
}
