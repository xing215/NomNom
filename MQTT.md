# MQTT in NomNom Project

## Overview

MQTT (Message Queuing Telemetry Transport) is a lightweight messaging protocol used in the NomNom project for real-time communication between the web application server and the hardware device (ESP8266-based pet feeder). It enables the system to send commands to the device and receive telemetry data from sensors.

## Architecture

The NomNom system consists of two main components communicating via MQTT:

1. **Hardware Device** (ESP8266): Publishes sensor data and subscribes to control commands
2. **Web Server** (Next.js): Subscribes to sensor data and publishes control commands

## MQTT Broker

- **Broker**: HiveMQ public broker (`broker.hivemq.com`)
- **Port**: 1883 (MQTT)
- **Protocol**: MQTT over TCP
- **QoS**: 0 for subscriptions, 1 for publications
- **Keep Alive**: 90 seconds

## Topic Structure

All topics are prefixed with `/NomNom/{device_id}/` where `device_id` defaults to `device_001`.

### Telemetry Topics (Hardware → Web Server)

The hardware publishes sensor readings and status information:

- `{base}/loadcell`: Bowl weight in grams
  ```json
  {"weight_g": 150.5}
  ```

- `{base}/humid`: Temperature and humidity
  ```json
  {"temperature": 22.5, "humidity": 45.2}
  ```

- `{base}/tof`: Distance measurement (Time of Flight sensor)
  ```json
  {"distance": 120}
  ```

- `{base}/ls`: Limit switch status
  ```json
  {"pressed": true}
  ```

- `{base}/motor/status`: Motor running status
  ```json
  {"running": false}
  ```

- `{base}/status`: Device heartbeat/online status
  ```
  "online"
  ```

### Command Topics (Web Server → Hardware)

The web server publishes commands to control the feeder:

- `{base}/motor/manual_feed`: Manual feeding command
  ```json
  {
    "action": "feed",
    "grams": 50,
    "note": "User requested feeding",
    "source": "web",
    "requested_at": "2025-12-19T10:30:00.000Z"
  }
  ```

- `{base}/motor/auto_feed_config`: Auto-feeding configuration (retained)
  ```json
  {
    "enabled": true,
    "grams": 30,
    "interval_minutes": 480,
    "first_feed_at": "2025-12-19T08:00:00.000Z",
    "requested_at": "2025-12-19T10:30:00.000Z"
  }
  ```

## Message Flow

### Normal Operation

1. **Device Startup**: Hardware connects to WiFi and MQTT broker, subscribes to command topics, publishes "online" status
2. **Telemetry Publishing**: Hardware periodically publishes sensor data (weight, temperature, humidity, distance, limit switch status)
3. **Command Reception**: Hardware listens for manual feed and auto-feed config commands
4. **Web Server**: Subscribes to all telemetry topics, processes incoming data, updates UI and database
5. **User Interaction**: Web app sends commands via API endpoints, which publish to MQTT topics

### Auto-Feeding

- Auto-feeding configuration is retained on the MQTT broker
- Hardware maintains its own timer and feeding schedule based on the received config
- Configuration persists across device restarts

### Manual Feeding

- Immediate feeding triggered by user via web interface
- Command sent with specific gram amount and optional note
- Hardware processes command and activates motor accordingly

## Implementation Details

### Hardware (Arduino/ESP8266)

- Uses `PubSubClient` library for MQTT communication
- Connects to WiFi network "Nomnom" with password "nomnomnom"
- Publishes telemetry data every 5 seconds for most sensors
- Subscribes to motor control topics
- Handles JSON parsing for incoming commands

### Web Server (Next.js)

- Uses `mqtt` npm package for MQTT client
- Maintains persistent connection to broker
- Processes incoming telemetry messages and updates in-memory state
- Provides API endpoints for sending commands
- Stores feeding logs and telemetry data in MongoDB

## Error Handling

- Automatic reconnection on connection loss
- JSON parsing with error handling
- Graceful degradation when MQTT is unavailable
- Logging of connection status and message processing

## Security Considerations

- Currently uses public MQTT broker (HiveMQ)
- No authentication/authorization implemented
- Topics are not encrypted
- Suitable for development/demo purposes

## Future Improvements

- Implement authentication with MQTT broker
- Use secure MQTT (MQTTS) with TLS
- Add device-specific authentication tokens
- Implement topic-based access control</content>
<parameter name="filePath">d:\projects\nomnom\MQTT.md