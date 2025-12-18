import { NextResponse } from 'next/server';

import { getTelemetrySnapshot, warmMqttConnection } from '@/lib/server/mqttClient';
import { ensureTelemetryPersistence } from '@/lib/server/telemetryPersistence';
import { getLatestSensorData, getLatestBowlWeight, getLatestContainerWeight, getLatestCatBegging } from '@/lib/server/database';

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
  
  // If MQTT data doesn't have temperature/humidity, try loading from database
  if (snapshot.summary.temperature === undefined || snapshot.summary.humidity === undefined) {
    const dbData = await getLatestSensorData();
    
    if (dbData) {
      // Use database values if MQTT doesn't have them
      if (snapshot.summary.temperature === undefined) {
        snapshot.summary.temperature = dbData.temperature;
      }
      if (snapshot.summary.humidity === undefined) {
        snapshot.summary.humidity = dbData.humidity;
      }
      // Update the timestamp if we're using DB data and there's no MQTT update time
      if (!snapshot.summary.updatedAt) {
        snapshot.summary.updatedAt = dbData.recordedAt;
      }
    }
  }

  // If MQTT doesn't have bowl weight (loadcell), try loading from database
  if (snapshot.summary.weightGrams === undefined) {
    const bowlData = await getLatestBowlWeight();
    if (bowlData) {
      snapshot.summary.weightGrams = bowlData.weightGrams;
      if (!snapshot.summary.updatedAt) {
        snapshot.summary.updatedAt = bowlData.recordedAt;
      }
    }
  }

  // If MQTT doesn't have distance (ToF), try loading from database
  if (snapshot.summary.distanceMm === undefined) {
    const containerData = await getLatestContainerWeight();
    if (containerData) {
      // The weight field stores the distance for ToF sensor
      snapshot.summary.distanceMm = containerData.weightGrams;
      if (!snapshot.summary.updatedAt) {
        snapshot.summary.updatedAt = containerData.recordedAt;
      }
    }
  }

  // Add cat begging status from database
  const catBegging = await getLatestCatBegging();
  if (catBegging && snapshot.summary.limitSwitchPressed === undefined) {
    // Check if begging event is recent (within last 5 minutes)
    const beggingTime = new Date(catBegging.detectedAt).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now - beggingTime < fiveMinutes && !catBegging.triggered) {
      snapshot.summary.limitSwitchPressed = true;
    }
  }

  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
