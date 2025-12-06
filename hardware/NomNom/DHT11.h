#ifndef DHT11_H
#define DHT11_H

#include "libs.h"
#include "mqtt.h"

#define DHTPIN  D3 
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void LimitSwitch_setup() {
  Serial.println("DHT11 test on ESP8266");
  dht.begin();
}

void LimitSwitch_loop() {
  // static = keeps value between calls to LimitSwitch_loop()
  static unsigned long dht_time = 0;
  unsigned long now = millis();

  // run every 10 seconds
  if (now - dht_time >= 10000UL) {
    dht_time = now;    // update timer

    float h = dht.readHumidity();
    float t = dht.readTemperature(); // °C

    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // --- JSON building (using String) ---
    String json_humid_temp = "{";
    json += "\"humidity\": ";
    json += h;                 // e.g. 55.3
    json += ", \"temperature\": ";
    json += t;                 // e.g. 28.7
    json += "}";

    mqtt_publish("/humid", json_humid_temp);

    Serial.print("Humidity: ");
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperature: ");
    Serial.print(t);
    Serial.println(" *C");
  }
}

#endif
