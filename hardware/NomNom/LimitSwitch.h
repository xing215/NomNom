#ifndef LIMITSWITCH_H
#define LIMITSWITCH_H

#include "libs.h"
#include "config.h"

bool LimitSwitch_isPressed() {
  return !digitalRead(LS_PIN);
}

void LimitSwitch_setup() {
  pinMode(LS_PIN, INPUT_PULLUP);
}

void LimitSwitch_loop() {
  static unsigned long button_last_pressed = 0;
  if (LimitSwitch_isPressed())
  {
    Serial.print("Button pressed!");

    //Send signal if button is pressed, with cooldown (rebounced time)
    if (millis() - button_last_pressed >= ls_cooldown) {
      Serial.println("Sending data...");
      //JSON building and publish
      mqtt_publish("/ls", "{\"pressed\": 1}", false);
      buttonLastPressed = millis();
    } else {
      Serial.println("");
    }
  }
}

#endif
