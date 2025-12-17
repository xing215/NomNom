#ifndef LOADCELL_H
#define LOADCELL_H

#include "libs.h"
#include "config.h"

// ---- Calibration factor ----
// You MUST tune this so that weight_g comes out in grams.
// Start with something like 100000.0f and adjust after testing.
#define LOADCELL_CAL_FACTOR     100000.0f   // TODO: change after calibration

Adafruit_HX711 hx711(LOADCELL_DATA_PIN, LOADCELL_SCK_PIN);

void LoadCell_setup() {
  hx711.begin();
  
  for (uint8_t t = 0; t < 3; t++) {
    int32_t rawA = hx711.readChannelRaw(CHAN_A_GAIN_128);
    hx711.tareA(rawA);   // store baseline for channel A
  }
}

void LoadCell_loop() {
  static unsigned long lc_time = 0;
  unsigned long now = millis();

  if (now - lc_time >= loadcell_upload_time) {
    lc_time = now;

    // Blocking read on channel A, gain 128
    int32_t rawA = hx711.readChannelBlocking(CHAN_A_GAIN_128);

    // Convert raw reading to grams (you will adjust LOADCELL_CAL_FACTOR)
    float weight_g = (float)rawA / LOADCELL_CAL_FACTOR;

    // Clean tiny negatives
    if (weight_g < 0) weight_g = 0;
    
    // Cập nhật biến global để các module khác đọc được
    current_weight_g = weight_g;

    bool overload = (weight_g > max_weight * 1.05f);

    //JSON building
    String json_loadcell = "{";
    json_loadcell += "\"weight_g\": ";
    json_loadcell += weight_g;          // ex: 253.42
    json_loadcell += ", \"raw\": ";
    json_loadcell += rawA;              // raw ADC value (after tare)
    json_loadcell += ", \"overload\": ";
    json_loadcell += overload ? "true" : "false";
    json_loadcell += "}";

    //Publish
    mqtt_publish("/loadcell", json_loadcell);

    Serial.print("[LoadCell]\tweight = ");
    Serial.print(weight_g);
    Serial.print(" g, raw = ");
    Serial.print(rawA);
    if (overload) Serial.print("  OVERLOAD!");
    Serial.println();
  }
}

#endif
