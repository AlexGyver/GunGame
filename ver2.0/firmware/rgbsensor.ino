#include <arduino.h>
#include <ESP8266WebServer.h>
#include "WiFi_handler.h"
#include "Led.h"
#include "Button.h"
#include "EEPROMHandler.h"
#include "UARTHandler.h"
#include "WiFi_handler.h"
#include "jsmn.h"
#include "TCS3200.h"
#include <WebSocketsServer.h>

#define MAXNUMBER_OF_TOKENS 8
#define MAX_TOKEN_LENGTH 64

ESP8266WebServer server(80);
WebSocketsServer ws = WebSocketsServer(81);


bool isDebug = true;

TCS3200 rgb;
Led* led;
Button *button;
EEPROMHandler *eeprom;
UARTHandler* uart;
WiFiHandler* wifiHandler;

jsmn_parser parser;
jsmntok_t tokens[MAXNUMBER_OF_TOKENS];
char keyString[MAX_TOKEN_LENGTH];
char Prev_keyString[MAX_TOKEN_LENGTH];

bool parseAndSetConfig(const char* message, uint8_t type) {  
  jsmn_init(&parser);  
  int resultCode = jsmn_parse(&parser, message, strlen(message), tokens, sizeof(tokens) / sizeof(tokens[0]));
  if(resultCode <=0 ) {
    return false;
  }
  uint16_t length = 0;    
  for (int i = 1; i < resultCode; i++) {    
    jsmntok_t key = tokens[i];
    length = key.end - key.start;
    length = (length<MAX_TOKEN_LENGTH-1) ? length :(MAX_TOKEN_LENGTH-1);
    memcpy(keyString, (char*)(message+key.start), length);
    keyString[length] = '\0';        
    if(strcmp(Prev_keyString, "ssid") == 0) {
      Serial.println(keyString);
      if(type==0) {
        eeprom->setWifiStSsid(keyString, length);
      } else {
        eeprom->setWifiApSsid(keyString, length);
      }
    } else if(strcmp(Prev_keyString, "password") == 0) {
      Serial.println(keyString);
      if(type==0) {
        eeprom->setWifiStPass(keyString, length); 
      } else {
        eeprom->setWifiApPass(keyString, length); 
      }
    }
    strcpy(Prev_keyString, keyString);        
  }
  eeprom->save();
  return true;
}

void httpHandleWiFiConfig(void) {
  if (server.hasArg("plain")== false) {
    server.send(400, "text/plain", "Support only POST request");
  } else {
    const char* message = server.arg("plain").c_str();    
    if(parseAndSetConfig(message, 0)) {
      server.send(200, "text/plain", "SSID and password for WIFI connection was setted");
    } else {
      server.send(400, "text/plain", "Can't parse request body");
    }
  }
}

void httpHandleAPConfig(void) {
  if (server.hasArg("plain")== false) {
    server.send(400, "text/plain", "Support only POST request");
  } else {
    const char* message = server.arg("plain").c_str();    
    if(parseAndSetConfig(message, 1)) {
      server.send(200, "text/plain", "SSID and password for WIFI access point was setted");
    } else {
      server.send(400, "text/plain", "Can't parse request body");
    }
  }
}

void httpHandleRestart(void) {
    server.send(200, "text/plain", "Restarting....");
    ESP.restart();  
}

void httpHandleRoot(void) {
  led->blinkOnce(0B10101010);
  server.send(200, "application/json", "{\"status\": \"OK\"}");
}

void httpNotFound(void) {
  server.send(404, "text/plain", "Not found");
}

void dataReceive(char code, char* data) {
  led->blinkOnce(0B00000001);
  switch(code) {
    case 'w': wifiHandler->WiFiSwitchMode(); break;
    case 'p': 
       if(parseAndSetConfig(data, 1)){
          Serial.print("Access point configured");
       } else {
          Serial.print("Access point not configured");
       }
       break;
    case 's':  
       if(parseAndSetConfig(data, 0)){
          Serial.print("WiFi configured");
       } else {
          Serial.print("WiFi not configured");
       }
       break;
    case 'k': 
       Serial.print("restart");
       ESP.restart();
       break;
    default: 
      Serial.print(code);
      Serial.println(data);
      break;
  }
}

void buttonClick(BUTTON_CLICK_EVENT event) {
  led->blinkOnce(0B11111111);
  switch(event) {
    case SB_CLICK:
      Serial.print("SB_CLICK\n");
      sendColor(true);
      break;
    case SB_LONG_CLICK:
      Serial.print("SB_LONG_CLICK\n");
      sendColor(false);
      break;
    default: 
      led->blink(0B11111111); 
      break;
  }
}

void sendColor(bool shot) {
  tcs_color_t color = rgb.getRaw();
  String s;
  s += color.r;
  s += ',';
  s += color.g;
  s += ',';
  s += color.b;
  s += ',';
  s += shot;
  ws.broadcastTXT((uint8_t*)s.c_str(), s.length());
}

void setup() {
   uart = new UARTHandler();
   led = new Led();
   button = new Button();   
   eeprom = new EEPROMHandler();   
   wifiHandler = new WiFiHandler(eeprom);
   rgb.begin();
   // WS
   ws.begin();
   ws.onEvent([](uint8_t num, WStype_t type, uint8_t* data, size_t len) {
      switch (type) {
        case WStype_CONNECTED:
          led->blink(0B11111111);
          break;
        default:
          break;
      }
   });
   // Поднимаем WEB-сервер  
   server.on ( "/", httpHandleRoot );
   server.on ( "/restart", httpHandleRestart);
   
   server.on ( "/config/wifi", httpHandleWiFiConfig);
   server.on ( "/config/ap", httpHandleAPConfig);
   
   server.onNotFound ( httpNotFound );
    
   button->addListener(buttonClick);
   uart->addDefaultListener(dataReceive);
   
   server.begin();
   Serial.println("HTTP server started on http://192.168.4.1:80");
}

void loop() {
  ws.loop();
  server.handleClient();
  button->loop();
  uart->loop();
  led->loop();
}
