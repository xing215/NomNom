import { NextRequest, NextResponse } from 'next/server';

import { sendAutoFeedConfig } from '@/lib/server/mqttClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const grams = Number(payload.grams ?? payload.targetGrams);
  const intervalMinutes = Number(payload.intervalMinutes ?? payload.interval ?? payload.minutes);
  const enabled = typeof payload.enabled === 'boolean' ? payload.enabled : true;
  const firstFeedAt = typeof payload.firstFeedAt === 'string' ? payload.firstFeedAt : undefined;

  if (!Number.isFinite(grams) || grams <= 0) {
    return NextResponse.json({ error: 'grams must be a positive number.' }, { status: 422 });
  }

  if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) {
    return NextResponse.json({ error: 'intervalMinutes must be a positive number.' }, { status: 422 });
  }

  try {
    await sendAutoFeedConfig({ grams, intervalMinutes, enabled, firstFeedAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to publish MQTT message.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, config: { grams, intervalMinutes, enabled, firstFeedAt } });
}
