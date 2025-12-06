#include "libs.h"
#include "LimitSwitch.h"
#include "DHT11.h"
#include "mqtt.h"

void setup() {
  Serial.begin(9600);
  mqtt_setup();
  LimitSwitch_setup();
  DHT11_setup();
}

void loop() {
  mqtt_loop();
  LimitSwitch_loop();
  DHT11_loop();
}
