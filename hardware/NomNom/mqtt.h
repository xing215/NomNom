#ifndef MQTT_H
#define MQTT_H

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// WiFi & MQTT Configuration
const char * SSID = "Nomnom";
const char * PASSWORD = "nomnomnom";
const char * BROKER = "broker.hivemq.com";
const int PORT = 1883;

// Device Configuration - Change this for each device
const String DEVICE_ID = "device_001";  // Unique identifier for this device
const String TOPIC_BASE = "/NomNom/" + DEVICE_ID;

// MQTT Topics cho Motor Control
const String TOPIC_MANUAL_FEED = TOPIC_BASE + "/motor/manual_feed";      // Topic nhận lệnh cho ăn thủ công
const String TOPIC_AUTO_FEED_CONFIG = TOPIC_BASE + "/motor/auto_feed_config";  // Topic nhận config cho ăn tự động
const String TOPIC_MOTOR_STATUS = TOPIC_BASE + "/motor/status";          // Topic publish trạng thái motor

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// Forward declarations cho motor functions
extern void motor_processManualFeed(String payload);
extern void motor_processAutoFeedConfig(String payload);

void mqtt_wifiConnect() {
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("[WiFi] Connected!");
  Serial.print("[WiFi] IP Address: ");
  Serial.println(WiFi.localIP());
}

void mqtt_subscribeTopics() {
  // Subscribe các topic cho motor control
  mqttClient.subscribe(TOPIC_MANUAL_FEED.c_str());
  Serial.print("[MQTT] Subscribed to: ");
  Serial.println(TOPIC_MANUAL_FEED);
  
  mqttClient.subscribe(TOPIC_AUTO_FEED_CONFIG.c_str());
  Serial.print("[MQTT] Subscribed to: ");
  Serial.println(TOPIC_AUTO_FEED_CONFIG);
}

void mqtt_mqttConnect() {
  while(!mqttClient.connected()) {
    Serial.println("[MQTT] Attempting connection...");
    String clientId = "NomNom-" + String(random(0xffff), HEX);
    if(mqttClient.connect(clientId.c_str())) {
      Serial.println("[MQTT] Connected!");
      
      // Subscribe các topic cần thiết
      mqtt_subscribeTopics();
      
      // Publish thông báo đã online
      mqttClient.publish((TOPIC_BASE + "/status").c_str(), "online", true);
    }
    else {
      Serial.print("[MQTT] Connection failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" - Retrying in 5 seconds...");
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
  String topicStr = String(topic);
  String msg;
  for(int i = 0; i < length; i++) {
    msg += (char)message[i];
  }
  
  Serial.print("[MQTT] Received on topic: ");
  Serial.println(topicStr);
  Serial.print("[MQTT] Payload: ");
  Serial.println(msg);

  // Xử lý message theo topic
  if (topicStr == TOPIC_MANUAL_FEED) {
    // Lệnh cho ăn thủ công từ backend
    motor_processManualFeed(msg);
  }
  else if (topicStr == TOPIC_AUTO_FEED_CONFIG) {
    // Cấu hình cho ăn tự động từ backend
    motor_processAutoFeedConfig(msg);
  }
}

void mqtt_setup() {
  Serial.print("[WiFi] Connecting");

  mqtt_wifiConnect();
  
  mqttClient.setServer(BROKER, PORT);
  mqttClient.setCallback(mqtt_callback);
  mqttClient.setKeepAlive(90);
  mqttClient.setBufferSize(1024);  // Tăng buffer size cho JSON messages
  
  Serial.println("[MQTT] Setup completed");
}

void mqtt_loop() {
  static unsigned long lastPublish = 0;
  unsigned long now = millis();
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("[WiFi] Reconnecting");
    mqtt_wifiConnect();
  }

  if(!mqttClient.connected()) {
    mqtt_mqttConnect();
  }

  mqttClient.loop();
}

#endif