import 'server-only';

import mqtt, {
  type IClientOptions,
  type IClientPublishOptions,
  type MqttClient,
} from 'mqtt';

export interface ManualFeedCommand {
  grams: number;
  note?: string;
  source?: string;
}

export interface AutoFeedConfig {
  grams: number;
  intervalMinutes: number;
  enabled: boolean;
  firstFeedAt?: string;
}

export interface TelemetryMessage<T = unknown> {
  topic: string;
  raw: string;
  receivedAt: string;
  parsed?: T;
}

interface TelemetrySummary {
  weightGrams?: number;
  humidity?: number;
  temperature?: number;
  distanceMm?: number;
  limitSwitchPressed?: boolean;
  bowlLikelyEmpty?: boolean;
}

export interface TelemetrySnapshot {
  connection: {
    connected: boolean;
    lastConnectedAt?: string | null;
    lastMessageAt?: string | null;
  };
  topics: Partial<Record<TopicKey, TelemetryMessage>>;
  summary: TelemetrySummary & { updatedAt?: string };
}

type TopicKey =
  | 'loadcell'
  | 'environment'
  | 'tof'
  | 'limitSwitch'
  | 'motorStatus'
  | 'heartbeat';

const MQTT_URL = process.env.MQTT_URL;
const MQTT_PROTOCOL = (process.env.MQTT_PROTOCOL ?? 'mqtt') as
  | 'mqtt'
  | 'mqtts'
  | 'ws'
  | 'wss';
const MQTT_HOST = process.env.MQTT_HOST ?? 'broker.hivemq.com';
const MQTT_PORT = Number(process.env.MQTT_PORT ?? '1883');
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const MQTT_TOPIC_BASE = process.env.MQTT_TOPIC_BASE ?? '/23CLC03/NomNom';

const MANUAL_FEED_TOPIC = `${MQTT_TOPIC_BASE}/motor/manual_feed`;
const AUTO_FEED_TOPIC = `${MQTT_TOPIC_BASE}/motor/auto_feed_config`;

const TELEMETRY_TOPICS: Record<TopicKey, string> = {
  loadcell: `${MQTT_TOPIC_BASE}/loadcell`,
  environment: `${MQTT_TOPIC_BASE}/humid`,
  tof: `${MQTT_TOPIC_BASE}/tof`,
  limitSwitch: `${MQTT_TOPIC_BASE}/ls`,
  motorStatus: `${MQTT_TOPIC_BASE}/motor/status`,
  heartbeat: `${MQTT_TOPIC_BASE}/status`,
};

const topicKeyFromName = new Map<string, TopicKey>(
  Object.entries(TELEMETRY_TOPICS).map(([key, topic]) => [topic, key as TopicKey])
);

const subscriptionTopics = Object.values(TELEMETRY_TOPICS);

export type MqttMessageListener = (message: TelemetryMessage) => void | Promise<void>;

const mqttMessageListeners = new Set<MqttMessageListener>();

let client: MqttClient | null = null;
let clientPromise: Promise<MqttClient> | null = null;
let listenersBound = false;
let isConnected = false;
let lastConnectedAt: string | null = null;
let lastMessageAt: string | null = null;

const telemetryTopics: Partial<Record<TopicKey, TelemetryMessage>> = {};
const telemetrySummary: TelemetrySummary & { updatedAt?: string } = {};

const baseOptions: IClientOptions = {
  clean: true,
  keepalive: 90,
  reconnectPeriod: 1000,
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
};

function resolveUrl() {
  if (MQTT_URL) {
    return MQTT_URL;
  }
  return `${MQTT_PROTOCOL}://${MQTT_HOST}:${MQTT_PORT}`;
}

function cloneSnapshot(): TelemetrySnapshot {
  const topics: Partial<Record<TopicKey, TelemetryMessage>> = {};
  for (const [key, value] of Object.entries(telemetryTopics) as [TopicKey, TelemetryMessage | undefined][]) {
    if (!value) {
      continue;
    }
    topics[key] = { ...value };
  }

  const summary = { ...telemetrySummary };

  // If no limit switch message received in the last 10 seconds, assume not pressed
  const limitSwitchMessage = telemetryTopics.limitSwitch;
  if (limitSwitchMessage) {
    const lastReceived = new Date(limitSwitchMessage.receivedAt).getTime();
    const now = Date.now();
    if (now - lastReceived > 10000) { // 10 seconds
      summary.limitSwitchPressed = false;
    }
  } else {
    summary.limitSwitchPressed = false;
  }

  return {
    connection: {
      connected: isConnected,
      lastConnectedAt,
      lastMessageAt,
    },
    topics,
    summary,
  };
}

export function registerMqttListener(listener: MqttMessageListener) {
  mqttMessageListeners.add(listener);
  return () => mqttMessageListeners.delete(listener);
}

function notifyMessageListeners(message: TelemetryMessage) {
  if (!mqttMessageListeners.size) {
    return;
  }

  for (const listener of mqttMessageListeners) {
    Promise.resolve(listener(message)).catch((error) => {
      console.error('[MQTT] Listener error', error);
    });
  }
}

