#ifndef LIMITSWITCH_H
#define LIMITSWITCH_H
#include "libs.h"
#include "mqtt.h"

#define LS_PIN D3
#define COOLDOWN 3000 // 3 seconds

bool LimitSwitch_isPressed() {
  return !digitalRead(LS_PIN);
}

void LimitSwitch_setup() {
  pinMode(LS_PIN, INPUT_PULLUP);
}
void LimitSwitch_loop() {
  static unsigned long buttonLastPressed = 0;
  if (LimitSwitch_isPressed())
  {
    Serial.println("Button pressed!");
    if (millis() - buttonLastPressed >= 3000) {
      Serial.println("Button pressed! Sending data...");
      mqtt_publish("/ls", "{\"pressed\": 1}", false);
      buttonLastPressed = millis();
    }
  }
}

#endif
