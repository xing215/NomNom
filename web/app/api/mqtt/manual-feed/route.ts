import { NextRequest, NextResponse } from 'next/server';

import { sendManualFeedCommand } from '@/lib/server/mqttClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const grams = Number(payload.grams ?? payload.amount);
  const note = typeof payload.note === 'string' ? payload.note : undefined;

  if (!Number.isFinite(grams) || grams <= 0) {
    return NextResponse.json({ error: 'grams must be a positive number.' }, { status: 422 });
  }

  try {
    await sendManualFeedCommand({ grams, note, source: 'web-app' });

    // Save to database
    try {
      const { default: connectToDatabase } = await import('@/lib/mongodb');
      const { default: CatBeggingLog } = await import('@/models/CatBeggingLog');
      const { default: FeedingLog } = await import('@/models/FeedingLog');

      await connectToDatabase();

      // Save feeding log
      await FeedingLog.create({
        deviceId: 'NomNom-01',
        feedingType: 'manual',
        amount: grams,
        feedingTime: new Date(),
        notes: note,
      });

      // Update the most recent begging log that hasn't been triggered yet
      await CatBeggingLog.findOneAndUpdate(
        { deviceId: 'NomNom-01', triggered: false },
        { triggered: true },
        { sort: { detectedAt: -1 } }
      );

      console.log('[DB] Manual feeding logged successfully');
    } catch (error) {
      console.error('[DB] Error saving feeding log:', error);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to publish MQTT message.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
