import 'server-only';

import { registerMqttListener } from '@/lib/server/mqttClient';
import { saveTelemetryRecord } from '@/lib/server/database';
import {
  notifyCatBegging,
  notifyLowFood,
  notifyAbnormalEnvironment,
  notifyAutoFeed,
  checkEnvironmentAbnormality,
  calculateFoodPercentage,
} from '@/lib/server/pushsafer';
import {
  emailCatBegging,
  emailLowFood,
  emailAbnormalEnvironment,
  emailAutoFeed,
} from '@/lib/server/email';

let persistenceBound = false;
let lastCatBeggingNotification = 0;
let lastLowFoodNotification = 0;
let lastEnvironmentNotification = 0;
let motorRunning = false;
let currentFeedGrams = 0;
let limitSwitchPreviouslyPressed = false;

// Cooldown periods in milliseconds
const CAT_BEGGING_COOLDOWN = 30 * 1000;       // 30 seconds (for testing)
const LOW_FOOD_COOLDOWN = 60 * 60 * 1000;    // 1 hour
const ENVIRONMENT_COOLDOWN = 30 * 60 * 1000;  // 30 minutes

/**
 * Get user email for the device
 */
async function getUserEmail(): Promise<string | null> {
  try {
    const { default: User } = await import('@/models/User');
    const user = await User.findOne({ deviceId: 'NomNom-01' });
    return user?.email || null;
  } catch (error) {
    console.error('[Email] Error getting user email:', error);
    return null;
  }
}

export function ensureTelemetryPersistence() {
  if (persistenceBound) {
    console.log('[Telemetry] Persistence already bound');
    return;
  }
  persistenceBound = true;
  console.log('[Telemetry] Binding persistence listeners...');

  registerMqttListener(async (message) => {
    console.log('[Telemetry] Listener received message from topic:', message.topic);
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
          
          // Check for abnormal environment and send notification
          const now = Date.now();
          if (now - lastEnvironmentNotification > ENVIRONMENT_COOLDOWN) {
            const abnormality = checkEnvironmentAbnormality(temperature, humidity);
            if (abnormality) {
              lastEnvironmentNotification = now;
              notifyAbnormalEnvironment(temperature, humidity, abnormality).catch((err) => {
                console.error('[Pushsafer] Failed to send environment notification:', err);
              });
              // Also send email
              const userEmail = await getUserEmail();
              if (userEmail) {
                emailAbnormalEnvironment(userEmail, temperature, humidity, abnormality).catch((err) => {
                  console.error('[Email] Failed to send environment email:', err);
                });
              }
            }
          }
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
          
          // Check for low food and send notification
          const foodPercentage = calculateFoodPercentage(distance);
          const now = Date.now();
          if (foodPercentage <= 20 && now - lastLowFoodNotification > LOW_FOOD_COOLDOWN) {
            lastLowFoodNotification = now;
            notifyLowFood(distance, foodPercentage).catch((err) => {
              console.error('[Pushsafer] Failed to send low food notification:', err);
            });
            // Also send email
            const userEmail = await getUserEmail();
            if (userEmail) {
              emailLowFood(userEmail, distance, foodPercentage).catch((err) => {
                console.error('[Email] Failed to send low food email:', err);
              });
            }
          }
        }
      }

      // Save limit switch (cat begging detection) to MongoDB
      if (message.topic.includes('/ls')) {
        const data = message.parsed as Record<string, unknown>;
        const pressed = Boolean(data.pressed);
        
        console.log('[LIMIT SWITCH] Message received:', { pressed, data });
        
        if (pressed) {
          const { default: CatBeggingLog } = await import('@/models/CatBeggingLog');
          
          await CatBeggingLog.create({
            deviceId: 'NomNom-01',
            detectedAt: new Date(message.receivedAt),
            triggered: false,
          });
          
          console.log('[DB] Cat begging detected and saved to MongoDB');
          
          // Send cat begging notification only on rising edge (becomes pressed) with cooldown
          const now = Date.now();
          const timeSinceLastNotif = now - lastCatBeggingNotification;
          console.log('[Pushsafer] Cat begging - time since last notification:', timeSinceLastNotif, 'ms (cooldown:', CAT_BEGGING_COOLDOWN, 'ms)');
          
          if (!limitSwitchPreviouslyPressed && now - lastCatBeggingNotification > CAT_BEGGING_COOLDOWN) {
            lastCatBeggingNotification = now;
            console.log('[Pushsafer] Sending cat begging notification...');
            notifyCatBegging().then((success) => {
              console.log('[Pushsafer] Cat begging notification result:', success);
            }).catch((err) => {
              console.error('[Pushsafer] Failed to send cat begging notification:', err);
            });
            // Also send email
            const userEmail = await getUserEmail();
            if (userEmail) {
              emailCatBegging(userEmail).catch((err) => {
                console.error('[Email] Failed to send cat begging email:', err);
              });
            }
          } else {
            console.log('[Pushsafer] Cat begging notification skipped due to cooldown or already pressed');
          }
        }
        
        // Update previous state
        limitSwitchPreviouslyPressed = pressed;
      }

      // Handle motor status for auto-feed detection
      if (message.topic.includes('/motor/status')) {
        const data = message.parsed as Record<string, unknown>;
        const running = Boolean(data.running);
        const grams = Number(data.grams);
        const source = String(data.source || '');
        
        // Track motor state changes
        if (running && !motorRunning) {
          // Motor just started
          motorRunning = true;
          currentFeedGrams = Number.isFinite(grams) ? grams : 0;
        } else if (!running && motorRunning) {
          // Motor just stopped - feeding completed
          motorRunning = false;
          
          // If this was an automatic feed (not manual), send notification
          if (source === 'auto' || source === 'automatic' || source === 'scheduled') {
            const feedAmount = currentFeedGrams || grams;
            if (feedAmount > 0) {
              notifyAutoFeed(feedAmount).catch((err) => {
                console.error('[Pushsafer] Failed to send auto-feed notification:', err);
              });
              // Also send email
              const userEmail = await getUserEmail();
              if (userEmail) {
                emailAutoFeed(userEmail, feedAmount).catch((err) => {
                  console.error('[Email] Failed to send auto-feed email:', err);
                });
              }
            }
          }
          
          currentFeedGrams = 0;
        }
      }
    } catch (error) {
      console.error('[DB] Error saving MQTT data to MongoDB:', error);
    }
  });
}
