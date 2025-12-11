## NomNom Web

NomNom is a Next.js dashboard that lets you monitor sensors on the IoT feeder and push feeding commands through MQTT. This document focuses on the web workspace under `web/`.

## Requirements

- Node.js 20+
- npm 10+
- Access to the same MQTT broker as the ESP8266 firmware

## Environment variables

Create a `.env.local` file in `web/` and set the broker coordinates. All values have sensible defaults matching the firmware, so you only need to override what differs in your setup.

```
MQTT_HOST=broker.hivemq.com
MQTT_PORT=1883
MQTT_PROTOCOL=mqtt
MQTT_TOPIC_BASE=/23CLC03/NomNom
# Optional auth
# MQTT_USERNAME=...
# MQTT_PASSWORD=...

# You can also provide MQTT_URL=mqtt://host:port to override host/protocol/port at once

# Optional database logging
# DATABASE_URL=postgres://user:password@host:5432/nomnom
# DATABASE_SSL=true
```

## Install & run

```bash
cd web
npm install
npm run dev
```

Visit http://localhost:3000 to open the app. The main page now polls telemetry via `/api/mqtt/telemetry` every 5 seconds and wires the "FEED" button to the manual MQTT publisher.

## Serverless API surface

| Route | Method | Description |
| --- | --- | --- |
| `/api/mqtt/manual-feed` | `POST` | Publishes `{ action: "feed", grams }` to `/motor/manual_feed`. Body shape: `{ "grams": number, "note"?: string }`. |
| `/api/mqtt/auto-feed` | `POST` | Updates the auto-feed config topic. Body shape: `{ "grams": number, "intervalMinutes": number, "enabled": boolean, "firstFeedAt"?: string }`. |
| `/api/mqtt/telemetry` | `GET` | Returns cached readings from load cell, DHT11, limit switch, TOF, and device heartbeat. |

### Example: trigger a 25g treat

```bash
curl -X POST http://localhost:3000/api/mqtt/manual-feed \
	-H "Content-Type: application/json" \
	-d '{"grams":25,"note":"treat"}'
```

### Example response from `/api/mqtt/telemetry`

```json
{
	"connection": {
		"connected": true,
		"lastConnectedAt": "2025-12-11T12:34:56.789Z",
		"lastMessageAt": "2025-12-11T12:35:02.123Z"
	},
	"summary": {
		"weightGrams": 210.4,
		"humidity": 55.2,
		"temperature": 22.1,
		"distanceMm": 4800,
		"limitSwitchPressed": false,
		"bowlLikelyEmpty": false,
		"updatedAt": "2025-12-11T12:35:02.123Z"
	}
}
```

The raw payloads for each topic are also included under `topics` in the same response when low-level debugging is needed.

## Telemetry persistence

Every MQTT message arriving on the firmware topics is also forwarded to the server-side persistence layer. If `DATABASE_URL` is defined, the app attempts to insert rows into a `telemetry_events` table with the following shape:

```sql
CREATE TABLE IF NOT EXISTS telemetry_events (
	id BIGSERIAL PRIMARY KEY,
	topic TEXT NOT NULL,
	payload_raw TEXT NOT NULL,
	payload_json JSONB,
	received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

When no database connection is configured, the payloads are simply `console.log`'d so you can verify the ingestion flow without hosting Postgres yet. The persistence hook is initialized whenever the `/api/mqtt/telemetry` route runs (and any other server module can call `ensureTelemetryPersistence()` to opt in).

## Notes

- The MQTT client runs only on the server (Node runtime). Avoid importing `lib/server/mqttClient` inside client components.
- Publish operations use QoS 1 for reliability but do not retain manual feed commands to prevent repeated meals when a device reconnects.
- Telemetry subscriptions rely on retained topics from the firmware. Ensure the firmware continues publishing with retain enabled (default in `mqtt_publish`).
