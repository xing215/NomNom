import 'server-only';

/**
 * Pushsafer notification service for NomNom cat feeder
 * Handles push notifications for various events:
 * - Cat begging for food
 * - Automatic feeding
 * - Low food in container
 * - Abnormal environment conditions
 */

export interface PushsaferOptions {
  k: string;           // Private or Alias Key (required)
  m: string;           // Message (required)
  t?: string;          // Title
  d?: string;          // Device (default: 'a' for all devices)
  s?: number;          // Sound (0-62, empty=device default)
  v?: number;          // Vibration (1-3, empty=device default)
  i?: number;          // Icon (1-181, default=1)
  c?: string;          // Icon Color (Hexadecimal like #FF0000)
  u?: string;          // URL/Link
  ut?: string;         // URL Title
  p?: string;          // Picture Data URL (Base64)
  p2?: string;         // Picture 2 Data URL (Base64)
  p3?: string;         // Picture 3 Data URL (Base64)
  is?: number;         // Image Size (0-3: 1024px, 768px, 512px, 256px)
  l?: number;          // Time to Live (0-43200 minutes)
  pr?: number;         // Priority (-2 to 2)
  re?: number;         // Retry/resend (60-10800 seconds in 60s steps)
  ex?: number;         // Expire (60-10800 seconds)
  a?: number;          // Answer possible (0 or 1)
  ao?: string;         // Answer Options (pipe separated)
  af?: number;         // Force Answer (0 or 1)
  cr?: number;         // Confirm/resend (10-10800 seconds in 10s steps)
  g?: string;          // GIPHY GIF Code
}

const PUSHSAFER_API_URL = 'https://www.pushsafer.com/api';

/**
 * Get Pushsafer API key from environment
 * Can be configured via PUSHSAFER_KEY environment variable
 */
export function getPushsaferKey(): string {
  const key = process.env.PUSHSAFER_KEY || 'gB1ueRTD71zj1JsL0yZe';
  return key;
}

/**
 * Send a push notification via Pushsafer API
 */
