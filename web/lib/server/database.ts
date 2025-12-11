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
