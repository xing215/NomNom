#ifndef MQTT_H
#define MQTT_H

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
const char * SSID = "Nomnom";
const char * PASSWORD = "nomnomnom";
const char * BROKER = "broker.hivemq.com";
const int PORT = 1883;
const String TOPIC_BASE = "/23CLC03/NomNom";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void mqtt_wifiConnect() {
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Connected!");
}
void mqtt_mqttConnect() {
  while(!mqttClient.connected()) {
    Serial.println("Attemping MQTT connection...");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if(mqttClient.connect(clientId.c_str())) {
      Serial.println("connected");

      // mqttClient.subscribe("topic"));
     
    }
    else {
      Serial.print(mqttClient.state());
      Serial.println("try again in 5 seconds");
      delay(5000);
    }
  }
}

// PUBLISH FUNCTIONS
void mqtt_publish(String subtopic, String data, bool retain = true)
{
  mqttClient.publish(
    (TOPIC_BASE + subtopic).c_str(),
    data.c_str(),
    retain
  );
}

void mqtt_callback(char* topic, byte* message, unsigned int length) {
  Serial.println(topic);
  String msg;
  for(int i=0; i<length; i++) {
    msg += (char)message[i];
  }
  Serial.println(msg);

  //***Code here to process the received package***

}

void mqtt_setup() {
  Serial.print("Connecting to WiFi");

  mqtt_wifiConnect();
  mqttClient.setServer(BROKER, PORT);
  mqttClient.setCallback(mqtt_callback);
  mqttClient.setKeepAlive(90);
}

void mqtt_loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Reconnecting to WiFi");
    mqtt_wifiConnect();
  }

  if(!mqttClient.connected()) {
    mqtt_mqttConnect();
  }

  mqttClient.loop();

  //***Publish data to MQTT Server***
  mqtt_publish("/temperature", "helo");
  

  delay(5000);
}

#endif