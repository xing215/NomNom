import 'server-only';

import { Pool, type PoolClient } from 'pg';

export interface TelemetryRecord {
  topic: string;
  raw: string;
  parsed?: unknown;
  receivedAt: string;
}

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_SSL = process.env.DATABASE_SSL === 'true';

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (!DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
      max: 2,
    });
  }

  return pool;
}

async function runQuery<T>(callback: (client: PoolClient) => Promise<T>) {
  const db = getPool();
  if (!db) {
    return null;
  }

  const client = await db.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function saveTelemetryRecord(record: TelemetryRecord) {
  const insertedAt = record.receivedAt ?? new Date().toISOString();

  const pendingInsert = await runQuery(async (client) => {
    return client.query(
      `
        INSERT INTO telemetry_events (topic, payload_raw, payload_json, received_at)
        VALUES ($1, $2, $3::jsonb, $4::timestamptz)
      `,
      [
        record.topic,
        record.raw,
        record.parsed ? JSON.stringify(record.parsed) : null,
        insertedAt,
      ]
    );
  });

  if (!pendingInsert) {
    console.log('[DB] Telemetry (no DB configured)', {
      topic: record.topic,
      payload: record.raw,
      parsed: record.parsed,
      receivedAt: insertedAt,
    });
    return;
  }

  console.log('[DB] Telemetry stored', record.topic, insertedAt);
}

export async function getLatestSensorData() {
  try {
    const mongoose = await import('mongoose');
    const { default: SensorData } = await import('@/models/SensorData');
    const { default: connectToDatabase } = await import('@/lib/mongodb');

    await connectToDatabase();

    const latestSensor = await SensorData.findOne()
      .sort({ recordedAt: -1 })
      .limit(1)
      .lean()
      .exec();

    if (!latestSensor) {
      return null;
    }

    return {
      temperature: latestSensor.temperature,
      humidity: latestSensor.humidity,
      recordedAt: latestSensor.recordedAt?.toISOString() ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('[DB] Error fetching latest sensor data:', error);
    return null;
  }
}

export async function getLatestBowlWeight() {
  try {
    const mongoose = await import('mongoose');
    const { default: BowlWeight } = await import('@/models/BowlWeight');
    const { default: connectToDatabase } = await import('@/lib/mongodb');

    await connectToDatabase();

    const latest = await BowlWeight.findOne()
      .sort({ recordedAt: -1 })
      .limit(1)
      .lean()
      .exec();

    if (!latest) {
      return null;
    }

    return {
      weightGrams: latest.weight,
      recordedAt: latest.recordedAt?.toISOString() ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('[DB] Error fetching latest bowl weight:', error);
    return null;
  }
}

export async function getLatestContainerWeight() {
  try {
    const mongoose = await import('mongoose');
    const { default: ContainerWeight } = await import('@/models/ContainerWeight');
    const { default: connectToDatabase } = await import('@/lib/mongodb');

    await connectToDatabase();

    const latest = await ContainerWeight.findOne()
      .sort({ recordedAt: -1 })
      .limit(1)
      .lean()
      .exec();

    if (!latest) {
      return null;
    }

    return {
      weightGrams: latest.weight,
      recordedAt: latest.recordedAt?.toISOString() ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('[DB] Error fetching latest container weight:', error);
    return null;
  }
}

export async function getLatestCatBegging() {
  try {
    const mongoose = await import('mongoose');
    const { default: CatBeggingLog } = await import('@/models/CatBeggingLog');
    const { default: connectToDatabase } = await import('@/lib/mongodb');

    await connectToDatabase();

    const latest = await CatBeggingLog.findOne()
      .sort({ detectedAt: -1 })
      .limit(1)
      .lean()
      .exec();

    if (!latest) {
      return null;
    }

    return {
      detectedAt: latest.detectedAt?.toISOString() ?? new Date().toISOString(),
      triggered: latest.triggered,
    };
  } catch (error) {
    console.error('[DB] Error fetching latest cat begging:', error);
    return null;
  }
}
