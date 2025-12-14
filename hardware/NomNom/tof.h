#ifndef TOF_H
#define TOF_H

#include "libs.h"
#include "config.h"

Adafruit_VL53L0X lox = Adafruit_VL53L0X();

static bool TOF_SUCCESS = false;

int _tof_getDistance() {
  VL53L0X_RangingMeasurementData_t measure;
  lox.rangingTest(&measure, false); // pass in 'true' to get debug data printout!
  if (measure.RangeStatus != 4) {  // phase failures have incorrect data
    return measure.RangeMilliMeter;
  } else {
    return -1;
  }
}

void ToF_setup() {
  if (!lox.begin()) {
    Serial.println("Failed to boot VL53L0X");
    TOF_SUCCESS = false;
  }
  else
    TOF_SUCCESS = true;
}

void ToF_loop() {
  int distance = _tof_getDistance();
  
  if (!TOF_SUCCESS) 
  Serial.println("Failed to boot VL53L0X");
  else if (distance == -1)
    Serial.println("Distance is too far");
  else if (distance >= tof_empty_storage) {
    Serial.print("Sending empty storage warning with distance = ");
    Serial.println(distance);
    String formatedData = "{\"distance\":";
    formatedData += distance;
    formatedData += "}";
    mqtt_publish("/tof", formatedData);
  } //Bổ sung hàm publish data phần trăm còn lại trong hộp
}

#endif