export async function sendPushNotification(options: Omit<PushsaferOptions, 'k'>): Promise<boolean> {
  const key = getPushsaferKey();
  
  console.log('[Pushsafer] Attempting to send notification with key:', key ? `${key.substring(0, 8)}...` : 'NOT SET');
  
  if (!key) {
    console.error('[Pushsafer] API key not configured');
    return false;
  }

  const payload: PushsaferOptions = {
    k: key,
    d: 'a', // Send to all devices by default
    ...options,
  };

  try {
    const formData = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    console.log('[Pushsafer] Sending POST request to:', PUSHSAFER_API_URL);
    console.log('[Pushsafer] Payload:', { title: options.t, message: options.m });

    const response = await fetch(PUSHSAFER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('[Pushsafer] API response status:', response.status);
    console.log('[Pushsafer] API response body:', responseText);

    if (!response.ok) {
      console.error('[Pushsafer] API error:', response.status, responseText);
      return false;
    }

    try {
      const result = JSON.parse(responseText);
      console.log('[Pushsafer] Notification sent successfully:', result);
      return true;
    } catch {
      // Response might not be JSON
      console.log('[Pushsafer] Notification sent successfully (non-JSON response)');
      return true;
    }
  } catch (error) {
    console.error('[Pushsafer] Error sending notification:', error);
    return false;
  }
}

/**
 * Send notification when cat is begging for food
 */
export async function notifyCatBegging(): Promise<boolean> {
  return sendPushNotification({
    t: '🐱 Mèo đang xin ăn!',
    m: 'Mèo của bạn đang xin ăn. Bạn có muốn cho mèo ăn ngay không?',
    i: 8,           // Cat icon
    c: '#FF6B6B',   // Red color
    pr: 1,          // High priority
    s: 8,           // Notification sound
    v: 2,           // Medium vibration
    u: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/main` : undefined,
    ut: 'Mở NomNom',
  });
}

/**
 * Send notification when automatic feeding occurs
 */
export async function notifyAutoFeed(grams: number): Promise<boolean> {
  return sendPushNotification({
    t: '🍽️ Cho mèo ăn tự động',
    m: `NomNom đã tự động cho mèo ăn ${grams}g thức ăn theo lịch trình.`,
    i: 33,          // Check/success icon
    c: '#51CF66',   // Green color
    pr: 0,          // Normal priority
    s: 24,          // Soft notification sound
    v: 1,           // Light vibration
    u: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/history` : undefined,
    ut: 'Xem lịch sử',
  });
}

/**
 * Send notification when food container is running low
 */
export async function notifyLowFood(distanceMm: number, estimatedPercentage: number): Promise<boolean> {
  return sendPushNotification({
    t: '⚠️ Sắp hết thức ăn!',
    m: `Thùng chứa thức ăn sắp hết (còn ~${estimatedPercentage}%). Vui lòng nạp thêm thức ăn cho mèo.`,
    i: 10,          // Warning icon
    c: '#FFD43B',   // Yellow color
    pr: 1,          // High priority
    s: 15,          // Alert sound
    v: 3,           // Strong vibration
    u: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/main` : undefined,
    ut: 'Kiểm tra',
  });
}

/**
 * Send notification when environment is abnormal
 */
export async function notifyAbnormalEnvironment(
  temperature: number,
  humidity: number,
  issue: 'temperature' | 'humidity' | 'both'
): Promise<boolean> {
  let message = '';
  
  if (issue === 'temperature') {
    message = `Nhiệt độ bất thường (${temperature}°C). Môi trường có thể khiến mèo không thoải mái.`;
  } else if (issue === 'humidity') {
    message = `Độ ẩm bất thường (${humidity}%). Môi trường có thể khiến mèo không thoải mái.`;
  } else {
    message = `Nhiệt độ (${temperature}°C) và độ ẩm (${humidity}%) bất thường. Môi trường có thể khiến mèo không thoải mái.`;
  }

  return sendPushNotification({
    t: '🌡️ Môi trường bất thường',
    m: message,
    i: 67,          // Temperature/thermometer icon
    c: '#FF8787',   // Light red color
    pr: 1,          // High priority
    s: 12,          // Alert sound
    v: 2,           // Medium vibration
    u: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/main` : undefined,
    ut: 'Kiểm tra môi trường',
  });
}

/**
 * Check if environment conditions are abnormal
 * Returns the type of issue or null if everything is normal
 */
export function checkEnvironmentAbnormality(
  temperature: number,
  humidity: number
): 'temperature' | 'humidity' | 'both' | null {
  // Comfortable temperature range for cats: 18-26°C
  const tempAbnormal = temperature < 18 || temperature > 30;
  
  // Comfortable humidity range: 40-70%
  const humidityAbnormal = humidity < 30 || humidity > 80;

  if (tempAbnormal && humidityAbnormal) {
    return 'both';
  } else if (tempAbnormal) {
    return 'temperature';
  } else if (humidityAbnormal) {
    return 'humidity';
  }
  
  return null;
}

/**
 * Calculate estimated food percentage based on ToF distance
 * Lower distance = more food, higher distance = less food
 * Adjust these values based on your actual container dimensions
 */
export function calculateFoodPercentage(distanceMm: number): number {
  // Example calibration:
  // - 50mm = full (100%)
  // - 200mm = empty (0%)
  const FULL_DISTANCE = 50;    // mm when container is full
  const EMPTY_DISTANCE = 200;  // mm when container is empty
  
  if (distanceMm <= FULL_DISTANCE) return 100;
  if (distanceMm >= EMPTY_DISTANCE) return 0;
  
  const percentage = 100 - ((distanceMm - FULL_DISTANCE) / (EMPTY_DISTANCE - FULL_DISTANCE)) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage)));
}
