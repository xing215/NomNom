#include "libs.h"

#include "Motor.h"
#include "LimitSwitch.h"
#include "DHT11.h"
#include "ToF.h"
#include "LoadCell.h"

unsigned long dht_upload_time = 5000;
unsigned long ls_cooldown = 5000;
unsigned long tof_empty_storage = 5000;
unsigned long tof_upload_time = 5000;
int motor_speed = 1023;
unsigned long motor_timeout = 10000;
float current_weight_g = 0.0;
float max_weight = 1000.0;
unsigned long loadcell_upload_time = 5000;

void setup() {
  Serial.begin(9600);
  while (!Serial)
    delay(1);
  mqtt_setup();
  LimitSwitch_setup();
  ToF_setup();
  DHT11_setup();
  LoadCell_setup();
  Motor_setup();
}

void loop() {
  mqtt_loop();
  LimitSwitch_loop();
  ToF_loop();
  DHT11_loop();
  LoadCell_loop();
  Motor_loop();
}
