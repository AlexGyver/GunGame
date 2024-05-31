#ifndef WiFi_handler_h
#define WiFi_handler_h
#include <arduino.h>
#include <ESP8266WiFi.h>
#include "EEPROMHandler.h"

extern bool isDebug;

#define WIFI_CNT_TRY 15
#define WIFI_DELAY_TRY 1000

class WiFiHandler {
private:
  EEPROMHandler* eeprom;
public:
  WiFiHandler(EEPROMHandler* eeprom);
  ~WiFiHandler(void);
  bool WiFiSwitchMode(void);
  bool WiFiShutdown(void);
  bool WiFiCreateAP(void);
  bool WiFiConnectToAP(void);
};

#endif
