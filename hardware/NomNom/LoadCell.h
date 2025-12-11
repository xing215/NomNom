#ifndef LOADCELL_H
#define LOADCELL_H

#include "libs.h"
#include "mqtt.h"

// ------------ Pins (change to match your wiring) ------------
#define LOADCELL_DATA_PIN  D5      // HX711 DATA
#define LOADCELL_SCK_PIN   D6      // HX711 SCK

// 1 kg loadcell (max ~1000 g)
#define LOADCELL_MAX_WEIGHT_G   1000.0f

// ---- Calibration factor ----
// You MUST tune this so that weight_g comes out in grams.
// Start with something like 100000.0f and adjust after testing.
#define LOADCELL_CAL_FACTOR     100000.0f   // TODO: change after calibration

// Timeout cho việc đọc loadcell (ms)
#define LOADCELL_READ_TIMEOUT   100

// Global HX711 object (Adafruit lib)
Adafruit_HX711 hx711(LOADCELL_DATA_PIN, LOADCELL_SCK_PIN);

// Lưu giá trị cân nặng hiện tại để các module khác đọc
float currentWeight_g = 0.0f;

/**
 * Lấy khối lượng thức ăn còn trong tô (gram)
 * @return Khối lượng tính bằng gram
 */
float LoadCell_getWeight() {
  return currentWeight_g;
}

void LoadCell_setup() {
  Serial.println("HX711 (Adafruit_HX711) loadcell init");

  // Initialize HX711
  hx711.begin();
  yield();

  // Kiểm tra xem loadcell có kết nối không
  // Thử đọc 1 lần với timeout
  unsigned long startTime = millis();
  bool gotReading = false;
  
  while (millis() - startTime < 500) {
    yield();
    if (hx711.readChannelRaw(CHAN_A_GAIN_128) != 0) {
      gotReading = true;
      break;
    }
  }
  
  if (!gotReading) {
    Serial.println("[LoadCell] WARNING: No loadcell detected, skipping...");
    loadcellReady = false;
    currentWeight_g = 0.0f;
    return;
  }
  
  // Tare channel A (set current reading as zero)
  Serial.println("Tareing loadcell...");
  
  for (uint8_t t = 0; t < 3; t++) {
    yield();
    int32_t rawA = hx711.readChannelRaw(CHAN_A_GAIN_128);
    hx711.tareA(rawA);
  }

  loadcellReady = true;
  Serial.println("HX711 ready.");
}

void LoadCell_loop() {
  static unsigned long lc_time = 0;
  unsigned long now = millis();

  // Read every 500 ms
  if (now - lc_time >= 500UL) {
    lc_time = now;

    // Nếu loadcell không sẵn sàng, giữ currentWeight_g = 0
    if (!loadcellReady) {
      currentWeight_g = 0.0f;
      return;
    }

    yield();
    
    // Non-blocking check: thử đọc với timeout
    unsigned long readStart = millis();
    int32_t rawA = 0;
    bool readSuccess = false;
    
    // Đọc với timeout
    while (millis() - readStart < LOADCELL_READ_TIMEOUT) {
      yield();
      rawA = hx711.readChannelRaw(CHAN_A_GAIN_128);
      if (rawA != 0) {
        readSuccess = true;
        break;
      }
    }
    
    // Nếu đọc thất bại, giữ currentWeight_g = 0
    if (!readSuccess) {
      currentWeight_g = 0.0f;
      Serial.println("[LoadCell] Read failed, weight = 0");
      return;
    }

    // Convert raw reading to grams
    float weight_g = (float)rawA / LOADCELL_CAL_FACTOR;

    // Clean tiny negatives
    if (weight_g < 0) weight_g = 0;
    
    // Cập nhật biến global để các module khác đọc được
    currentWeight_g = weight_g;

    bool overload = (weight_g > LOADCELL_MAX_WEIGHT_G * 1.05f);

    // ---- Build JSON payload ----
    String json_loadcell = "{";
    json_loadcell += "\"weight_g\": ";
    json_loadcell += weight_g;
    json_loadcell += ", \"raw\": ";
    json_loadcell += rawA;
    json_loadcell += ", \"overload\": ";
    json_loadcell += overload ? "true" : "false";
    json_loadcell += "}";

    // Publish via MQTT
    mqtt_publish("/loadcell", json_loadcell);

    // Debug to Serial
    Serial.print("Loadcell: ");
    Serial.print(weight_g);
    Serial.print(" g, raw = ");
    Serial.print(rawA);
    if (overload) Serial.print("  [OVERLOAD!]");
    Serial.println();
  }
}

#endif
