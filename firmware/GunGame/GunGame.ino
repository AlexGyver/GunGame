#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <EncButton.h>
#include <WebSocketsServer.h>
#include <Wire.h>

#include "TCS3472.h"
#include "config.h"
#include "led.h"
#include "tmr.h"

WebSocketsServer ws(81, "", "Arduino");
TCS3472 rgb;
Button btn(TRIG_PIN);
Led led(LED_PIN);

void setup() {
  // WIFI
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(AP_SSID, AP_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    led.toggle();
    delay(600);
  }
  led.off();
  Serial.println();
  Serial.println(WiFi.localIP());

  // WS
  ws.begin();
  ws.onEvent([](uint8_t num, WStype_t type, uint8_t* data, size_t len) {
    switch (type) {
      case WStype_CONNECTED:
        led.on();
        break;

      default:
        break;
    }
  });

  // RGB
  Wire.begin();
  if (!rgb.begin(&Wire)) {
    Serial.println("sensor error");
    while (1) {
      led.toggle();
      delay(100);
    }
  }
  rgb.setTime(tcs_time_t::T24);
  rgb.setGain(tcs_gain_t::X16);

  Serial.println("setup end");
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

void loop() {
  ws.loop();
  if (!ws.connectedClients()) {
    static Tmr tmr(250);
    if (tmr) led.toggle();
  }

  btn.tick();
  if (btn.press()) sendColor(true);
  if (btn.holding()) {
    static Tmr tmr(100);
    if (tmr) sendColor(false);
  }
}