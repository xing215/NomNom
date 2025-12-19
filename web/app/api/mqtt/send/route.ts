import { NextRequest, NextResponse } from 'next/server';

import { sendMqttMessage } from '@/lib/server/mqttClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const topic = typeof payload.topic === 'string' ? payload.topic : undefined;
  const message = payload.message;

  if (!topic) {
    return NextResponse.json({ error: 'topic must be a string.' }, { status: 422 });
  }

  try {
    await sendMqttMessage(topic, message);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to publish MQTT message.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
