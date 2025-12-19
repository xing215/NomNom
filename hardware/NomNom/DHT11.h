#ifndef DHT11_H
#define DHT11_H

#include "libs.h"
#include "config.h"

DHT dht(DHT_PIN, DHT_TYPE);

void DHT11_setup() {
  dht.begin();
}

void DHT11_loop() {
  static unsigned long dht_time = 0;
  unsigned long now = millis();

  // run every assigned time, check in NomNom.ino
  if (now - dht_time >= dht_upload_time) {
    dht_time = now;    // update timer

    float h = dht.readHumidity();
    float t = dht.readTemperature(); // °C

    if (isnan(h) || isnan(t)) {
      Serial.println("[DHT11]\t\tFailed to read from DHT sensor!");
      return;
    }

    //JSON building
    String json = "{";
    json += "\"humidity\": ";
    json += h;
    json += ", \"temperature\": ";
    json += t;
    json += "}";

    //Publish
    mqtt_publish("/humid", json);

    Serial.print("[DHT11]\t\tHumidity: ");
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperature: ");
    Serial.print(t);
    Serial.println(" *C");
  }
}

#endif
