#ifndef TOF_H
#define TOF_H

#include "libs.h"
#include "mqtt.h"

Adafruit_VL53L0X lox = Adafruit_VL53L0X();

#define EMPTY_DISTANCE 5000 // 5000 mm = 5m

static bool TOF_SUCCESS = false;

int tof_getDistance() {
  VL53L0X_RangingMeasurementData_t measure;
    
  lox.rangingTest(&measure, false); // pass in 'true' to get debug data printout!

  if (measure.RangeStatus != 4) {  // phase failures have incorrect data
    return measure.RangeMilliMeter;
  } else {
    return -1;
  }
}

void tof_setup() {
  if (!lox.begin()) {
    Serial.println(F("Failed to boot VL53L0X"));
    TOF_SUCCESS = false;
  }
  else
    TOF_SUCCESS = true;
}

void tof_loop() {
  int distance = tof_getDistance();
  if (!TOF_SUCCESS || distance == -1)
    Serial.println(F("Failed to boot VL53L0X"));
  else if (distance >= EMPTY_DISTANCE) {
    Serial.print("Sending empty storage warning with distance = ");
    Serial.println(distance);
    String formatedData = "{\"distance\":";
    formatedData += distance;
    formatedData += "}";
    mqtt_publish("/tof", formatedData);
  }
}

#endif