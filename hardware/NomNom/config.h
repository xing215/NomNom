
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
extern unsigned long tof_upload_time;

//Motor
#define MOTOR_PIN D0
extern int motor_speed;
extern unsigned long motor_timeout;


//Loadcell
#define LOADCELL_DATA_PIN  D5
#define LOADCELL_SCK_PIN   D6
extern float current_weight_g;
extern float max_weight;
extern unsigned long loadcell_upload_time;


#endif