function bindClientListeners(instance: MqttClient) {
  if (listenersBound) {
    return;
  }
  listenersBound = true;

  const handleConnected = () => {
    isConnected = true;
    lastConnectedAt = new Date().toISOString();

    instance.subscribe(subscriptionTopics, { qos: 0 }, (err) => {
      if (err) {
        console.error('[MQTT] Failed to subscribe to telemetry topics', err);
      }
    });
  };

  instance.on('connect', handleConnected);

  instance.on('message', (topic, payload) => {
    lastMessageAt = new Date().toISOString();
    const raw = payload.toString('utf8');
    const key = topicKeyFromName.get(topic);
    let parsed: unknown;

    console.log('[MQTT] Message received - Topic:', topic, 'Raw:', raw);

    if (raw.length) {
      try {
        parsed = JSON.parse(raw);
        console.log('[MQTT] Parsed:', parsed);
      } catch (error) {
        console.error('[MQTT] Failed to parse JSON:', error);
        parsed = undefined;
      }
    }

    const message: TelemetryMessage = {
      topic,
      raw,
      receivedAt: lastMessageAt,
      parsed,
    };

    if (key) {
      telemetryTopics[key] = message;
      updateTelemetrySummary(key, parsed);
    }

    console.log('[MQTT] Notifying', mqttMessageListeners.size, 'listeners');
    notifyMessageListeners(message);
  });

  instance.on('close', () => {
    isConnected = false;
    listenersBound = false;
    client = null;
    clientPromise = null;
  });

  instance.on('error', (error) => {
    console.error('[MQTT] Client error', error);
  });
  if (instance.connected) {
    handleConnected();
  }
}

async function ensureClient(): Promise<MqttClient> {
  if (client && client.connected) {
    return client;
  }

  if (clientPromise) {
    return clientPromise;
  }

  clientPromise = new Promise((resolve, reject) => {
    const instance = mqtt.connect(resolveUrl(), baseOptions);

    const handleError = (error: unknown) => {
      instance.removeListener('connect', handleConnect);
      clientPromise = null;
      reject(error);
    };

    const handleConnect = () => {
      client = instance;
      bindClientListeners(instance);
      instance.removeListener('error', handleError);
      resolve(instance);
    };

    instance.once('connect', handleConnect);
    instance.once('error', handleError);
  });

  return clientPromise;
}

async function publishJson(topic: string, payload: unknown, options?: IClientPublishOptions) {
  const instance = await ensureClient();
  const body = JSON.stringify(payload);

  return new Promise<void>((resolve, reject) => {
    instance.publish(topic, body, { qos: 1, retain: false, ...options }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function updateTelemetrySummary(key: TopicKey, parsed: unknown) {
  const receivedAt = new Date().toISOString();
  telemetrySummary.updatedAt = receivedAt;

  if (!parsed || typeof parsed !== 'object') {
    return;
  }

  if (key === 'loadcell') {
    const weight = Number((parsed as Record<string, unknown>).weight_g);
    telemetrySummary.weightGrams = Number.isFinite(weight) ? weight : telemetrySummary.weightGrams;
    if (typeof weight === 'number' && Number.isFinite(weight)) {
      telemetrySummary.bowlLikelyEmpty = weight < 5;
    }
    return;
  }

  if (key === 'environment') {
    const data = parsed as Record<string, unknown>;
    const humidity = Number(data.humidity);
    const temperature = Number(data.temperature);
    telemetrySummary.humidity = Number.isFinite(humidity) ? humidity : telemetrySummary.humidity;
    telemetrySummary.temperature = Number.isFinite(temperature) ? temperature : telemetrySummary.temperature;
    return;
  }

  if (key === 'tof') {
    const distance = Number((parsed as Record<string, unknown>).distance);
    telemetrySummary.distanceMm = Number.isFinite(distance) ? distance : telemetrySummary.distanceMm;
    return;
  }

  if (key === 'limitSwitch') {
    const pressed = (parsed as Record<string, unknown>).pressed;
    telemetrySummary.limitSwitchPressed = Boolean(pressed);
    console.log('Limit switch updated:', telemetrySummary.limitSwitchPressed, 'from message:', parsed);
    return;
  }

  if (key === 'motorStatus' && parsed && typeof parsed === 'object') {
    const status = (parsed as Record<string, unknown>).running;
    if (typeof status === 'boolean') {
      telemetrySummary.bowlLikelyEmpty = !status && telemetrySummary.weightGrams !== undefined
        ? telemetrySummary.weightGrams < 5
        : telemetrySummary.bowlLikelyEmpty;
    }
    return;
  }
}

export async function warmMqttConnection() {
  await ensureClient();
}

export async function sendManualFeedCommand(command: ManualFeedCommand) {
  if (!Number.isFinite(command.grams) || command.grams <= 0) {
    throw new Error('grams must be a positive number');
  }

  await publishJson(MANUAL_FEED_TOPIC, {
    action: 'feed',
    grams: command.grams,
    note: command.note,
    source: command.source ?? 'web',
    requested_at: new Date().toISOString(),
  });
}

export async function sendAutoFeedConfig(config: AutoFeedConfig) {
  if (!Number.isFinite(config.grams) || config.grams <= 0) {
    throw new Error('grams must be a positive number');
  }

  if (!Number.isFinite(config.intervalMinutes) || config.intervalMinutes <= 0) {
    throw new Error('intervalMinutes must be a positive number');
  }

  await publishJson(AUTO_FEED_TOPIC, {
    enabled: config.enabled,
    grams: config.grams,
    interval_minutes: Math.round(config.intervalMinutes),
    first_feed_at: config.firstFeedAt,
    requested_at: new Date().toISOString(),
  }, { retain: true });
}

export function getTelemetrySnapshot(): TelemetrySnapshot {
  return cloneSnapshot();
}
