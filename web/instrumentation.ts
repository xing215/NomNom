/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Server starting - initializing services...');
    
    // Initialize MQTT and telemetry persistence
    const { warmMqttConnection } = await import('@/lib/server/mqttClient');
    const { ensureTelemetryPersistence } = await import('@/lib/server/telemetryPersistence');
    
    try {
      console.log('[Instrumentation] Starting MQTT connection...');
      await warmMqttConnection();
      console.log('[Instrumentation] MQTT connected successfully');
      
      console.log('[Instrumentation] Binding telemetry persistence...');
      ensureTelemetryPersistence();
      console.log('[Instrumentation] Telemetry persistence initialized');
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize services:', error);
    }
  }
}
