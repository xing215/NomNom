#include "libs.h"
#include "LimitSwitch.h"
#include "mqtt.h"

void setup() {
  Serial.begin(9600);
  mqtt_setup();
  LimitSwitch_setup();
}

void loop() {
  mqtt_loop();
  LimitSwitch_loop();
}
