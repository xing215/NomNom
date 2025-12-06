#include "libs.h"
#include "mqtt.h"

#include "LimitSwitch.h"
#include "DHT11.h"
#include "tof.h"

void setup() {
  Serial.begin(9600);
  mqtt_setup();
  LimitSwitch_setup();
  tof_setup();
  DHT11_setup();
}

void loop() {
  mqtt_loop();
  LimitSwitch_loop();
  tof_loop();
  DHT11_loop();
}
