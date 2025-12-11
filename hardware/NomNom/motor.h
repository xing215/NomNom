#ifndef MOTOR_H
#define MOTOR_H

#include "libs.h"
#include <ArduinoJson.h>

#define MOTOR_PIN D7
#define MOTOR_SPEED 1023  // PWM speed (0-1023 cho ESP8266)

// ============== BIẾN TOÀN CỤC CHO MOTOR ==============
// Trạng thái motor
bool motorRunning = false;              // Motor đang chạy?
float motorTargetGrams = 0;             // Số gram mục tiêu cần đạt trong tô

// Cho ăn thủ công
bool motorManualTrigger = false;        // Flag cho ăn thủ công
float motorManualGrams = 10;            // Số gram khi cho ăn thủ công

// Cho ăn tự động theo interval
bool autoFeedEnabled = false;           // Bật/tắt chế độ tự động
unsigned long autoFeedIntervalMs = 0;   // Interval giữa các lần cho ăn (ms)
float autoFeedGrams = 10;               // Số gram mục tiêu mỗi lần cho ăn tự động
unsigned long lastAutoFeedTime = 0;     // Thời điểm cho ăn tự động lần cuối

// Timeout để tránh motor chạy mãi
unsigned long motorStartTime = 0;
#define MOTOR_TIMEOUT_MS 30000  // Tối đa 30 giây

/**
 * Khởi tạo motor
 */
void motor_setup() {
  pinMode(MOTOR_PIN, OUTPUT);
  analogWrite(MOTOR_PIN, 0);
  
  Serial.println("[Motor] Initialized");
}

/**
 * Bắt đầu chạy motor để đạt target gram trong tô
 * Motor sẽ chạy cho đến khi loadcell đọc được >= targetGrams
 * @param targetGrams Số gram mục tiêu cần có trong tô
 */
void motor_startFeeding(float targetGrams) {
  motorTargetGrams = targetGrams;
  motorRunning = true;
  motorStartTime = millis();
  
  analogWrite(MOTOR_PIN, MOTOR_SPEED);
  
  Serial.print("[Motor] Started feeding, target: ");
  Serial.print(targetGrams);
  Serial.println("g in bowl");
}

/**
 * Dừng motor
 */
void motor_stopFeeding() {
  motorRunning = false;
  motorTargetGrams = 0;
  
  analogWrite(MOTOR_PIN, 0);
  
  Serial.println("[Motor] Stopped");
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
 *   "grams": 15              // Đảm bảo có 15 gram trong tô
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
  Serial.print("  - Target grams in bowl: ");
  Serial.println(autoFeedGrams);
}

/**
 * Kiểm tra motor đang chạy và dừng khi đạt target
 * Sử dụng biến global currentWeight_g từ LoadCell.h
 */
void motor_checkFeedingProgress() {
  if (!motorRunning) {
    return;
  }
  
  unsigned long now = millis();
  
  // Kiểm tra timeout để tránh motor chạy mãi
  if (now - motorStartTime >= MOTOR_TIMEOUT_MS) {
    Serial.println("[Motor] TIMEOUT! Force stop");
    motor_stopFeeding();
    return;
  }
  
  // Đọc cân nặng hiện tại từ biến global của LoadCell.h
  // currentWeight_g được khai báo trong LoadCell.h
  if (currentWeight_g >= motorTargetGrams) {
    Serial.print("[Motor] Target reached! Current: ");
    Serial.print(currentWeight_g);
    Serial.print("g >= Target: ");
    Serial.print(motorTargetGrams);
    Serial.println("g");
    motor_stopFeeding();
  }
}

/**
 * Kiểm tra và thực hiện cho ăn tự động theo interval
 */
void motor_checkAutoFeed() {
  // Không trigger nếu motor đang chạy
  if (!autoFeedEnabled || autoFeedIntervalMs == 0 || motorRunning) {
    return;
  }
  
  unsigned long now = millis();
  
  // Kiểm tra đã đến lúc cho ăn chưa
  if (now - lastAutoFeedTime >= autoFeedIntervalMs) {
    lastAutoFeedTime = now;
    
    Serial.println("[Motor] Auto feed triggered by interval");
    Serial.print("[Motor] Current in bowl: ");
    Serial.print(currentWeight_g);
    Serial.print("g, Target: ");
    Serial.print(autoFeedGrams);
    Serial.println("g");
    
    // Chỉ cho ăn nếu chưa đủ thức ăn trong tô
    if (currentWeight_g < autoFeedGrams) {
      motor_startFeeding(autoFeedGrams);
    } else {
      Serial.println("[Motor] Bowl already has enough food, skipping");
    }
  }
}

/**
 * Loop chính của motor - gọi trong main loop
 * Non-blocking, không dùng delay()
 */
void motor_loop() {
  // Xử lý cho ăn thủ công
  if (motorManualTrigger && !motorRunning) {
    motorManualTrigger = false;
    
    // Tính target = hiện tại + thêm vào
    float target = currentWeight_g + motorManualGrams;
    
    Serial.print("[Motor] Manual feed: adding ");
    Serial.print(motorManualGrams);
    Serial.print("g to current ");
    Serial.print(currentWeight_g);
    Serial.print("g = target ");
    Serial.print(target);
    Serial.println("g");
    
    motor_startFeeding(target);
  }
  
  // Kiểm tra tiến trình feeding (đã đạt target chưa?)
  motor_checkFeedingProgress();
  
  // Kiểm tra và thực hiện cho ăn tự động
  motor_checkAutoFeed();
}

#endif