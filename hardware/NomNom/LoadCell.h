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

// Global HX711 object (Adafruit lib)
Adafruit_HX711 hx711(LOADCELL_DATA_PIN, LOADCELL_SCK_PIN);

void LoadCell_setup() {
  Serial.println("HX711 (Adafruit_HX711) loadcell init");

  // Initialize HX711
  hx711.begin();

  // Tare channel A (set current reading as zero)
  Serial.println("Tareing loadcell...");
  
  for (uint8_t t = 0; t < 3; t++) {
    int32_t rawA = hx711.readChannelRaw(CHAN_A_GAIN_128);
    hx711.tareA(rawA);   // store baseline for channel A
  }

  Serial.println("HX711 ready.");
}

void LoadCell_loop() {
  static unsigned long lc_time = 0;
  unsigned long now = millis();

  // Read every 500 ms
  if (now - lc_time >= 500UL) {
    lc_time = now;

    // Blocking read on channel A, gain 128
    int32_t rawA = hx711.readChannelBlocking(CHAN_A_GAIN_128);

    // Convert raw reading to grams (you will adjust LOADCELL_CAL_FACTOR)
    float weight_g = (float)rawA / LOADCELL_CAL_FACTOR;

    // Clean tiny negatives
    if (weight_g < 0) weight_g = 0;

    bool overload = (weight_g > LOADCELL_MAX_WEIGHT_G * 1.05f);

    // ---- Build JSON payload ----
    String json_loadcell = "{";
    json_loadcell += "\"weight_g\": ";
    json_loadcell += weight_g;          // ex: 253.42
    json_loadcell += ", \"raw\": ";
    json_loadcell += rawA;              // raw ADC value (after tare)
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
