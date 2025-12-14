#include "libs.h"

#include "Motor.h"
#include "LimitSwitch.h"
#include "DHT11.h"
#include "ToF.h"
#include "LoadCell.h"

unsigned long dht_upload_time = 3600000;
unsigned long ls_cooldown = 300000;
unsigned long tof_empty_storage = 5000;

void setup() {
  Serial.begin(9600);
  mqtt_setup();
  LimitSwitch_setup();
  ToF_setup();
  DHT11_setup();
  LoadCell_setup();
  motor_setup();
}

void loop() {
  mqtt_loop();
  LimitSwitch_loop();
  ToF_loop();
  DHT11_loop();
  LoadCell_loop();
  motor_loop();
}
