#ifndef MOTOR_H
#define MOTOR_H

#include "libs.h"
#include <ArduinoJson.h>

#define MOTOR_PIN D7

// ============== CẤU HÌNH CHUYỂN ĐỔI GRAM -> DURATION ==============
// Công thức: duration (ms) = grams * GRAMS_TO_MS_FACTOR
// Ví dụ: 10 gram * 100 = 1000ms (1 giây)
// Bạn cần calibrate lại giá trị này dựa trên motor thực tế
#define GRAMS_TO_MS_FACTOR 100  // 1 gram = 100ms xoay motor

// ============== BIẾN TOÀN CỤC CHO MOTOR ==============
// Cho ăn thủ công
bool motorManualTrigger = false;        // Flag cho ăn thủ công
int motorManualGrams = 10;              // Số gram khi cho ăn thủ công

// Cho ăn tự động theo interval
bool autoFeedEnabled = false;           // Bật/tắt chế độ tự động
unsigned long autoFeedIntervalMs = 0;   // Interval giữa các lần cho ăn (ms)
int autoFeedGrams = 10;                 // Số gram mỗi lần cho ăn tự động
unsigned long lastAutoFeedTime = 0;     // Thời điểm cho ăn tự động lần cuối

// Forward declarations
void motor_runMotor(int durationMs);
int motor_gramsToMs(int grams);
void motor_processManualFeed(String payload);
void motor_processAutoFeedConfig(String payload);

// External function từ LoadCell.h
extern float LoadCell_getWeight();

/**
 * Chuyển đổi gram thành thời gian xoay motor (ms)
 * @param grams Số gram thức ăn
 * @return Thời gian xoay motor (ms)
 */
int motor_gramsToMs(int grams) {
  // Công thức: duration = grams * factor
  // Có thể thay đổi công thức phức tạp hơn nếu cần
  int duration = grams * GRAMS_TO_MS_FACTOR;
  
  // Giới hạn min/max để tránh lỗi
  if (duration < 100) duration = 100;      // Tối thiểu 100ms
  if (duration > 30000) duration = 30000;  // Tối đa 30 giây
  
  return duration;
}

/**
 * Khởi tạo motor
 */
void motor_setup() {
  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);
  
  Serial.println("[Motor] Initialized");
  Serial.print("[Motor] Conversion factor: 1 gram = ");
  Serial.print(GRAMS_TO_MS_FACTOR);
  Serial.println("ms");
}

/**
 * Xoay motor trong khoảng thời gian nhất định
 * @param durationMs Thời gian xoay (ms)
 */
void motor_runMotor(int durationMs) {
  Serial.print("[Motor] Running for ");
  Serial.print(durationMs);
  Serial.println("ms");
  
  digitalWrite(MOTOR_PIN, HIGH);
  delay(durationMs);
  digitalWrite(MOTOR_PIN, LOW);
  
  Serial.println("[Motor] Stopped");
}

/**
 * Cho ăn với số gram chỉ định
 * @param grams Số gram thức ăn
 */
void motor_feedGrams(int grams) {
  Serial.print("[Motor] Feeding ");
  Serial.print(grams);
  Serial.println(" grams");
  
  int duration = motor_gramsToMs(grams);
  motor_runMotor(duration);
}

/**
 * Xử lý lệnh cho ăn thủ công từ MQTT
 * Format JSON: {"action": "feed", "grams": 15}
 * @param payload JSON string từ MQTT
 */
void motor_processManualFeed(String payload) {
  Serial.print("[Motor] Manual feed command: ");
  Serial.println(payload);
  
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.print("[Motor] JSON parse error: ");
    Serial.println(error.c_str());
    // Nếu không parse được, vẫn cho ăn với gram mặc định
    motorManualTrigger = true;
    motorManualGrams = 10;
    return;
  }
  
  const char* action = doc["action"] | "feed";
  
  if (strcmp(action, "feed") == 0) {
    motorManualTrigger = true;
    motorManualGrams = doc["grams"] | 10;  // Mặc định 10 gram
    Serial.print("[Motor] Manual feed triggered, grams: ");
    Serial.println(motorManualGrams);
  }
}

/**
 * Xử lý cấu hình cho ăn tự động từ MQTT
 * Format JSON:
 * {
 *   "enabled": true,
 *   "interval_minutes": 30,  // Mỗi 30 phút cho ăn 1 lần
 *   "grams": 15              // Mỗi lần cho ăn 15 gram
 * }
 * @param payload JSON string từ MQTT
 */
void motor_processAutoFeedConfig(String payload) {
  Serial.print("[Motor] Auto feed config: ");
  Serial.println(payload);
  
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.print("[Motor] Config JSON parse error: ");
    Serial.println(error.c_str());
    return;
  }
  
  // Cập nhật cấu hình
  autoFeedEnabled = doc["enabled"] | false;
  int intervalMinutes = doc["interval_minutes"] | 60;  // Mặc định 60 phút
  autoFeedGrams = doc["grams"] | 10;  // Mặc định 10 gram
  
  // Chuyển đổi phút -> milliseconds
  autoFeedIntervalMs = (unsigned long)intervalMinutes * 60UL * 1000UL;
  
  // Reset timer khi nhận config mới
  lastAutoFeedTime = millis();
  
  Serial.println("[Motor] Auto feed config updated:");
  Serial.print("  - Enabled: ");
  Serial.println(autoFeedEnabled ? "Yes" : "No");
  Serial.print("  - Interval: ");
  Serial.print(intervalMinutes);
  Serial.println(" minutes");
  Serial.print("  - Grams per feed: ");
  Serial.println(autoFeedGrams);
  Serial.print("  - Duration per feed: ");
  Serial.print(motor_gramsToMs(autoFeedGrams));
  Serial.println("ms");
}

/**
 * Kiểm tra và thực hiện cho ăn tự động theo interval
 * Có tính đến khối lượng thức ăn còn trong tô từ LoadCell
 */
void motor_checkAutoFeed() {
  if (!autoFeedEnabled || autoFeedIntervalMs == 0) {
    return;
  }
  
  unsigned long now = millis();
  
  // Kiểm tra đã đến lúc cho ăn chưa
  if (now - lastAutoFeedTime >= autoFeedIntervalMs) {
    lastAutoFeedTime = now;
    
    // Đọc khối lượng còn trong tô từ LoadCell
    float currentWeight = LoadCell_getWeight();
    
    // Tính lượng cần nhả = target - còn trong tô
    int gramsToFeed = autoFeedGrams - (int)currentWeight;
    
    Serial.println("[Motor] Auto feed triggered by interval");
    Serial.print("[Motor] Target: ");
    Serial.print(autoFeedGrams);
    Serial.print("g, Current in bowl: ");
    Serial.print(currentWeight);
    Serial.print("g, Need to dispense: ");
    Serial.print(gramsToFeed);
    Serial.println("g");
    
    // Chỉ cho ăn nếu cần thêm thức ăn
    if (gramsToFeed > 0) {
      motor_feedGrams(gramsToFeed);
    } else {
      Serial.println("[Motor] Bowl still has enough food, skipping feed");
    }
  }
}

/**
 * Loop chính của motor - gọi trong main loop
 */
void motor_loop() {
  // Xử lý cho ăn thủ công
  if (motorManualTrigger) {
    motorManualTrigger = false;
    motor_feedGrams(motorManualGrams);
  }
  
  // Kiểm tra và thực hiện cho ăn tự động
  motor_checkAutoFeed();
}

#endif