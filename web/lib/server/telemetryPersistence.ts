import 'server-only';

import { registerMqttListener } from '@/lib/server/mqttClient';
import { saveTelemetryRecord } from '@/lib/server/database';

let persistenceBound = false;

export function ensureTelemetryPersistence() {
  if (persistenceBound) {
    return;
  }
  persistenceBound = true;

  registerMqttListener(async (message) => {
    await saveTelemetryRecord({
      topic: message.topic,
      raw: message.raw,
      parsed: message.parsed,
      receivedAt: message.receivedAt,
    });
  });
}
