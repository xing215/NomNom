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
    // Save to PostgreSQL telemetry_events table
    await saveTelemetryRecord({
      topic: message.topic,
      raw: message.raw,
      parsed: message.parsed,
      receivedAt: message.receivedAt,
    });

    if (!message.parsed || typeof message.parsed !== 'object') {
      return;
    }

    try {
      const { default: connectToDatabase } = await import('@/lib/mongodb');
      await connectToDatabase();

      // Save temperature and humidity to MongoDB
      if (message.topic.includes('/humid')) {
        const data = message.parsed as Record<string, unknown>;
        const humidity = Number(data.humidity);
        const temperature = Number(data.temperature);
        
        if (Number.isFinite(humidity) && Number.isFinite(temperature)) {
          const { default: SensorData } = await import('@/models/SensorData');
          
          await SensorData.create({
            deviceId: 'NomNom-01',
            temperature,
            humidity,
            recordedAt: new Date(message.receivedAt),
          });
          
          console.log('[DB] Sensor data saved to MongoDB', { temperature, humidity });
        }
      }

      // Save bowl weight (loadcell) to MongoDB
      if (message.topic.includes('/loadcell')) {
        const data = message.parsed as Record<string, unknown>;
        const weight = Number(data.weight_g);
        
        if (Number.isFinite(weight)) {
          const { default: BowlWeight } = await import('@/models/BowlWeight');
          
          await BowlWeight.create({
            deviceId: 'NomNom-01',
            weight,
            recordedAt: new Date(message.receivedAt),
          });
          
          console.log('[DB] Bowl weight saved to MongoDB', { weight });
        }
      }

      // Save container weight (ToF distance) to MongoDB
      if (message.topic.includes('/tof')) {
        const data = message.parsed as Record<string, unknown>;
        const distance = Number(data.distance);
        
        if (Number.isFinite(distance)) {
          const { default: ContainerWeight } = await import('@/models/ContainerWeight');
          
          // Convert distance to estimated weight (you can adjust this calculation)
          // For now, storing distance as weight for ToF sensor
          await ContainerWeight.create({
            deviceId: 'NomNom-01',
            weight: distance,
            recordedAt: new Date(message.receivedAt),
          });
          
          console.log('[DB] Container weight (ToF) saved to MongoDB', { distance });
        }
      }

      // Save limit switch (cat begging detection) to MongoDB
      if (message.topic.includes('/ls')) {
        const data = message.parsed as Record<string, unknown>;
        const pressed = Boolean(data.pressed);
        
        if (pressed) {
          const { default: CatBeggingLog } = await import('@/models/CatBeggingLog');
          
          await CatBeggingLog.create({
            deviceId: 'NomNom-01',
            detectedAt: new Date(message.receivedAt),
            triggered: false,
          });
          
          console.log('[DB] Cat begging detected and saved to MongoDB');
        }
      }
    } catch (error) {
      console.error('[DB] Error saving MQTT data to MongoDB:', error);
    }
  });
}
