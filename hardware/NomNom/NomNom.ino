#include "libs.h"
#include "mqtt.h"
#include "motor.h"

#include "LimitSwitch.h"
#include "DHT11.h"
#include "tof.h"
#include "LoadCell.h"
#include "motor.h"

void setup() {
  Serial.begin(9600);
  mqtt_setup();
  motor_setup();
  LimitSwitch_setup();
  tof_setup();
  DHT11_setup();
  LoadCell_setup();
  motor_setup();
}

void loop() {
  mqtt_loop();
  motor_loop();
  LimitSwitch_loop();
  tof_loop();
  DHT11_loop();
  LoadCell_loop();  // Đọc loadcell trước
  motor_loop();     // Motor kiểm tra loadcell sau
}
