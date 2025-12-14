
#ifndef CONFIG_H
#define CONFIG_H

//DHT11
#define DHT_PIN  D7
#define DHT_TYPE DHT11
extern unsigned long dht_upload_time;

//Limit Switch
#define LS_PIN D3
extern unsigned long ls_cooldown;

//ToF
extern unsigned long tof_empty_storage;

#endif
