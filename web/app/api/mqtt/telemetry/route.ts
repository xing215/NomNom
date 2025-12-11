import { NextResponse } from 'next/server';

import { getTelemetrySnapshot, warmMqttConnection } from '@/lib/server/mqttClient';
import { ensureTelemetryPersistence } from '@/lib/server/telemetryPersistence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  ensureTelemetryPersistence();

  try {
    await warmMqttConnection();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to connect to MQTT broker.' },
      { status: 502 }
    );
  }

  const snapshot = getTelemetrySnapshot();

  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
