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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to publish MQTT message.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
