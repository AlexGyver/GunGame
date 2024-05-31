#ifndef _USER_EEPROMHandler_H_
#define _USER_EEPROMHandler_H_

#include <EEPROM.h>
#include <arduino.h>

struct SonofPowCofig {
   uint8_t ecsrc;
   uint8_t wifiApIp[4]; //TODO
   uint8_t wifiApGateway[4]; //TODO
   uint8_t wifiApSubnet[4]; //TODO
   uint8_t wifiApSsid[20];
   uint8_t wifiApPass[60];
   uint8_t wifiStSsid[20];
   uint8_t wifiStPass[60];
   uint8_t httpClientUser[20];
   uint8_t httpClientPass[60];
   uint8_t httpServerUser[20];
   uint8_t httpServerPass[60];
};


class EEPROMHandler {
public:
	EEPROMHandler(void);
	~EEPROMHandler(void);

	void save(void);
	uint8_t  isLoaded(void);
	//# wifi handler
	uint8_t* getWifiAPSsid(void);
	uint8_t* getWifiAPPass(void);
	//
	EEPROMHandler* setWifiApSsid(char* ssid, uint8_t length);
	EEPROMHandler* setWifiApPass(char* pass, uint8_t length);
	//
	uint8_t  isWifiStValid(void);
	//
	uint8_t* getWifiStSsid(void);
	uint8_t* getWifiStPass(void);
	//
	EEPROMHandler* setWifiStSsid(char* ssid, uint8_t length);
	EEPROMHandler* setWifiStPass(char* pass, uint8_t length);
	//# http server
	uint8_t* getServerUser(void);
	uint8_t* getServerPass(void);
	//
	EEPROMHandler* setServerUser(char* user, uint8_t length);
	EEPROMHandler* setServerPass(char* pass, uint8_t length);
	//# http client
	uint8_t  isClientValid(void);
	//
	uint8_t* getClientUser(void);
	uint8_t* getClientPass(void);
	//
	EEPROMHandler* setClientUser(char* user, uint8_t length);
	EEPROMHandler* setClientPass(char* pass, uint8_t length);
 void byDefault();
private:
	SonofPowCofig* config;
	bool loaded;
	uint16_t ecsrc();
	void load();
};

#endif
